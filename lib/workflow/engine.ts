import { supabase, supabaseAdmin } from '@/lib/supabase'
import { OpenAI } from 'openai'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// Module-level set — tracks projectIds whose jobs are actively running in this process.
// Prevents the same project being double-submitted within the same Node.js instance.
const activeJobIds = new Set<string>()

export interface FilmProject {
  id: string
  user_id: string
  idea: string
  status: 'pending' | 'generating' | 'rendering' | 'completed' | 'failed'
  progress: number
  video_url?: string
  error_log?: string
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  description: string
  dialogue?: string
  visual_prompt: string
  audio_prompt?: string
  duration: number
}

export class WorkflowEngine {
  private openai: OpenAI
  private ollamaBaseUrl: string
  private ltxSidecarUrl: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'no-key',
      baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    })
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    this.ltxSidecarUrl = process.env.LTX_SIDECAR_URL || 'http://localhost:8081'
  }

  async generateFilm(projectId: string, existingScenes?: Scene[]): Promise<void> {
    // Concurrent job guard — reject if this project is already being processed
    if (activeJobIds.has(projectId)) {
      throw new Error(`A generation job is already running for project ${projectId}.`)
    }
    activeJobIds.add(projectId)

    // Declare buildDir here so the finally block can always reach it
    const buildDir = path.join(os.tmpdir(), `autofilm_${projectId}`)

    try {
      // Get project details
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError || !project) {
        throw new Error('Project not found')
      }

      // Check if user has enough credits
      await this.checkUserCredits(project.user_id)

      // Update status to generating
      await this.updateProjectStatus(projectId, 'generating', 10, project.user_id)

      // Step 1: Generate scenes from idea (if not provided)
      const scenes = existingScenes || await this.generateScenes(project.idea)
      await this.updateProjectStatus(projectId, 'generating', 30)

      // Setup Local Build Directory
      await fs.mkdir(buildDir, { recursive: true })

      // Step 2: Generate videos for each scene locally!
      const videoPaths = await this.generateSceneVideos(scenes, buildDir)
      await this.updateProjectStatus(projectId, 'generating', 70)

      // Step 3: Combine videos into final film locally!
      const finalVideoPath = await this.combineVideos(videoPaths, buildDir)
      await this.updateProjectStatus(projectId, 'rendering', 90)

      // Ensure the storage bucket exists before attempting the upload
      await this.ensureStorageBucket()

      // Step 4: Upload to Supabase Storage
      const publicUrl = await this.uploadToStorage(finalVideoPath, projectId)

      // Deduct credits from user
      await this.deductUserCredits(project.user_id)

      // Step 5: Mark as completed
      await this.updateProjectStatus(projectId, 'completed', 100, publicUrl)

    } catch (error) {
      console.error('Film generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.updateProjectStatus(projectId, 'failed', 0, undefined, errorMessage)
      throw error
    } finally {
      activeJobIds.delete(projectId)
      // Full cleanup — removes scene clips, ref images, concat list, and final video
      await fs.rm(buildDir, { recursive: true, force: true }).catch(err =>
        console.warn('[ENGINE] Failed to clean build directory:', err)
      )
    }
  }

  public async generateScenes(idea: string, style = 'Cinematic', mood = 'Epic', sceneCount = 4): Promise<Scene[]> {
    const prompt = `
[ROLE: WORLD-CLASS SCREENWRITER]
[MODEL: GEMMA-4-26B-MOE]
[TASK: ARCHITECT CINEMATIC NARRATIVE]

Input Idea: "${idea}"
Visual Style: ${style}
Narrative Mood: ${mood}

Generate a ${sceneCount}-scene audiovisual script. For each scene, provide:
1. Visual Prompt (LTX-2.3 optimized: textures, lighting, motion vectors, style: ${style})
2. Audio Prompt (LTX-2.3 optimized: ambient soundscapes, foley, atmospheric layers, mood: ${mood})
3. Directorial Notes (Camera movement, emotional arc)

Respond ONLY with a valid JSON array of scene objects. Each object must have:
- id (string, e.g. "scene_1")
- description (string)
- visual_prompt (string, detailed, LTX-optimized)
- audio_prompt (string)
- duration (number, in seconds, 3-7)
`

    // Attempt 1: Local Gemma 4 via Ollama (Primary — Free & Private)
    try {
        console.log('[GEMMA-4] Awakening local narrative agent...')
        const res = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemma4:26b',
                prompt: prompt,
                stream: false,
                format: 'json'
            }),
            signal: AbortSignal.timeout(120000), // 2 min timeout
        })
        
        if (res.ok) {
            const data = await res.json()
            console.log('[GEMMA-4] Script materialized with multimodal precision.')
            const parsed = JSON.parse(data.response)
            // Handle both {scenes:[...]} and [...] response shapes
            return Array.isArray(parsed) ? parsed : (parsed.scenes ?? parsed)
        }
    } catch (err) {
        console.log('[GEMMA-4] Local agent not found. Falling back to cloud protocols...')
    }

    try {
      // Attempt 2: OpenRouter Cloud Fallback (only if key is configured)
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
        const response = await this.openai.chat.completions.create({
          model: 'google/gemma-3-27b-it',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })

        const content = response.choices[0]?.message?.content
        if (content) {
          // Robust JSON extraction
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          return JSON.parse(jsonMatch ? jsonMatch[0] : content)
        }
      }
    } catch (error) {
      console.warn('OpenAI fallback failed.', error)
    }

    // Attempt 3: Procedural Script Matrix (Zero-dependency fallback)
    const proceduralTemplates = [
      { description: "The Genesis",  visual_prompt: `Cinematic wide shot of ${idea}, LTX-2.3 motion, high fidelity`,                  audio_prompt: `Deep cinematic bass, atmospheric wind, ${idea} ambient sounds` },
      { description: "The Conflict", visual_prompt: `Close up focus on ${idea}, intense temporal motion, dramatic contrast`,           audio_prompt: `Metallic clashing, rising orchestral tension, localized foley` },
      { description: "The Core",     visual_prompt: `Sub-surface scattering, macro detail of ${idea}, ethereal lighting`,             audio_prompt: `High-frequency shimmering, whisper-like ambient layers` },
      { description: "The Turning",  visual_prompt: `Medium shot, ${idea}, unexpected revelation, high-contrast shadows`,             audio_prompt: `Dissonant chord stab, silence, then ambient rebuild` },
      { description: "The Drift",    visual_prompt: `Slow tracking shot alongside ${idea}, warm bokeh, melancholic haze`,             audio_prompt: `Sparse piano notes, soft room tone, distant city sounds` },
      { description: "The Storm",    visual_prompt: `Wide angle, ${idea}, dynamic weather, kinetic energy, cinematic grain`,          audio_prompt: `Wind howl, thunder roll, tense percussive pulse` },
      { description: "The Quiet",    visual_prompt: `Extreme close-up of ${idea}, shallow depth of field, natural light`,            audio_prompt: `Near-silence, single sustained note, soft foley` },
      { description: "The Finale",   visual_prompt: `God-ray illumination over ${idea}, slow pull back, epic resolution`,            audio_prompt: `Grand orchestral crescendo, pure sonic clarity, resolution chords` },
    ]

    return Array.from({ length: sceneCount }, (_, i) => ({
      id: `scene_${i + 1}`,
      ...proceduralTemplates[i % proceduralTemplates.length],
      duration: 5,
    }))

  private async generateSceneVideos(scenes: Scene[], buildDir: string): Promise<string[]> {
    const videoPaths: string[] = []
    
    // LTX-2.3 Local Sidecar (Synchronized Audio/Video Engine)
    const LTX_ENGINE_URL = `${this.ltxSidecarUrl}/generate-av`

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      console.log(`[LTX-2.3] Producing Audiovisual Material for Scene ${i+1}/${scenes.length}`)
      
      try {
        const videoPath = path.join(buildDir, `scene_${i}.mp4`)
        const LOCAL_SIDECAR_URL = `${this.ltxSidecarUrl}/generate-video`

        // Attempt 1: Local LTX-2.3 Engine (The "Free & Real Hollywood" Method)
        try {
            const probe = await fetch(LTX_ENGINE_URL, { method: 'HEAD' }).catch(() => null)
            if (probe && probe.ok) {
                console.log(`  -> [LOCAL] LTX-2.3 Detected. Materializing synchronized A/V...`)
                const ltxRes = await fetch(LTX_ENGINE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: scene.visual_prompt,
                        audio_prompt: (scene as any).audio_prompt,
                        duration: 5,
                        resolution: "1080p"
                    })
                })
                
                if (ltxRes.ok) {
                    const ltxData = await ltxRes.json()
                    // LTX-2.3 usually returns a file path or a base64 buffer for the combined mp4
                    if (ltxData.file_path) {
                        await fs.copyFile(ltxData.file_path, videoPath)
                        videoPaths.push(videoPath)
                        console.log(`  -> [LOCAL] Scene ${i+1} A/V synthesis complete.`)
                        continue
                    }
                }
            }
        } catch (e) { /* LTX not ready */ }

        // 1. Image Synthesis (Always locally controlled fallback or Pollinations)
        const encodedPrompt = encodeURIComponent(`${scene.visual_prompt}, 8k resolution, cinematic quality, masterwork`)
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&nologo=true`
        
        const imageRes = await fetch(imageUrl)
        const imageBuffer = await imageRes.arrayBuffer()
        const imagePath = path.join(buildDir, `ref_${i}.jpg`)
        await fs.writeFile(imagePath, Buffer.from(imageBuffer))

        // 2. Cinematic Neural Fallback
        let finalVideoUrl: string | null = null

        // Attempt 1: Local Sidecar (True Local Movie)
        try {
            const sidecarCheck = await fetch(LOCAL_SIDECAR_URL, { method: 'HEAD' }).catch(() => null)
            if (sidecarCheck && sidecarCheck.ok) {
                console.log(`  -> [LOCAL] Local LTX/SVD Sidecar detected. Initiating local neural synthesis...`)
                const sidecarRes = await fetch(LOCAL_SIDECAR_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_path: imagePath, prompt: scene.visual_prompt })
                })
                if (sidecarRes.ok) {
                    const sidecarData = await sidecarRes.json()
                    if (sidecarData.video_path) {
                        // Copy local file
                        await fs.copyFile(sidecarData.video_path, videoPath)
                        videoPaths.push(videoPath)
                        continue
                    }
                }
            }
        } catch (e) { /* Sidecar not running */ }

        // Attempt 2: Cinematic Neural Layer (High-End Local FFmpeg — always available)
        console.log(`  -> [NEURAL LAYER] Synthesizing organic motion locally via FFmpeg...`)
            await new Promise<void>((resolve, reject) => {
                ffmpeg()
                  .input(imagePath)
                  .inputOptions(['-loop 1'])
                  .videoFilter([
                    // Ensure 1080p
                    'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080',
                    // Organic Hand-held Sway (Displacement/Transformation)
                    "zoompan=z='min(zoom+0.0005,1.2)':x='iw/2-(iw/zoom/2)+((random(0)*2-1)*3)':y='ih/2-(ih/zoom/2)+((random(0)*2-1)*3)':d=125:s=1920x1080",
                    // Motion Blur (simulates camera shutter)
                    'tblend=all_mode=average,framestep=2',
                    // Cinematic Grade
                    'curves=vintage',
                    // Temporal Smoothing (60fps interpolation)
                    'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsfm=1'
                  ])
                  .outputOptions([
                    '-c:v libx264',
                    '-preset slower',
                    '-crf 18',
                    '-pix_fmt yuv420p',
                    '-t 5'
                  ])
                  .on('end', () => resolve())
                  .on('error', (err) => reject(err))
                  .save(videoPath)
            })
            videoPaths.push(videoPath)
        
        console.log(`  -> Scene ${i+1} finalized.`)
        
      } catch (err) {
        console.error(`[ENGINE] Local production failed for scene ${i+1}:`, err)
        throw err
      }
    }

    return videoPaths
  }

  private async combineVideos(videoPaths: string[], buildDir: string): Promise<string> {
    try {
      const outputFilePath = path.join(buildDir, 'final_output.mp4')
      const concatFilePath = path.join(buildDir, 'concat_list.txt')
      
      // Create a concat list file (The most reliable FFmpeg merge method)
      // Format: file 'path/to/file'
      const concatContent = videoPaths
        .map(p => `file '${p.replace(/'/g, "'\\''")}'`)
        .join('\n')
      
      await fs.writeFile(concatFilePath, concatContent)
      console.log('[ENGINE] Manifest created, initiating final assembly...')
      
      return new Promise<string>((resolve, reject) => {
          ffmpeg()
            .input(concatFilePath)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions(['-c copy']) // Use copy since all inputs are identical format
            .on('end', () => {
               console.log('[ENGINE] Assembly complete.')
               resolve(outputFilePath)
            })
            .on('error', (err) => {
               console.error('[ENGINE] Assembly failed:', err)
               reject(new Error(`FFmpeg assembly failed: ${err.message}`))
            })
            .save(outputFilePath)
      })
    } catch (error) {
       console.error('[ENGINE] Final stage failure:', error)
       throw error
    }
  }

  private async checkUserCredits(userId: string): Promise<void> {
    const { data: userCredits, error } = await supabaseAdmin
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If user doesn't have credits record, create one with default credits
      await this.createUserCredits(userId)
      return
    }

    if (!userCredits || userCredits.credits < 1) {
      throw new Error('Insufficient credits. Please purchase more credits to generate films.')
    }
  }

  private async deductUserCredits(userId: string): Promise<void> {
    // First get current credits
    const { data: currentCredits, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (fetchError || !currentCredits) {
      console.error('Failed to fetch current credits:', fetchError)
      return
    }

    // Then update with decremented value
    const { error } = await supabaseAdmin
      .from('user_credits')
      .update({
        credits: currentCredits.credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to deduct credits:', error)
      // Don't throw here as the film was successfully generated
    }
  }

  private async createUserCredits(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('user_credits')
      .insert({
        user_id: userId,
        credits: 3, // Default free credits
      })

    if (error) {
      console.error('Failed to create user credits:', error)
    }
  }

  private async uploadToStorage(videoUrlOrPath: string, projectId: string): Promise<string> {
    try {
      let videoBlob: Blob;

      if (videoUrlOrPath.startsWith('http')) {
          // Download HTTP (if remote video api was used)
          const videoResponse = await fetch(videoUrlOrPath)
          if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.status}`)
          }
          const videoBuffer = await videoResponse.arrayBuffer()
          videoBlob = new Blob([videoBuffer], { type: 'video/mp4' })
      } else {
          // Read Local File (from local FFmpeg stitching)
          const fileBuffer = await fs.readFile(videoUrlOrPath)
          videoBlob = new Blob([fileBuffer], { type: 'video/mp4' })
      }

      // Create a unique filename
      const fileName = `films/${projectId}/final-film.mp4`

      // Upload to Supabase Storage using Admin key to bypass RLS
      const { error } = await supabaseAdmin.storage
        .from('videos')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4',
          upsert: true
        })

      if (error) {
        throw new Error(`Failed to upload video to storage: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('videos')
        .getPublicUrl(fileName)

      return publicUrl

    } catch (error) {
      console.error('Storage upload error:', error)
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async updateProjectStatus(
    projectId: string,
    status: FilmProject['status'],
    progress: number,
    videoUrl?: string,
    errorLog?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      progress,
      updated_at: new Date().toISOString(),
    }

    if (videoUrl) updateData.video_url = videoUrl
    if (errorLog) updateData.error_log = errorLog

    const { error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)

    if (error) {
      console.error('Failed to update project status:', error)
    }
  }

  /**
   * Ensures the 'videos' Supabase Storage bucket exists, creating it if necessary.
   * Called once per film generation before the first upload attempt.
   */
  private async ensureStorageBucket(): Promise<void> {
    const bucketName = 'videos'

    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    if (listError) {
      console.warn('[ENGINE] Could not list storage buckets — proceeding anyway:', listError.message)
      return
    }

    const exists = buckets?.some(b => b.name === bucketName)
    if (!exists) {
      console.log(`[ENGINE] Storage bucket '${bucketName}' not found — creating...`)
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 524288000, // 500 MB
      })
      if (createError) {
        // Treat "already exists" / "Duplicate" as success (harmless race condition)
        if (
          !createError.message.includes('already exists') &&
          !createError.message.includes('Duplicate')
        ) {
          throw new Error(`Failed to create storage bucket: ${createError.message}`)
        }
      } else {
        console.log(`[ENGINE] Storage bucket '${bucketName}' created successfully.`)
      }
    }
  }

  /**
   * Verifies that the bundled FFmpeg binary is present and executable.
   * Exposed as a static method so the API route can probe it at module load time.
   */
  static async checkFfmpegAvailable(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      const { stdout } = await execFileAsync(ffmpegInstaller.path, ['-version'])
      const version = stdout.split('\n')[0].trim()
      return { available: true, version }
    } catch (err) {
      return {
        available: false,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  /**
   * Returns true if the given user already has a project in a non-final state
   * (pending / generating / rendering). Used by the API route to prevent
   * double-submission.
   */
  async hasActiveJobForUser(userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'generating', 'rendering'])
      .limit(1)
      .maybeSingle()

    return !!data
  }

  async createProject(userId: string, idea: string): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        idea,
        status: 'pending',
        progress: 0,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return data.id
  }
}

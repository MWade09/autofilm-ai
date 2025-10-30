import { supabase, supabaseAdmin } from '@/lib/supabase'
import { OpenAI } from 'openai'

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
  duration: number
}

export class WorkflowEngine {
  private openai: OpenAI
  private json2VideoApiKey: string
  private json2VideoUrl: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
    })
    this.json2VideoApiKey = process.env.JSON2VIDEO_API_KEY!
    this.json2VideoUrl = process.env.JSON2VIDEO_API_URL || 'https://api.json2video.com'
  }

  async generateFilm(projectId: string): Promise<void> {
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

      // Step 1: Generate scenes from idea
      const scenes = await this.generateScenes(project.idea)
      await this.updateProjectStatus(projectId, 'generating', 30)

      // Step 2: Generate videos for each scene
      const videoUrls = await this.generateSceneVideos(scenes)
      await this.updateProjectStatus(projectId, 'generating', 70)

      // Step 3: Combine videos into final film
      const finalVideoUrl = await this.combineVideos(videoUrls)
      await this.updateProjectStatus(projectId, 'rendering', 90)

      // Step 4: Upload to Supabase Storage
      const publicUrl = await this.uploadToStorage(finalVideoUrl, projectId)

      // Deduct credits from user
      await this.deductUserCredits(project.user_id)

      // Step 5: Mark as completed
      await this.updateProjectStatus(projectId, 'completed', 100, publicUrl)

    } catch (error) {
      console.error('Film generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.updateProjectStatus(projectId, 'failed', 0, undefined, errorMessage)
      throw error
    }
  }

  private async generateScenes(idea: string): Promise<Scene[]> {
    const prompt = `
You are a professional screenwriter. Create a compelling 3-scene short film script from this idea: "${idea}"

Return a JSON array of scenes with this exact format:
[
  {
    "id": "scene_1",
    "description": "Brief scene description",
    "dialogue": "Character dialogue if any",
    "visual_prompt": "Detailed visual description for AI video generation",
    "duration": 5
  }
]

Guidelines:
- Exactly 3 scenes
- Each scene 4-6 seconds long
- Visual prompts should be cinematic and detailed
- Keep dialogue minimal and impactful
- Build a clear narrative arc
`

    const response = await this.openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Failed to generate scenes from OpenAI')
    }

    try {
      return JSON.parse(content)
    } catch {
      throw new Error('Invalid JSON response from OpenAI')
    }
  }

  private async generateSceneVideos(scenes: Scene[]): Promise<string[]> {
    // TODO: Implement Pika API integration
    // For now, return placeholder URLs
    const videoUrls: string[] = []

    for (const scene of scenes) {
      // Call Pika API with scene.visual_prompt
      // const videoUrl = await pikaApi.generateVideo(scene.visual_prompt)
      const videoUrl = `https://placeholder.com/video-${scene.id}.mp4`
      videoUrls.push(videoUrl)
    }

    return videoUrls
  }

  private async combineVideos(videoUrls: string[]): Promise<string> {
    // Create Json2Video specification to combine scene videos
    const json2VideoSpec = {
      resolution: "1080p",
      quality: "high",
      scenes: videoUrls.map((videoUrl, index) => ({
        id: `scene_${index + 1}`,
        type: "video",
        src: videoUrl,
        duration: 5, // Each scene is 5 seconds
        transition: index > 0 ? {
          type: "fade",
          duration: 0.5
        } : undefined
      })),
      output: {
        format: "mp4",
        resolution: "1920x1080",
        quality: "high"
      }
    }

    try {
      const response = await fetch(`${this.json2VideoUrl}/v2/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.json2VideoApiKey,
        },
        body: JSON.stringify(json2VideoSpec),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Json2Video API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const renderId = result.id

      // Poll for completion
      const finalVideoUrl = await this.pollJson2VideoRender(renderId)
      return finalVideoUrl

    } catch (error) {
      console.error('Json2Video API error:', error)
      throw new Error(`Failed to combine videos: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async pollJson2VideoRender(renderId: string): Promise<string> {
    const maxAttempts = 60 // 5 minutes with 5 second intervals
    const pollInterval = 5000 // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.json2VideoUrl}/v2/projects/${renderId}`, {
          headers: {
            'X-API-Key': this.json2VideoApiKey,
          },
        })

        if (!response.ok) {
          throw new Error(`Poll failed: ${response.status}`)
        }

        const result = await response.json()

        if (result.status === 'completed' && result.output_url) {
          return result.output_url
        } else if (result.status === 'failed') {
          throw new Error(`Render failed: ${result.error || 'Unknown error'}`)
        }

        // Still processing, wait and try again
        await new Promise(resolve => setTimeout(resolve, pollInterval))

      } catch (error) {
        console.error(`Poll attempt ${attempt + 1} failed:`, error)
        if (attempt === maxAttempts - 1) {
          throw error
        }
      }
    }

    throw new Error('Render timeout: Video combination took too long')
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

  private async uploadToStorage(videoUrl: string, projectId: string): Promise<string> {
    try {
      // Download the video from Json2Video
      const videoResponse = await fetch(videoUrl)
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status}`)
      }

      const videoBuffer = await videoResponse.arrayBuffer()
      const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' })

      // Create a unique filename
      const fileName = `films/${projectId}/final-film.mp4`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4',
          upsert: true
        })

      if (error) {
        throw new Error(`Failed to upload video to storage: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
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

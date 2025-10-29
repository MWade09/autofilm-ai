import { supabase } from '@/lib/supabase'
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

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateFilm(projectId: string): Promise<void> {
    try {
      // Update status to generating
      await this.updateProjectStatus(projectId, 'generating', 10)

      // Get project details
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error || !project) {
        throw new Error(`Project not found: ${error?.message || 'Unknown error'}`)
      }

      // Step 1: Generate scenes from idea
      const scenes = await this.generateScenes(project.idea)
      await this.updateProjectStatus(projectId, 'generating', 30)

      // Step 2: Generate videos for each scene
      const videoUrls = await this.generateSceneVideos(scenes)
      await this.updateProjectStatus(projectId, 'generating', 70)

      // Step 3: Combine videos into final film
      const finalVideoUrl = await this.combineVideos(videoUrls, projectId)
      await this.updateProjectStatus(projectId, 'rendering', 90)

      // Step 4: Upload to Supabase Storage
      const publicUrl = await this.uploadToStorage(finalVideoUrl, projectId)

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
      model: 'gpt-4',
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

  private async combineVideos(videoUrls: string[], projectId: string): Promise<string> {
    // TODO: Implement Json2Video API integration
    // Combine all scene videos into final film
    return `https://placeholder.com/final-${projectId}.mp4`
  }

  private async uploadToStorage(videoUrl: string, projectId: string): Promise<string> {
    // TODO: Download video from videoUrl and upload to Supabase Storage
    // Return public URL
    return `https://storage.supabase.co/${projectId}/film.mp4`
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

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)

    if (error) {
      console.error('Failed to update project status:', error)
    }
  }

  async createProject(userId: string, idea: string): Promise<string> {
    const { data, error } = await supabase
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

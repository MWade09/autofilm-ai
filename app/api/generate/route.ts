import { NextRequest, NextResponse } from 'next/server'
import { WorkflowEngine } from '@/lib/workflow/engine'
import { z } from 'zod'

const generateSchema = z.object({
  idea: z.string().min(10).max(500),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idea, action, scenes, projectId: existingProjectId, userId: bodyUserId, style, mood } = body
    const userId = bodyUserId || '00000000-0000-0000-0000-000000000000'

    // Create workflow engine
    const engine = new WorkflowEngine()

    if (action === 'draft') {
      const generatedScenes = await engine.generateScenes(idea, style, mood)
      return NextResponse.json({
        success: true,
        scenes: generatedScenes,
        message: 'Scenes drafted successfully!'
      })
    }

    // Default to 'start' or traditional behavior
    // Create project in database if not provided
    const projectId = existingProjectId || await engine.createProject(userId, idea)

    // Start async film generation
    setImmediate(async () => {
      try {
        await engine.generateFilm(projectId, scenes)
      } catch (error) {
        console.error('Background film generation failed:', error)
      }
    })

    return NextResponse.json({
      success: true,
      projectId,
      message: 'Film generation started! Check your dashboard for progress.'
    })

  } catch (error) {
    console.error('Generate API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

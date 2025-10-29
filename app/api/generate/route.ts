import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { WorkflowEngine } from '@/lib/workflow/engine'
import { z } from 'zod'

const generateSchema = z.object({
  idea: z.string().min(10).max(500),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { idea } = generateSchema.parse(body)

    // Create workflow engine
    const engine = new WorkflowEngine()

    // Create project in database
    const projectId = await engine.createProject(userId, idea)

    // Start async film generation
    // In production, you'd want to use a job queue like Bull or similar
    // For now, we'll run it synchronously (not recommended for production)
    setImmediate(async () => {
      try {
        await engine.generateFilm(projectId)
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

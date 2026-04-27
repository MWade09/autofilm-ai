import { NextRequest, NextResponse } from 'next/server'
import { WorkflowEngine } from '@/lib/workflow/engine'
import { z } from 'zod'

const generateSchema = z.object({
  idea: z.string().min(10).max(500),
})

// Probe FFmpeg once when this route module is first loaded by Next.js.
// The result is cached so individual requests pay no I/O cost.
let ffmpegReady: boolean | null = null
;(async () => {
  const check = await WorkflowEngine.checkFfmpegAvailable()
  ffmpegReady = check.available
  if (!check.available) {
    console.error('[AutoFilm] ⚠️  FFmpeg not available:', check.error)
    console.error('[AutoFilm] Video generation is DISABLED until FFmpeg is installed and the server is restarted.')
  } else {
    console.log('[AutoFilm] ✓ FFmpeg ready:', check.version)
  }
})()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idea, action, scenes, projectId: existingProjectId, userId: bodyUserId, style, mood, sceneCount } = body
    const userId = bodyUserId || '00000000-0000-0000-0000-000000000000'

    // Create workflow engine
    const engine = new WorkflowEngine()

    if (action === 'draft') {
      const generatedScenes = await engine.generateScenes(idea, style, mood, sceneCount)
      return NextResponse.json({
        success: true,
        scenes: generatedScenes,
        message: 'Scenes drafted successfully!'
      })
    }

    // Default to 'start' or traditional behavior

    // FFmpeg availability guard — return 503 with a clear message if FFmpeg isn't found
    if (ffmpegReady === false) {
      return NextResponse.json(
        { error: 'FFmpeg is not available on this server. Video generation is currently disabled. Please install FFmpeg and restart the server.' },
        { status: 503 }
      )
    }

    // Concurrent generation guard — prevent the same user from queuing two jobs at once
    if (await engine.hasActiveJobForUser(userId)) {
      return NextResponse.json(
        { error: 'You already have a film generating. Please wait for it to complete before starting a new one.' },
        { status: 429 }
      )
    }

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

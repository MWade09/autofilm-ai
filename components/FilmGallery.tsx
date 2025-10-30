'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Film, Download, ExternalLink, Loader2 } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import type { FilmProject } from '@/lib/workflow/engine'

export function FilmGallery() {
  const { user, isLoaded } = useUser()
  const [projects, setProjects] = useState<FilmProject[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        return
      }

      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchProjects()
    } else if (isLoaded && !user?.id) {
      setLoading(false)
    }
  }, [isLoaded, user?.id, fetchProjects])

  const getStatusColor = (status: FilmProject['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'generating':
      case 'rendering':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Don't render until Clerk is loaded to prevent hydration issues
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your films...</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Film className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No films yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first AI-generated film using the form on the left.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Films</h2>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg line-clamp-2">
                  {project.idea}
                </CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <CardDescription>
                Created {new Date(project.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {(project.status === 'generating' || project.status === 'rendering') && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {project.status === 'generating' ? 'Generating scenes...' : 'Rendering film...'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                </div>
              )}

              {project.status === 'completed' && project.video_url && (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={project.video_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                  </div>
                </div>
              )}

              {project.status === 'failed' && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Film generation failed. Please try again.
                  </p>
                  {project.error_log && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer">Error details</summary>
                      <pre className="text-xs mt-2 overflow-auto">
                        {project.error_log}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

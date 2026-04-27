'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Film, Download, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import type { FilmProject } from '@/lib/workflow/engine'
import { useAuth } from './AuthProvider'

export function FilmGallery() {
  const { userId } = useAuth()
  const [projects, setProjects] = useState<FilmProject[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', userId)
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
  }, [userId])

  useEffect(() => {
    fetchProjects()

    // Since we're not using Supabase Realtime (replication), we'll use a simple polling 
    // mechanism to check for updates while projects are in a non-final state.
    const interval = setInterval(() => {
      const hasActiveProjects = projects.some(p => 
        p.status === 'pending' || p.status === 'generating' || p.status === 'rendering'
      )
      
      // If we have active projects, or even if we don't, check periodically
      // Or we can just poll as long as the user is on the dashboard
      fetchProjects()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchProjects, projects.length, userId]) // Re-run if projects count or userId changes

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



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-purple-500" />
        </motion.div>
        <span className="text-gray-400 font-medium animate-pulse tracking-widest uppercase text-xs">Accessing Neural Archive...</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden rounded-3xl border border-white/5 bg-black/40 backdrop-blur-2xl p-12 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Film className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tight mb-3">YOUR ARCHIVE IS EMPTY</h3>
          <p className="text-gray-400 max-w-sm mb-8 font-light leading-relaxed">
            The portal awaits your first sequence. Materialize your vision using the control center.
          </p>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-8" />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter text-white">DISCOVERIES</h2>
        <div className="text-[10px] font-bold tracking-[0.2em] text-purple-500 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          Archive Active
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="relative group"
            >
              <Card className="overflow-hidden border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl transition-all duration-500 group-hover:border-purple-500/30">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-white tracking-tight line-clamp-2 leading-tight">
                        {project.idea}
                      </CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Materialized {new Date(project.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(project.status)} text-white border-0 shadow-lg px-3 py-1 text-[10px] font-black italic uppercase tracking-wider`}>
                      {project.status === 'generating' ? 'Materializing' : 
                       project.status === 'rendering' ? 'Compressing' : 
                       project.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {(project.status === 'generating' || project.status === 'rendering') && (
                    <div className="py-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase italic">
                          {project.status === 'generating' ? 'Neural Synthesis' : 'Final Alignment'}
                        </span>
                        <span className="text-xl font-black text-white italic">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                        />
                      </div>
                    </div>
                  )}

                  {project.status === 'completed' && project.video_url && (
                    <div className="space-y-6">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors duration-500">
                        <video
                          controls
                          className="w-full h-full object-cover"
                          src={project.video_url}
                        >
                          Neural tag unsupported.
                        </video>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl h-10 font-bold transition-all"
                        >
                          <Download className="h-4 w-4 mr-2 text-purple-400" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl h-10 font-bold transition-all"
                        >
                          <ExternalLink className="h-4 w-4 mr-2 text-blue-400" />
                          Broadcast
                        </Button>
                      </div>
                    </div>
                  )}

                  {project.status === 'failed' && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="font-bold text-xs uppercase tracking-widest italic">Signal Lost</p>
                      </div>
                      {project.error_log ? (
                        <p className="text-red-200/70 text-xs font-mono leading-relaxed break-words whitespace-pre-wrap">
                          {project.error_log}
                        </p>
                      ) : (
                        <p className="text-red-200/60 text-xs leading-relaxed">
                          The neural link could not be established. Please re-initialize sequence.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

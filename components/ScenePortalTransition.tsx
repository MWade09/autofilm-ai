'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Sparkles, Zap, Trash2, Edit3, Check, Plus, GripVertical, Play, Loader2 } from 'lucide-react'
import { Button } from './ui/button'

interface Scene {
  id: string
  description: string
  dialogue?: string
  visual_prompt: string
  duration: number
}

interface ScenePortalTransitionProps {
  initialScenes: Scene[]
  isVisible: boolean
  onComplete: (finalScenes: Scene[]) => void
}

export function ScenePortalTransition({ initialScenes, isVisible, onComplete }: ScenePortalTransitionProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSucking, setIsSucking] = useState(false)

  // Sync scenes when initialScenes change
  useEffect(() => {
    setScenes(initialScenes)
  }, [initialScenes])

  if (!isVisible || !scenes.length) return null

  const handleDelete = (id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id))
  }

  const handleEdit = (id: string, newDescription: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, description: newDescription } : s))
    setEditingId(null)
  }

  const handleAddScene = () => {
    const newScene: Scene = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'New cinematic moment...',
      visual_prompt: 'Cinematic wide shot, dramatic lighting, detailed textures',
      duration: 3
    }
    setScenes(prev => [...prev, newScene])
  }

  const startSynthesis = () => {
    setIsSucking(true)
    setTimeout(() => {
      onComplete(scenes)
    }, 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto pt-24 pb-12"
      >
        <div className="container mx-auto max-w-4xl px-4 flex flex-col items-center">
          {/* Directorial Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">
              <Sparkles className="w-3 h-3" /> Directorial Suite Active
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter">
              SCRIPT BLUEPRINT
            </h2>
            <p className="text-gray-400 max-w-md mx-auto font-light leading-relaxed">
              The neural engine has drafted your sequence. Refine the narrative flow before we materialize the final portal.
            </p>
          </motion.div>

          {/* Scene Reorder Area */}
          <div className="w-full space-y-4">
            <Reorder.Group axis="y" values={scenes} onReorder={setScenes} className="space-y-4">
              {scenes.map((scene, index) => (
                <Reorder.Item
                  key={scene.id}
                  value={scene}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <motion.div
                    className={`relative group bg-white/[0.03] border ${editingId === scene.id ? 'border-purple-500/50 bg-white/[0.05]' : 'border-white/5'} backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:border-white/10`}
                  >
                    <div className="flex items-start gap-6">
                      {/* Drag Handle & Index */}
                      <div className="flex flex-col items-center gap-4 py-1">
                        <GripVertical className="w-5 h-5 text-gray-600 cursor-grab active:cursor-grabbing group-hover:text-purple-500 transition-colors" />
                        <span className="text-2xl font-black italic text-gray-800 group-hover:text-purple-900 transition-colors">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 space-y-3">
                        {editingId === scene.id ? (
                          <div className="space-y-4">
                            <textarea
                              autoFocus
                              defaultValue={scene.description}
                              onBlur={(e) => handleEdit(scene.id, e.target.value)}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-xl p-4 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" className="text-purple-400" onClick={() => setEditingId(null)}>
                                <Check className="w-4 h-4 mr-2" /> Save Moment
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                              {scene.description}
                            </h3>
                            {scene.dialogue && (
                              <p className="text-purple-300/80 italic font-serif text-lg">
                                &ldquo;{scene.dialogue}&rdquo;
                              </p>
                            )}
                            <div className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 pt-2">
                              <span className="flex items-center gap-1.5"><Play className="w-3 h-3 text-purple-600" /> {scene.duration}s Sequence</span>
                              <span className="w-1 h-1 rounded-full bg-gray-800" />
                              <span>Dynamic Lighting</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(scene.id)}
                          className="h-10 w-10 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(scene.id)}
                          className="h-10 w-10 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {/* Add Scene Trigger */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleAddScene}
              className="w-full py-6 rounded-2xl border-2 border-dashed border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all group flex items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-white" />
              </div>
              <span className="font-black text-gray-500 group-hover:text-purple-400 uppercase tracking-widest text-xs italic">Append New Cinematic Sequence</span>
            </motion.button>
          </div>

          {/* Action Center */}
          <div className="sticky bottom-12 mt-16 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                size="lg"
                disabled={isSucking}
                onClick={startSynthesis}
                className="relative h-20 px-12 text-xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white border-0 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.4)] group overflow-hidden"
              >
                {isSucking ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    Initialize Synthesis & Enter Portal
                    <Zap className="ml-3 w-6 h-6 group-hover:scale-125 transition-transform" />
                  </>
                )}
                
                {/* Internal Glow Effect */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
              </Button>
            </motion.div>
            <p className="mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Warning: Synthesis process is irreversible once initiated</p>
          </div>

          {/* Background Distortion Overlay */}
          <AnimatePresence>
            {isSucking && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 5, opacity: 1 }}
                transition={{ duration: 2, ease: "circIn" }}
                className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
              >
                <div className="w-48 h-48 bg-purple-500 rounded-full blur-[100px] shadow-[0_0_200px_rgba(168,85,247,0.8)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

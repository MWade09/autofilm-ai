'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Zap } from 'lucide-react'
import { ScenePortalTransition } from './ScenePortalTransition'
import { PortalLoadingScreen } from './PortalLoadingScreen'
import { useAuth } from './AuthProvider'

interface IdeaFormProps {
  onRefresh?: () => void
}

export function IdeaForm({ onRefresh }: IdeaFormProps) {
  const { userId } = useAuth()
  const [idea, setIdea] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPortalActive, setIsPortalActive] = useState(false)
  const [portalText, setPortalText] = useState('')
  const [showSceneTransition, setShowSceneTransition] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([])

  interface Scene {
    id: string
    description: string
    dialogue?: string
    visual_prompt: string
    duration: number
  }
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idea.trim()) return

    // Start portal animation sequence
    setIsGenerating(true)
    setIsPortalActive(true)
    setPortalText(idea)
    setGenerationProgress(0)
    setGenerationStatus('Initializing...')

    try {
        setGenerationStatus('Analyzing your story with AI...')
        setGenerationProgress(20)

        // Step 1: Draft the scenes first
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea, action: 'draft', userId })
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to draft scenes')
        }

        const data = await res.json()
        setGeneratedScenes(data.scenes)
        setGenerationProgress(50)
        setGenerationStatus('Script drafted! Opening portal...')

        // Transition to scene display
        setTimeout(() => {
            setIsPortalActive(false)
            setPortalText('')
            setShowSceneTransition(true)
        }, 1500)
        
    } catch (error) {
        console.error('Generation failed:', error)
        alert('Failed to generate film: ' + (error instanceof Error ? error.message : String(error)))
        setIsGenerating(false)
        setIsPortalActive(false)
    }
  }

  const handleSceneTransitionComplete = async (finalScenes: Scene[]) => {
    setGeneratedScenes(finalScenes) // Sync the edited scenes back
    setShowSceneTransition(false)
    setShowLoadingScreen(true)
    setGenerationProgress(60)
    setGenerationStatus('Entering the production portal...')

    // Step 2: Trigger the actual video generation in the background with FINAL scenes
    try {
        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                idea, 
                action: 'start',
                scenes: finalScenes,
                userId
            })
        })
    } catch (err) {
        console.error('Failed to start production:', err)
    }

    // Simulate the UI progress of the rendering phase while the real backend renders it.
    const simulateProgress = () => {
      const steps = [
        { progress: 70, status: 'Materializing cinematic frames...', delay: 4000 },
        { progress: 85, status: 'Stitching time and space with FFmpeg...', delay: 5000 },
        { progress: 95, status: 'Finalizing in another galaxy...', delay: 4000 },
        { progress: 100, status: 'Portal closing! Film complete.', delay: 2000 },
      ]

      let currentStep = 0

      const nextStep = () => {
        if (currentStep < steps.length) {
          const step = steps[currentStep]
          setTimeout(() => {
            setGenerationProgress(step.progress)
            setGenerationStatus(step.status)
            currentStep++
            nextStep()
          }, step.delay)
        } else {
          // Complete workflow
          setTimeout(() => {
            setShowLoadingScreen(false)
            setIsGenerating(false)
            setGenerationProgress(0)
            setGenerationStatus('')
            if (onRefresh) onRefresh()
            alert('Backend generation initiated successfully! Check dashboard shortly once processing is complete.')
          }, 2000)
        }
      }

      nextStep()
    }

    simulateProgress()
  }

  const [style, setStyle] = useState('Cinematic')
  const [mood, setMood] = useState('Epic')

  return (
    <div className="relative">
      {/* Scene Transition Screen */}
      <ScenePortalTransition
        initialScenes={generatedScenes}
        isVisible={showSceneTransition}
        onComplete={handleSceneTransitionComplete}
      />

      {/* Loading Screen */}
      <PortalLoadingScreen
        isVisible={showLoadingScreen}
        progress={generationProgress}
        status={generationStatus}
      />

      {/* Portal Text Animation */}
      <AnimatePresence>
        {isPortalActive && portalText && (
          <motion.div
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0.1,
              y: -200,
              rotateZ: 720,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              type: "spring",
              stiffness: 100,
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <motion.div
              animate={{
                textShadow: [
                  "0 0 5px rgba(147, 51, 234, 0.5)",
                  "0 0 20px rgba(147, 51, 234, 0.8)",
                  "0 0 5px rgba(147, 51, 234, 0.5)",
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-md text-center"
            >
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
                className="text-white text-lg font-medium"
              >
                {portalText}
              </motion.p>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mt-4"
              >
                <Zap className="w-8 h-8 text-purple-400 mx-auto" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={isPortalActive ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{ duration: 1, repeat: isPortalActive ? Infinity : 0 }}
      >
        <Card className="backdrop-blur-2xl bg-black/40 border-white/5 shadow-2xl overflow-hidden rounded-3xl group">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 opacity-50" />
          
          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                 <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black italic tracking-tighter text-white">COMMAND CENTER</CardTitle>
                <CardDescription className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Neural Link Protocol 1.0</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
                  <Textarea
                    placeholder="Enter your narrative sequence... (e.g. A cybernetic detective uncovers a secret in a rainy neon city)"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="relative w-full h-48 bg-black/60 border-white/5 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/10 rounded-2xl p-6 text-lg font-light resize-none leading-relaxed transition-all"
                  />
                </div>

                {/* Narrative Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Visual Style</label>
                    <select 
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all font-bold"
                    >
                      <option className="bg-[#0a0a0a]">Cinematic Noir</option>
                      <option className="bg-[#0a0a0a]">Cyberpunk Edge</option>
                      <option className="bg-[#0a0a0a]">Ghibli Dream</option>
                      <option className="bg-[#0a0a0a]">IMAX Documentary</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Narrative Mood</label>
                    <select 
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all font-bold"
                    >
                      <option className="bg-[#0a0a0a]">Epic & Grand</option>
                      <option className="bg-[#0a0a0a]">Dark & Gritty</option>
                      <option className="bg-[#0a0a0a]">Whimsical</option>
                      <option className="bg-[#0a0a0a]">Ethereal</option>
                    </select>
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  disabled={isGenerating || !idea.trim()}
                  className="w-full h-16 text-lg font-black italic tracking-tighter uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white border-0 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] group overflow-hidden"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Neural Synthesis...
                    </div>
                  ) : (
                    <>
                      Initialize Sequence
                      <Zap className="ml-3 h-5 w-5 group-hover:scale-125 transition-transform" />
                    </>
                  )}
                  
                  {/* Subtle shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </motion.div>
            </form>
          </CardContent>
          
          <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural GPU Ready</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Est. Render: 8m</span>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

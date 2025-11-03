'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Zap } from 'lucide-react'
import { ScenePortalTransition } from './ScenePortalTransition'
import { PortalLoadingScreen } from './PortalLoadingScreen'

export function IdeaForm() {
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
    setIsPortalActive(true)
    setPortalText(idea)
    setGenerationProgress(0)
    setGenerationStatus('Initializing...')

    // Animate text being sucked into portal
    setTimeout(() => {
      setGenerationStatus('Analyzing your story...')
      setGenerationProgress(10)
    }, 1000)

    setTimeout(() => {
      setGenerationStatus('Connecting to AI...')
      setGenerationProgress(20)
    }, 1500)

    // Simulate scene generation (since we don't have Pika API yet)
    setTimeout(() => {
      setGenerationStatus('Generating scenes...')
      setGenerationProgress(30)

      // Mock scenes data
      const mockScenes = [
        {
          id: "scene_1",
          description: "A mysterious figure emerges from the shadows",
          dialogue: "What brings you to this forsaken place?",
          visual_prompt: "Dark alleyway at night, mysterious hooded figure in flowing cloak, dramatic lighting from a single street lamp, rain-slicked pavement reflecting neon signs",
          duration: 5
        },
        {
          id: "scene_2",
          description: "The chase begins through the city streets",
          visual_prompt: "Fast-paced action sequence, figure running through crowded urban streets, pursuing shadows in the background, dynamic camera movement",
          duration: 5
        },
        {
          id: "scene_3",
          description: "Revelation in the abandoned warehouse",
          dialogue: "I never thought it would end like this...",
          visual_prompt: "Dimly lit warehouse interior, dramatic confrontation, particles of dust in the air, shafts of light breaking through broken windows",
          duration: 5
        }
      ]

      setGeneratedScenes(mockScenes)
      setGenerationProgress(50)
      setGenerationStatus('Scenes generated!')

      // Transition to scene display
      setTimeout(() => {
        setIsPortalActive(false)
        setPortalText('')
        setShowSceneTransition(true)
      }, 2000)

    }, 3000)
  }

  const handleSceneTransitionComplete = () => {
    setShowSceneTransition(false)
    setShowLoadingScreen(true)
    setGenerationProgress(60)
    setGenerationStatus('Generating video clips...')

    // Simulate the rest of the workflow
    const simulateProgress = () => {
      const steps = [
        { progress: 70, status: 'Combining scenes...', delay: 2000 },
        { progress: 85, status: 'Finalizing video...', delay: 3000 },
        { progress: 95, status: 'Almost done...', delay: 2000 },
        { progress: 100, status: 'Complete!', delay: 1000 },
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
            alert('Film generation complete! (Mock workflow finished)')
          }, 2000)
        }
      }

      nextStep()
    }

    simulateProgress()
  }

  return (
    <div className="relative">
      {/* Scene Transition Screen */}
      <ScenePortalTransition
        scenes={generatedScenes}
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
          boxShadow: [
            "0 0 0 rgba(147, 51, 234, 0)",
            "0 0 30px rgba(147, 51, 234, 0.5)",
            "0 0 0 rgba(147, 51, 234, 0)"
          ]
        } : {}}
        transition={{ duration: 1, repeat: isPortalActive ? Infinity : 0 }}
      >
        <Card className="backdrop-blur-sm bg-black/20 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <motion.div
                animate={isPortalActive ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>
              Create Your Film
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter a story idea and watch AI create a Hollywood-style short film in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <motion.div
                  animate={isPortalActive ? {
                    scale: [1, 1.05, 1],
                    borderColor: ["rgba(147, 51, 234, 0.2)", "rgba(147, 51, 234, 0.8)", "rgba(147, 51, 234, 0.2)"]
                  } : {}}
                  transition={{ duration: 1, repeat: isPortalActive ? Infinity : 0 }}
                >
                  <Textarea
                    placeholder="e.g., A robot falls in love with a human in a futuristic city..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={6}
                    className="resize-none bg-black/30 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                    disabled={isGenerating || isPortalActive}
                  />
                </motion.div>
                <p className="text-sm text-gray-400 mt-2">
                  {idea.length}/500 characters
                </p>
              </div>

              <motion.div
                whileHover={!isGenerating && !isPortalActive ? { scale: 1.02 } : {}}
                whileTap={!isGenerating && !isPortalActive ? { scale: 0.98 } : {}}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0"
                  disabled={!idea.trim() || idea.length > 500 || isGenerating || isPortalActive}
                >
                  {isPortalActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="flex items-center"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Sending to Portal...
                    </motion.div>
                  ) : isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Film...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Film
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

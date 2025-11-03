'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'

interface Scene {
  id: string
  description: string
  dialogue?: string
  visual_prompt: string
  duration: number
}

interface ScenePortalTransitionProps {
  scenes: Scene[]
  isVisible: boolean
  onComplete: () => void
}

export function ScenePortalTransition({ scenes, isVisible, onComplete }: ScenePortalTransitionProps) {
  if (!isVisible || !scenes.length) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {/* Title */}
          <motion.h2
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white text-center"
          >
            Scenes Generated!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-purple-300 text-center max-w-md"
          >
            Watch as your story comes to life through the portal
          </motion.p>

          {/* Scene Cards Animation */}
          <div className="flex flex-col space-y-6 max-w-2xl w-full px-4">
            {scenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ x: -100, opacity: 0, scale: 0.8 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  x: 300,
                  opacity: 0,
                  scale: 0.5,
                  rotateZ: 45,
                }}
                transition={{
                  delay: 0.6 + index * 0.3,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100,
                }}
                className="relative"
              >
                {/* Scene Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6"
                >
                  {/* Scene Number Badge */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(147, 51, 234, 0)",
                        "0 0 20px rgba(147, 51, 234, 0.6)",
                        "0 0 0 rgba(147, 51, 234, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white text-sm font-bold rounded-full mb-4"
                  >
                    {index + 1}
                  </motion.div>

                  {/* Scene Description */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {scene.description}
                  </h3>

                  {/* Dialogue */}
                  {scene.dialogue && (
                  <p className="text-purple-200 italic mb-3">
                    &ldquo;{scene.dialogue}&rdquo;
                  </p>
                  )}

                  {/* Visual Prompt Preview */}
                  <div className="text-sm text-gray-300 bg-black/30 rounded p-3">
                    <span className="text-purple-400 font-medium">Visual:</span> {scene.visual_prompt.slice(0, 100)}...
                  </div>

                  {/* Duration */}
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                    <span>Duration: {scene.duration}s</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Portal Suck Animation */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    delay: 1.5 + index * 0.3,
                    duration: 1,
                    times: [0, 0.5, 1],
                  }}
                  className="absolute inset-0 rounded-lg border-2 border-purple-400"
                >
                  <motion.div
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: 2,
                    }}
                    className="absolute inset-0 bg-purple-500/20 rounded-lg flex items-center justify-center"
                  >
                    <Zap className="w-8 h-8 text-purple-300" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2 + scenes.length * 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Enter the Portal
          </motion.button>

          {/* Background Portal Effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

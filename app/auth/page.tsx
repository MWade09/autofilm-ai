'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PortalBackground } from '@/components/PortalBackground'
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Github } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Check your email to confirm your account!' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Authentication failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <PortalBackground />
      
      {/* Immersive Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 mb-8">
           <Link href="/">
             <div className="flex items-center gap-2 group cursor-pointer">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🎬</span>
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  AutoFilm AI
                </span>
             </div>
           </Link>
        </div>

        <Card className="backdrop-blur-2xl bg-black/40 border-white/10 shadow-2xl relative overflow-hidden">
          {/* Animated Glow Border */}
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-50 pointer-events-none rounded-xl"></div>
          
          <CardHeader className="text-center space-y-2 relative z-10">
            <CardTitle className="text-4xl font-black tracking-tight text-white italic">
              {isSignUp ? 'JOIN THE VISION' : 'WELCOME BACK'}
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg font-light">
              {isSignUp ? 'Create your cinematic legacy today.' : 'Your portal to creation awaits.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-lg mb-6 text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-14 rounded-xl transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-14 rounded-xl transition-all"
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white border-0 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] group overflow-hidden"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? 'Initialize Account' : 'Authenticate Access'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <Button variant="outline" className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                <Github className="mr-2 h-5 w-5" />
                Github Account
              </Button>
            </div>

            <p className="mt-8 text-center text-gray-500 text-sm">
              {isSignUp ? 'Already a visionary?' : 'New to AutoFilm?'}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </CardContent>
        </Card>

        {/* Floating elements for rich aesthetic */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-12 -top-12 text-6xl opacity-20 pointer-events-none"
        >
          🌌
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-12 -bottom-12 text-6xl opacity-20 pointer-events-none"
        >
          ✨
        </motion.div>
      </motion.div>
    </div>
  )
}

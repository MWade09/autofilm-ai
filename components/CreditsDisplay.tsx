'use client'

import { useState, useEffect } from 'react'
import { Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export function CreditsDisplay() {
  const { userId, user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchCredits = async () => {
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .single()

        if (error) throw error
        setCredits(data?.credits ?? 0)
      } catch (err) {
        console.error('Error fetching credits:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()

    // Subscribe to real-time credit updates
    const channel = supabase
      .channel('user_credits_display')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'user_credits', 
        filter: `user_id=eq.${userId}` 
      }, (payload) => {
        setCredits(payload.new.credits)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (!userId || !user) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
        <div className="h-3 w-12 bg-gray-800 rounded shadow-inner"></div>
      </div>
    )
  }

  const isLow = credits !== null && credits <= 1

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-500 overflow-hidden ${
        isLow 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      }`}
    >
      <div className="relative">
        <motion.div
          animate={isLow ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`h-2 w-2 rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]'}`}
        />
      </div>
      
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
          {credits} Energy
        </span>
      </div>

      <AnimatePresence>
        {isLow && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
          >
            <AlertTriangle className="h-3 w-3 text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background Flowing Gradient */}
      {!isLow && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
      )}
    </motion.div>
  )
}


'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { CreditCard, AlertTriangle } from 'lucide-react'


export function CreditsDisplay() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabaseAdmin
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching credits:', error)
        return
      }

      setCredits(data?.credits ?? 3) // Default to 3 credits
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchCredits()
    }
  }, [user?.id, fetchCredits])

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded"></div>
    )
  }

  const hasLowCredits = credits !== null && credits <= 1

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      hasLowCredits
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }`}>
      <CreditCard className={`h-4 w-4 ${
        hasLowCredits ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
      }`} />
      <span className={`text-sm font-medium ${
        hasLowCredits ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'
      }`}>
        {credits} {credits === 1 ? 'credit' : 'credits'}
      </span>
      {hasLowCredits && (
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      )}
    </div>
  )
}

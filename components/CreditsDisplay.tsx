'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { CreditCard, AlertTriangle } from 'lucide-react'


export function CreditsDisplay() {
  const { user, isLoaded } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found - user has no credits record yet
          setCredits(3) // Default credits
        } else {
          console.error('Error fetching credits:', error)
          setCredits(3) // Fallback to default
        }
      } else {
        setCredits(data?.credits ?? 3)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
      setCredits(3) // Fallback to default on any error
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchCredits()
    } else if (isLoaded && !user?.id) {
      setLoading(false)
    }
  }, [isLoaded, user?.id, fetchCredits])

  // Don't render anything until Clerk is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded"></div>
    )
  }

  // Don't show credits for unauthenticated users
  if (!user?.id) {
    return null
  }

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

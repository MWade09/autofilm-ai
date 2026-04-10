'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase handles the session exchange automatically on the client
      // when it sees the auth code in the URL.
      // We just need to wait a moment and then redirect.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/auth')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      <p className="text-gray-400 font-medium">Finalizing authentication...</p>
    </div>
  )
}

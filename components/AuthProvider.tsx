'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userId: string
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: '00000000-0000-0000-0000-000000000000',
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string>('00000000-0000-0000-0000-000000000000')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? '00000000-0000-0000-0000-000000000000')
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? '00000000-0000-0000-0000-000000000000')
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userId, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

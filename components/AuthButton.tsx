'use client'

import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'
import { LogIn, LogOut, User } from 'lucide-react'

export function AuthButton() {
  const { user, isLoading } = useAuth()

  const handleLogin = () => {
    window.location.href = '/auth'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (isLoading) return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
          <User className="w-4 h-4" />
          <span className="truncate max-w-[100px]">{user.email}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-gray-400 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogin}
      className="border-white/10 hover:bg-white/5 text-gray-300"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  )
}

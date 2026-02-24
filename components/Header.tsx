'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { LanguageSwitcher } from './language-switcher'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="absolute top-0 w-full flex justify-between items-center p-6 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Sambung <span className="text-primary font-serif italic">Ayat</span>
        </Link>
      </div>
      
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <ModeToggle />
        
        {user ? (
          <div className="flex gap-4 items-center bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
            <span className="text-sm font-medium hidden sm:inline-block">{user.email?.split('@')[0]}</span>
            <button 
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
            >
                Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Login to save
          </button>
        )}
      </div>
    </header>
  )
}

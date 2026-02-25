'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { LanguageSwitcher } from './language-switcher'
import { Trophy, User } from 'lucide-react'
import UserSettings from './UserSettings'

export default function Header() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
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
    <header className="absolute top-0 w-full flex justify-between items-center p-4 sm:p-6 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <Link href="/" className="text-lg sm:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity font-arabic">
            Sa<span className="text-primary font-serif">Ayat</span>
        </Link>
      </div>
      
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <ModeToggle />
        
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
             <Link 
                href="/leaderboard"
                className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                title="Leaderboard"
            >
                <Trophy className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
              title="Profil"
            >
              <User className="w-5 h-5" />
            </button>
            <div className="flex gap-2 sm:gap-4 items-center bg-background/80 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-border shadow-sm">
                <span className="text-sm font-medium hidden sm:inline-block">{user.email?.split('@')[0]}</span>
                <button 
                    onClick={handleLogout}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
                >
                    Logout
                </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-4 py-1.5 sm:px-5 sm:py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Login
          </button>
        )}
      </div>

      {/* User Settings Modal */}
      {showSettings && user && (
        <UserSettings 
          user={user} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </header>
  )
}

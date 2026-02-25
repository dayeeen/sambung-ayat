"use client"

import { useState, useEffect } from 'react'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const [lang, setLang] = useState('ID')
  const [isOpen, setIsOpen] = useState(false)

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language')
    if (savedLang) {
      setLang(savedLang)
    }
  }, [])

  const toggleLanguage = (newLang: string) => {
    const lowerLang = newLang.toLowerCase()
    setLang(newLang)
    localStorage.setItem('app-language', lowerLang)
    setIsOpen(false)
    window.dispatchEvent(new Event('language-change'))
  }

  return (
    <div className="relative group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted/80 transition-all text-sm font-medium border border-transparent hover:border-border"
      >
        <Languages className="w-4 h-4 text-muted-foreground" />
        <span>{lang}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-32 bg-popover text-popover-foreground rounded-xl shadow-lg border border-border p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => toggleLanguage('ID')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                lang === 'ID' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
              }`}
            >
              <span>Indonesia</span>
              {lang === 'ID' && <span className="text-xs">✓</span>}
            </button>
            <button
              onClick={() => toggleLanguage('EN')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                lang === 'EN' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
              }`}
            >
              <span>English</span>
              {lang === 'EN' && <span className="text-xs">✓</span>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

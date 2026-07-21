'use client';

import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

const IslamicPattern = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 0 L20 40 M0 20 L40 20" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  </div>
);

export default function Maintenance() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground transition-colors duration-500 overflow-hidden relative justify-center items-center">
      <IslamicPattern />

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/10 rounded-full blur-[80px] sm:blur-[120px] -z-10" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 w-full animate-in fade-in zoom-in duration-700">
        <div className="max-w-2xl w-full space-y-8 flex flex-col items-center">

          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-background border border-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10 relative overflow-hidden">
              <Settings className="w-12 h-12 sm:w-16 sm:h-16 animate-[spin_4s_linear_infinite]" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground font-arabic leading-tight">
              Sedang <span className="text-primary font-serif italic relative inline-block">
                Perbaikan
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"></span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-serif">
              Kami sedang melakukan pembaruan sistem untuk memberikan pengalaman yang lebih baik.
            </p>
          </div>

          <div className="inline-flex flex-col items-center gap-3 mt-8">
            <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium tracking-wide">
              Mohon bersabar, insyaAllah segera kembali 🤍
            </div>
          </div>

        </div>
      </main>

      <footer className="absolute bottom-8 text-center text-sm text-muted-foreground/60 w-full">
        <p>© {new Date().getFullYear()} Sambung Ayat</p>
      </footer>
    </div>
  );
}

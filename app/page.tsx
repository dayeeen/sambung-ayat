'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Surah {
  id: number;
  name: string;
  englishName: string;
}

export default function Home() {
  const router = useRouter();
  const [showJuzSelection, setShowJuzSelection] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<string>('all');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [mode, setMode] = useState<'all' | 'single' | 'range'>('all');

  useEffect(() => {
    if (selectedJuz) {
      fetchSurahs(selectedJuz);
    } else {
      setSurahs([]);
    }
  }, [selectedJuz]);

  const fetchSurahs = async (juz: number) => {
    setLoadingSurahs(true);
    try {
      const res = await fetch(`/api/surahs?juz=${juz}`);
      if (res.ok) {
        const data = await res.json();
        setSurahs(data);
      }
    } catch (error) {
      console.error('Failed to fetch surahs', error);
    } finally {
      setLoadingSurahs(false);
    }
  };

  const handleStartPractice = () => {
    if (!selectedJuz) return;

    let url = `/practice?juz=${selectedJuz}`;
    
    if (mode === 'single' && selectedSurah !== 'all') {
      url += `&surah=${selectedSurah}`;
    } else if (mode === 'range' && rangeStart && rangeEnd) {
      url += `&surah=${rangeStart}-${rangeEnd}`;
    }

    router.push(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-20 text-center">
        <div className="max-w-4xl w-full space-y-12 animate-fade-in flex flex-col items-center">
          
          {/* Hero Section */}
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium tracking-wide mb-4">
              ✨ Beta Release
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground">
              Sambung <span className="text-primary font-serif italic">Ayat</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A calm, focused space to practice your Qur'an memorization. 
              <br className="hidden sm:block" />
              Continue the verse, test your recall, find peace.
            </p>
          </div>

          {/* CTA Section */}
          <div className="w-full flex flex-col items-center justify-center pt-8">
            {!showJuzSelection ? (
              <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in zoom-in duration-300">
                <Link
                  href="/practice"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium tracking-wide shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 min-w-[200px]"
                >
                  Start Random
                  <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">→</span>
                </Link>
                
                <button
                  onClick={() => setShowJuzSelection(true)}
                  className="px-8 py-4 bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 rounded-full text-lg font-medium transition-all duration-300 min-w-[200px]"
                >
                  Select Juz
                </button>
              </div>
            ) : (
              <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                
                {!selectedJuz ? (
                    // Juz Selection Grid
                    <>
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-xl font-medium text-foreground">Select a Juz to Practice</h3>
                            <button 
                            onClick={() => setShowJuzSelection(false)} 
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <span>✕</span> Close
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                                <button 
                                    key={juz} 
                                    onClick={() => setSelectedJuz(juz)}
                                    className="aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface border border-border hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-200 group"
                                >
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest group-hover:text-primary/70">Juz</span>
                                    <span className="text-2xl font-bold text-foreground group-hover:text-primary">{juz}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    // Surah Configuration for Selected Juz
                    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-8 text-left w-full max-w-2xl mx-auto shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-semibold text-foreground">Configure Juz {selectedJuz}</h3>
                                <p className="text-muted-foreground">Customize your practice session</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedJuz(null);
                                    setMode('all');
                                    setSelectedSurah('all');
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                            >
                                Change Juz
                            </button>
                        </div>

                        {loadingSurahs ? (
                            <div className="py-12 text-center text-muted-foreground animate-pulse">
                                Loading Surah details...
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Mode Selection */}
                                <div className="flex p-1 bg-muted/50 rounded-xl">
                                    <button 
                                        onClick={() => setMode('all')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Full Juz
                                    </button>
                                    <button 
                                        onClick={() => setMode('single')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'single' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Specific Surah
                                    </button>
                                    <button 
                                        onClick={() => setMode('range')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'range' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Surah Range
                                    </button>
                                </div>

                                {/* Dynamic Inputs based on Mode */}
                                <div className="min-h-[100px] flex flex-col justify-center">
                                    {mode === 'all' && (
                                        <p className="text-center text-muted-foreground">
                                            Practice all verses in Juz {selectedJuz}.
                                        </p>
                                    )}

                                    {mode === 'single' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Select Surah</label>
                                            <select 
                                                value={selectedSurah}
                                                onChange={(e) => setSelectedSurah(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            >
                                                <option value="all" disabled>Choose a Surah...</option>
                                                {surahs.map(surah => (
                                                    <option key={surah.id} value={surah.id}>
                                                        {surah.id}. {surah.englishName} ({surah.name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {mode === 'range' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Start Surah</label>
                                                <select 
                                                    value={rangeStart}
                                                    onChange={(e) => setRangeStart(e.target.value)}
                                                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                >
                                                    <option value="" disabled>Start</option>
                                                    {surahs.map(surah => (
                                                        <option key={surah.id} value={surah.id}>
                                                            {surah.id}. {surah.englishName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">End Surah</label>
                                                <select 
                                                    value={rangeEnd}
                                                    onChange={(e) => setRangeEnd(e.target.value)}
                                                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                >
                                                    <option value="" disabled>End</option>
                                                    {surahs.map(surah => (
                                                        <option key={surah.id} value={surah.id} disabled={rangeStart ? surah.id < parseInt(rangeStart) : false}>
                                                            {surah.id}. {surah.englishName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleStartPractice}
                                    disabled={
                                        (mode === 'single' && selectedSurah === 'all') ||
                                        (mode === 'range' && (!rangeStart || !rangeEnd))
                                    }
                                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Start Practice
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
              </div>
            )}
          </div>

          {/* Features Grid (Subtle) */}
          {!showJuzSelection && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto text-sm text-muted-foreground animate-in fade-in delay-200">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                  📖
                </div>
                <h3 className="font-semibold text-foreground">Verse by Verse</h3>
                <p>Practice continuously with instant feedback on your recitation recall.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                  🧠
                </div>
                <h3 className="font-semibold text-foreground">Active Recall</h3>
                <p>Strengthen your memory by actively retrieving the next ayah.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                  🌿
                </div>
                <h3 className="font-semibold text-foreground">Distraction Free</h3>
                <p>No ads, no points, no leaderboards. Just you and the Qur'an.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground/60">
        <p>© {new Date().getFullYear()} Sambung Ayat. Built with intention.</p>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Surah {
  id: number;
  name: string;
  englishName: string;
}

const uiText = {
  id: {
    title: 'Sambung',
    subtitle: 'Latihan Hafalan Al-Qur\'an',
    verse: '"Dan Kami telah memudahkan Al-Qur\'an untuk pelajaran, maka adakah orang yang mau mengambil pelajaran?"',
    startPractice: 'Mulai Latihan',
    selectJuz: 'Pilih Juz',
    settings: 'Pengaturan Latihan',
    questionCount: 'Jumlah Soal',
    questions: 'Soal',
    close: 'Tutup',
    juz: 'Juz',
    chooseJuz: 'Pilih Juz',
    chooseJuzDesc: 'Pilih juz yang ingin antum latih',
    configJuz: 'Konfigurasi Juz',
    configJuzDesc: 'Sesuaikan sesi latihan antum',
    changeJuz: 'Ganti Juz',
    loadingSurahs: 'Memuat data surah...',
    modeAll: 'Satu Juz Penuh',
    modeSingle: 'Per Surah',
    modeRange: 'Rentang Surah',
    modeAllDesc: 'Antum akan diuji dari seluruh ayat dalam Juz',
    selectSurah: 'Pilih Surah',
    startSurah: 'Mulai Surah',
    endSurah: 'Sampai Surah',
    start: 'Mulai',
    feature1Title: 'Ayat per Ayat',
    feature1Desc: 'Latihan berkesinambungan dengan umpan balik instan pada hafalan antum.',
    feature2Title: 'Active Recall',
    feature2Desc: 'Perkuat ingatan dengan secara aktif mengingat kelanjutan ayat.',
    feature3Title: 'Fokus Ibadah',
    feature3Desc: 'Tanpa iklan, desain minimalis. Hanya antum dan Al-Qur\'an.',
    footer: 'Dibuat dengan niat tulus.',
    beta: 'Rilis Beta'
  },
  en: {
    title: 'Connect',
    subtitle: 'Qur\'an Memorization Practice',
    verse: '"And We have certainly made the Qur\'an easy for remembrance, so is there any who will remember?"',
    startPractice: 'Start Practice',
    selectJuz: 'Select Juz',
    settings: 'Practice Settings',
    questionCount: 'Question Count',
    questions: 'Questions',
    close: 'Close',
    juz: 'Juz',
    chooseJuz: 'Select Juz',
    chooseJuzDesc: 'Select the juz you want to practice',
    configJuz: 'Juz Configuration',
    configJuzDesc: 'Customize your practice session',
    changeJuz: 'Change Juz',
    loadingSurahs: 'Loading surahs...',
    modeAll: 'Full Juz',
    modeSingle: 'Per Surah',
    modeRange: 'Surah Range',
    modeAllDesc: 'You will be tested on all verses in Juz',
    selectSurah: 'Select Surah',
    startSurah: 'Start Surah',
    endSurah: 'End Surah',
    start: 'Start',
    feature1Title: 'Verse by Verse',
    feature1Desc: 'Continuous practice with instant feedback on your memorization.',
    feature2Title: 'Active Recall',
    feature2Desc: 'Strengthen memory by actively recalling the next verse.',
    feature3Title: 'Focus on Worship',
    feature3Desc: 'No ads, minimalist design. Just you and the Qur\'an.',
    footer: 'Made with sincere intentions.',
    beta: 'Beta Release'
  }
};

// Komponen Pattern Geometris Islami
const IslamicPattern = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M20 0 L20 40 M0 20 L40 20" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  </div>
);

// Komponen Bismillah Kaligrafi
const Bismillah = () => (
  <div className="text-2xl sm:text-3xl font-arabic text-primary/80 mb-6 animate-fade-in">
    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
  </div>
);

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [showJuzSelection, setShowJuzSelection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<string>('all');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [mode, setMode] = useState<'all' | 'single' | 'range'>('all');
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = uiText[language];

  useEffect(() => {
    const updateLang = () => {
      const storedLang = localStorage.getItem('app-language') as 'id' | 'en';
      if (storedLang) setLanguage(storedLang.toLowerCase() as 'id' | 'en');
    };

    updateLang();
    window.addEventListener('language-change', updateLang);
    return () => window.removeEventListener('language-change', updateLang);
  }, []);

  // Persist question limit
  useEffect(() => {
    const storedLimit = localStorage.getItem('questionLimit');
    if (storedLimit) {
      setQuestionLimit(parseInt(storedLimit));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('questionLimit', questionLimit.toString());
    }
  }, [questionLimit, isLoaded]);

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
    let url = selectedJuz ? `/practice?juz=${selectedJuz}` : '/practice?';

    if (mode === 'single' && selectedSurah !== 'all') {
      url += `&surah=${selectedSurah}`;
    } else if (mode === 'range' && rangeStart && rangeEnd) {
      url += `&surah=${rangeStart}-${rangeEnd}`;
    }
    
    url += `&limit=${questionLimit}`;

    router.push(url);
  };

  const QuestionLimitSlider = () => (
    <div className="space-y-4 py-2">
        <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-muted-foreground">
                {t.questionCount}
            </label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 min-w-[4rem] text-center">
                {questionLimit} {t.questions}
            </span>
        </div>
        
        <div className="relative w-full h-6 flex items-center select-none touch-none">
            {/* Hidden Native Input for accessibility and interaction */}
            <input 
                type="range" 
                min="1" 
                max="20" 
                step="1"
                value={questionLimit}
                onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
                className="w-full absolute z-20 opacity-0 cursor-pointer h-full inset-0"
            />
            
            {/* Custom Track Background */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative z-10">
                 {/* Fill */}
                 <div 
                    className="h-full bg-primary transition-all duration-75 ease-out"
                    style={{ width: `${((questionLimit - 1) / 19) * 100}%` }}
                 />
            </div>
            
            {/* Custom Thumb */}
            <div 
                className="absolute h-5 w-5 bg-background border-2 border-primary rounded-full shadow-lg shadow-primary/20 z-10 pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
                style={{ left: `calc(${((questionLimit - 1) / 19) * 100}% - 10px)` }}
            >
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground/60 px-1 font-mono uppercase tracking-wider">
            <span>1</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden overflow-y-auto relative">
      <IslamicPattern />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-12 sm:p-20 text-center relative z-10 w-full min-h-full">
        <div className="max-w-4xl w-full space-y-8 sm:space-y-12 animate-fade-in flex flex-col items-center my-auto">
          
          {/* Hero Section */}
          <div className="space-y-6 sm:space-y-8 max-w-3xl relative w-full px-4 sm:px-0">
            {/* Decorative Element Top */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

            <Bismillah />
            
            <div className="space-y-2">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs sm:text-sm font-medium tracking-wide mb-4">
                    ✨ {t.beta}
                </div>
              <h1 className="text-4xl sm:text-7xl font-bold tracking-tight text-foreground font-arabic leading-tight">
                {t.title} <span className="text-primary font-serif italic relative inline-block">
                  Ayat
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"></span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary/60 font-semibold mt-4">
                {t.subtitle}
              </p>
            </div>
            
            <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-serif px-2">
              {t.verse}
              <br/>
              <span className="text-xs sm:text-sm italic mt-2 block opacity-70">(QS. Al-Qamar: 17)</span>
            </p>
          </div>

          {/* CTA Section */}
          <div className="w-full flex flex-col items-center justify-center pt-4 px-4 sm:px-0">
            {!showJuzSelection && !showSettings ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-in fade-in zoom-in duration-500 w-full max-w-md mx-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="group relative w-full sm:flex-1 inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-full text-base sm:text-lg font-medium tracking-wide shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative">{t.startPractice}</span>
                  <span className="relative opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">→</span>
                </button>
                
                <button
                  onClick={() => setShowJuzSelection(true)}
                  className="w-full sm:flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/30 rounded-full text-base sm:text-lg font-medium transition-all duration-300 hover:bg-primary/5"
                >
                  {t.selectJuz}
                </button>
              </div>
            ) : showSettings ? (
                // Settings Modal / Card
                <div className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-10 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-serif text-foreground">{t.settings}</h3>
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                        >
                            ✕ {t.close}
                        </button>
                    </div>
                    
                    <div className="space-y-8">
                        <QuestionLimitSlider />
                        
                        <button
                            onClick={handleStartPractice}
                            className="w-full py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl text-lg font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.99]"
                        >
                            {t.startPractice}
                        </button>
                    </div>
                </div>
            ) : (
              <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8 bg-card/80 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-10 shadow-xl shadow-primary/5">
                
                {!selectedJuz ? (
                    // Juz Selection Grid
                    <>
                        <div className="flex justify-between items-center border-b border-border/50 pb-6">
                            <div>
                                <h3 className="text-2xl font-serif text-foreground">{t.chooseJuz}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{t.chooseJuzDesc}</p>
                            </div>
                            <button 
                            onClick={() => setShowJuzSelection(false)} 
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-destructive/10"
                            >
                                <span>✕</span> {t.close}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4 py-4">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                                <button 
                                    key={juz} 
                                    onClick={() => setSelectedJuz(juz)}
                                    className="aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl bg-background border border-border hover:border-primary hover:bg-primary/5 hover:scale-110 active:scale-95 transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-2xl transition-all duration-300"></div>
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary/70 font-medium">{t.juz}</span>
                                    <span className="text-2xl font-bold font-serif text-foreground group-hover:text-primary">{juz}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    // Surah Configuration for Selected Juz
                    <div className="space-y-8 text-left w-full max-w-2xl mx-auto">
                        <div className="flex justify-between items-start border-b border-border/50 pb-6">
                            <div>
                                <h3 className="text-2xl font-serif text-foreground">{t.configJuz} {selectedJuz}</h3>
                                <p className="text-muted-foreground mt-1">{t.configJuzDesc}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedJuz(null);
                                    setMode('all');
                                    setSelectedSurah('all');
                                }}
                                className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
                            >
                                {t.changeJuz}
                            </button>
                        </div>

                        {loadingSurahs ? (
                            <div className="py-12 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                {t.loadingSurahs}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Mode Selection */}
                                <div className="flex p-1.5 bg-muted/30 rounded-2xl border border-border/50">
                                    <button 
                                        onClick={() => setMode('all')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'all' ? 'bg-background shadow-md text-primary font-bold ring-1 ring-border' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                                    >
                                        {t.modeAll}
                                    </button>
                                    <button 
                                        onClick={() => setMode('single')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'single' ? 'bg-background shadow-md text-primary font-bold ring-1 ring-border' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                                    >
                                        {t.modeSingle}
                                    </button>
                                    <button 
                                        onClick={() => setMode('range')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'range' ? 'bg-background shadow-md text-primary font-bold ring-1 ring-border' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                                    >
                                        {t.modeRange}
                                    </button>
                                </div>

                                {/* Dynamic Inputs based on Mode */}
                                <div className="min-h-[120px] flex flex-col justify-center bg-muted/20 rounded-2xl p-6 border border-border/30">
                                    {mode === 'all' && (
                                        <div className="text-center space-y-2">
                                            <p className="text-lg font-serif text-foreground">{t.modeAll}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t.modeAllDesc} {selectedJuz}.
                                            </p>
                                        </div>
                                    )}

                                    {mode === 'single' && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-foreground block pl-1">{t.selectSurah}</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedSurah}
                                                    onChange={(e) => setSelectedSurah(e.target.value)}
                                                    className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="all" disabled>{t.selectSurah}...</option>
                                                    {surahs.map(surah => (
                                                        <option key={surah.id} value={surah.id}>
                                                            {surah.id}. {surah.englishName} ({surah.name})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'range' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-foreground block pl-1">{t.startSurah}</label>
                                                <div className="relative">
                                                    <select 
                                                        value={rangeStart}
                                                        onChange={(e) => setRangeStart(e.target.value)}
                                                        className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>{t.start}</option>
                                                        {surahs.map(surah => (
                                                            <option key={surah.id} value={surah.id}>
                                                                {surah.id}. {surah.englishName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                        ▼
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-foreground block pl-1">{t.endSurah}</label>
                                                <div className="relative">
                                                    <select 
                                                        value={rangeEnd}
                                                        onChange={(e) => setRangeEnd(e.target.value)}
                                                        className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>{t.close}</option>
                                                        {surahs.map(surah => (
                                                            <option key={surah.id} value={surah.id} disabled={rangeStart ? surah.id < parseInt(rangeStart) : false}>
                                                                {surah.id}. {surah.englishName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                        ▼
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {((mode === 'all') || (mode === 'single' && selectedSurah !== 'all') || (mode === 'range' && rangeStart && rangeEnd)) && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <QuestionLimitSlider />
                                    </div>
                                )}

                                <button
                                    onClick={handleStartPractice}
                                    disabled={
                                        (mode === 'single' && selectedSurah === 'all') ||
                                        (mode === 'range' && (!rangeStart || !rangeEnd))
                                    }
                                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                                >
                                    {t.startPractice}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
              </div>
            )}
          </div>

          {/* Features Grid (Subtle) */}
          {!showJuzSelection && !showSettings && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto text-sm text-muted-foreground animate-in fade-in delay-200">
              <div className="group space-y-3 p-4 rounded-2xl hover:bg-card/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📖</span>
                </div>
                <h3 className="font-serif text-lg text-foreground">{t.feature1Title}</h3>
                <p>{t.feature1Desc}</p>
              </div>
              <div className="group space-y-3 p-4 rounded-2xl hover:bg-card/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-serif text-lg text-foreground">{t.feature2Title}</h3>
                <p>{t.feature2Desc}</p>
              </div>
              <div className="group space-y-3 p-4 rounded-2xl hover:bg-card/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="font-serif text-lg text-foreground">{t.feature3Title}</h3>
                <p>{t.feature3Desc}</p>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground/60 relative z-10">
        <p>© {new Date().getFullYear()} Sambung Ayat. {t.footer}</p>
      </footer>
    </div>
  );
}
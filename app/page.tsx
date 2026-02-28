'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

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
    autoplayAudio: 'Autoplay Audio',
    allSurahs: 'Semua Surah',
    close: 'Tutup',
    juz: 'Juz',
    chooseJuz: 'Pilih Juz',
    chooseJuzDesc: 'Pilih satu atau lebih juz yang ingin antum latih',
    configJuz: 'Juz yang dipilih:',
    resetJuz: 'Reset Juz',
    loadingSurahs: 'Memuat data surah...',
    modeAll: 'Satu Juz Penuh',
    modeSingle: 'Per Surah',
    modeRange: 'Rentang Surah',
    modeAllDesc: 'Antum akan diuji dari seluruh ayat dalam Juz',
    selectSurah: 'Pilih Surah',
    selectSurahDesc: 'Pilih satu atau lebih surah',
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
    beta: 'Rilis Beta',
    ver: 'Versi 1.0.0'
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
    autoplayAudio: 'Autoplay Audio',
    allSurahs: 'All Surahs',
    close: 'Close',
    juz: 'Juz',
    chooseJuz: 'Select Juz',
    chooseJuzDesc: 'Select one or more juz to practice',
    configJuz: 'Selected Juz',
    resetJuz: 'Reset Juz',
    loadingSurahs: 'Loading surahs...',
    modeAll: 'Full Juz',
    modeSingle: 'Per Surah',
    modeRange: 'Surah Range',
    modeAllDesc: 'You will be tested on all verses in Juz',
    selectSurah: 'Select Surah',
    selectSurahDesc: 'Select one or more surahs',
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
    beta: 'Beta Release',
    ver: 'Version 1.0.0'
  }
};

// Komponen Pattern Geometris Islami
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

// Komponen Bismillah Kaligrafi
const Bismillah = () => (
  <div className="text-2xl sm:text-3xl font-arabic text-primary/80 mb-6 animate-fade-in">
    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
  </div>
);

const QuestionLimitSlider = ({
  t,
  questionLimit,
  setQuestionLimit
}: {
  t: typeof uiText.id,
  questionLimit: number,
  setQuestionLimit: (limit: number) => void
}) => (
  <div className="space-y-4 py-2">
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-muted-foreground">
        {t.questionCount}
      </label>
      <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 min-w-[4rem] text-center">
        {questionLimit} {t.questions}
      </span>
    </div>

    <div className="flex items-center gap-4">
      <button
        onClick={() => setQuestionLimit(Math.max(1, questionLimit - 1))}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        aria-label="Decrease question limit"
      >
        -
      </button>
      <div className="relative w-full h-6 flex items-center select-none touch-none flex-1">
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={questionLimit}
          onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
      <button
        onClick={() => setQuestionLimit(Math.min(20, questionLimit + 1))}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        aria-label="Increase question limit"
      >
        +
      </button>
    </div>
    <div className="flex justify-between text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-medium">
      <span>1</span>
      <span>10</span>
      <span>20</span>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [showJuzSelection, setShowJuzSelection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedJuzs, setSelectedJuzs] = useState<number[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(false);
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoplayAudio, setAutoplayAudio] = useState(true);
  const [isAutoplayLoaded, setIsAutoplayLoaded] = useState(false);
  const [isJuzExpanded, setIsJuzExpanded] = useState(true);

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
    const stored = localStorage.getItem('autoplayAudio');
    if (stored === null) {
      localStorage.setItem('autoplayAudio', 'true');
      setAutoplayAudio(true);
    } else {
      setAutoplayAudio(stored === 'true');
    }
    setIsAutoplayLoaded(true);
  }, []);

  useEffect(() => {
    if (isAutoplayLoaded) {
      localStorage.setItem('autoplayAudio', autoplayAudio ? 'true' : 'false');
    }
  }, [autoplayAudio, isAutoplayLoaded]);

  useEffect(() => {
    if (selectedJuzs.length > 0) {
      fetchSurahs(selectedJuzs);
    } else {
      setSurahs([]);
      setSelectedSurahs([]);
    }
  }, [selectedJuzs]);

  useEffect(() => {
    if (surahs.length === 0) return;
    setSelectedSurahs(prev => prev.filter(id => surahs.some(s => s.id === id)));
  }, [surahs]);

  const fetchSurahs = async (juzs: number[]) => {
    setLoadingSurahs(true);
    try {
      const res = await fetch(`/api/surahs?juz=${juzs.join(',')}`);
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
    const params = new URLSearchParams();
    if (selectedJuzs.length > 0) {
      params.set('juz', selectedJuzs.join(','));
    }
    if (selectedSurahs.length > 0) {
      params.set('surah', selectedSurahs.join(','));
    }
    params.set('limit', questionLimit.toString());
    router.push(`/practice?${params.toString()}`);
  };

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
                ✨ {t.ver}
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
              <br />
              <span className="text-xs sm:text-sm italic mt-2 block opacity-70">(QS. Al-Qamar: 17)</span>
            </p>
          </div>

          {/* CTA Section */}
          <div className="w-full flex flex-col items-center justify-center pt-4 px-4 sm:px-0">
            {!showJuzSelection && !showSettings ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-in fade-in zoom-in duration-500 w-full max-w-md mx-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="group relative w-full sm:flex-1 inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-full text-base sm:text-lg font-medium tracking-wide shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden whitespace-nowrap leading-none"
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
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10"
                    aria-label={t.close}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  <QuestionLimitSlider t={t} questionLimit={questionLimit} setQuestionLimit={setQuestionLimit} />

                  <div className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{t.autoplayAudio}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoplayAudio}
                      onClick={() => setAutoplayAudio(v => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${autoplayAudio ? 'bg-primary border-primary/40' : 'bg-muted border-border'
                        }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-background shadow-sm transition-transform ${autoplayAudio ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                  </div>

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
                <div className="flex justify-between items-start border-b border-border/50 pb-6">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsJuzExpanded(!isJuzExpanded)}>
                    <div>
                      <h3 className="text-2xl font-serif text-foreground text-start">{t.chooseJuz}</h3>
                      <p className="text-muted-foreground text-sm mt-1 text-start">{t.chooseJuzDesc}</p>
                    </div>
                    {isJuzExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}

                  </div>
                  <button
                    onClick={() => {
                      setShowJuzSelection(false);
                      setSelectedJuzs([]);
                      setSelectedSurahs([]);
                    }}
                    className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
                  >
                    {t.close}
                  </button>
                </div>

                {isJuzExpanded ? (
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                      const isSelected = selectedJuzs.includes(juz);
                      return (
                        <button
                          key={juz}
                          onClick={() => {
                            setSelectedJuzs(prev => {
                              if (prev.includes(juz)) return prev.filter(x => x !== juz);
                              return [...prev, juz].sort((a, b) => a - b);
                            });
                          }}
                          className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl bg-background border transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-primary/5 hover:scale-110 active:scale-95'
                            }`}
                        >
                          <div className={`absolute inset-0 border-2 rounded-2xl transition-all duration-300 ${isSelected ? 'border-primary/20' : 'border-primary/0 group-hover:border-primary/10'
                            }`}></div>
                          <span className={`text-[10px] uppercase tracking-widest font-medium hidden sm:block ${isSelected ? 'text-primary/70' : 'text-muted-foreground group-hover:text-primary/70'
                            }`}>{t.juz}</span>
                          <span className={`text-2xl font-bold font-serif ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                            }`}>{juz}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : selectedJuzs.length > 0 && (
                  <div className="py-4 px-2">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {t.juz} {selectedJuzs.join(', ')}
                      </span>
                      <button
                        onClick={() => setIsJuzExpanded(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {selectedJuzs.length > 0 && (
                  <div className="space-y-8 text-left w-full max-w-3xl mx-auto pt-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-muted-foreground">{t.configJuz} <br></br> {selectedJuzs.join(', ')}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedJuzs([]);
                          setSelectedSurahs([]);
                        }}
                        className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
                      >
                        {t.resetJuz}
                      </button>
                    </div>

                    {loadingSurahs ? (
                      <div className="py-10 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        {t.loadingSurahs}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground block pl-1">{t.selectSurah}</label>
                            <span className="text-xs text-muted-foreground block pl-1">{t.selectSurahDesc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedSurahs.length === surahs.length) {
                                setSelectedSurahs([]);
                              } else {
                                setSelectedSurahs(surahs.map(s => s.id));
                              }
                            }}
                            className={`text-xs underline underline-offset-4 transition-colors ${
                              selectedSurahs.length === surahs.length 
                                ? 'text-primary font-bold' 
                                : 'text-muted-foreground hover:text-primary'
                            }`}
                          >
                            {t.allSurahs}
                          </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {surahs.map(surah => {
                            const isSelected = selectedSurahs.includes(surah.id);
                            return (
                              <button
                                key={surah.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSurahs(prev => {
                                    if (prev.includes(surah.id)) return prev.filter(x => x !== surah.id);
                                    return [...prev, surah.id].sort((a, b) => a - b);
                                  });
                                }}
                                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted/40'
                                  }`}
                              >
                                <div className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs font-bold ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                                  }`}>
                                  {isSelected ? '✓' : ''}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-foreground truncate">
                                    {surah.id}. {surah.englishName}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {surah.name}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <QuestionLimitSlider t={t} questionLimit={questionLimit} setQuestionLimit={setQuestionLimit} />

                    <button
                      onClick={handleStartPractice}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.99]"
                    >
                      {t.startPractice}
                    </button>
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
        <div className="mt-16 px-4">
          <div className="max-w-2xl mx-auto p-6 rounded-3xl border border-border bg-muted/30 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              Jika aplikasi ini bermanfaat dan ingin ikut menjaga server tetap hidup, kamu bisa support di sini 🤍
            </p>
            <a
              href="https://saweria.co/dayeeen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center mt-5 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Dukung via Saweria
            </a>
            <p className="text-sm text-muted-foreground mt-5">© {new Date().getFullYear()} Sambung Ayat. {t.footer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

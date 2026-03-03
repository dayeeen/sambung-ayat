'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  closestCenter,
  useDroppable
} from '@dnd-kit/core';
import { Question, QuestionOption } from '@/types/quran';
import confetti from 'canvas-confetti';
import { useVerseValidation } from '@/hooks/useVerseValidation';
import { DraggableOption } from '@/components/practice/DraggableOption';
import { DropZone } from '@/components/practice/DropZone';
import uiTexts from '@/i18n/practice.json';

const uiText = uiTexts as Record<string, any>;

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse">
        <div className="text-lg tracking-widest uppercase">Loading...</div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const juzParam = searchParams.get('juz');
  const surahParam = searchParams.get('surah');
  const limitParam = searchParams.get('limit');
  const sessionLimit = limitParam ? parseInt(limitParam) : 10;

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<QuestionOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [countdown, setCountdown] = useState(3);
  const [isStarting, setIsStarting] = useState(true);
  const [autoplayAudio, setAutoplayAudio] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = uiText[language];

  const playSound = (type: 'correct' | 'wrong' | 'completed') => {
    const audio = new Audio(`/sfx/${type === 'correct' ? 'correct-answer' : type === 'wrong' ? 'wrong-answer' : 'completed'}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  const {
    isValidating,
    feedback,
    correctAyah,
    combo,
    maxCombo,
    maxStreak,
    pointsGained,
    totalPoints,
    remainingQuestions,
    correctCount,
    isSubmitted,
    validateAnswer,
    resetValidationState,
    resetSessionStats
  } = useVerseValidation(sessionLimit, playSound);

  const [sessionFinished, setSessionFinished] = useState(false);

  const { setNodeRef: setOptionsZoneRef } = useDroppable({
    id: 'options-zone',
    disabled: false,
  });

  useEffect(() => {
    if (limitParam) {
      localStorage.setItem('questionLimit', limitParam);
    }
  }, [limitParam]);

  useEffect(() => {
    const stored = localStorage.getItem('autoplayAudio');
    if (stored === null) {
      localStorage.setItem('autoplayAudio', 'true');
      setAutoplayAudio(true);
      return;
    }
    setAutoplayAudio(stored === 'true');
  }, []);

  useEffect(() => {
    if (isStarting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isStarting && countdown === 0) {
      setIsStarting(false);
    }
  }, [countdown, isStarting]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 10 } })
  );

  const fetchQuestion = async () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsLoading(true);
    resetValidationState();
    setSelectedOption(null);
    setActiveDragItem(null);

    try {
      let url = '/api/question';
      const params = new URLSearchParams();
      if (juzParam) params.append('juz', juzParam);
      if (surahParam) params.append('surah', surahParam);
      const lang = localStorage.getItem('app-language')?.toLowerCase() || 'id';
      params.append('lang', lang);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch question');
      const data: Question = await res.json();
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const updateLang = () => {
      const storedLang = localStorage.getItem('app-language');
      if (storedLang) setLanguage(storedLang.toLowerCase() as 'id' | 'en');
    };
    updateLang();
    window.addEventListener('language-change', updateLang);
    return () => window.removeEventListener('language-change', updateLang);
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [juzParam, surahParam]);

  useEffect(() => {
    if (!isStarting && question && audioRef.current) {
      audioRef.current.load();
      if (!autoplayAudio) {
        setIsPlaying(false);
        return;
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [question, isStarting, autoplayAudio]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current?.option);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    setActiveDragItem(null);
    const option = active.data.current?.option as QuestionOption | undefined;
    if (!option) return;
    if (over && over.id === 'answer-zone') {
      setSelectedOption(option);
    } else if (over && over.id === 'options-zone') {
      if (!isSubmitted) setSelectedOption(null);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  if (isLoading && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse">
        <div className="text-lg tracking-widest uppercase">{t.loading}</div>
      </div>
    );
  }

  if (sessionFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground p-6 pt-32 overflow-y-auto">
        <div className="text-center space-y-8 animate-in zoom-in duration-500 max-w-md w-full my-auto">
          <div className="space-y-2">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold text-primary">{t.sessionFinished}</h1>
            <p className="text-muted-foreground">{t.completed} {sessionLimit} {t.questions}.</p>
          </div>

          <div className="p-8 bg-card border border-border rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">{t.totalPoints}</span>
              <span className="text-5xl font-bold text-emerald-500 font-mono">{totalPoints}</span>
            </div>
            <div className="w-full h-px bg-border/50" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-muted/30">
                <div className="text-2xl font-bold text-foreground">{maxStreak}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.lastStreak}</div>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30">
                <div className="text-2xl font-bold text-foreground">{maxCombo}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.maxCombo}</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 text-center">
              <div className="text-2xl font-bold text-foreground">{correctCount}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.correctAnswers}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSessionFinished(false);
                resetSessionStats(sessionLimit);
                setCountdown(3);
                setIsStarting(true);
                fetchQuestion();
              }}
              className="w-full py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 hover:bg-primary/90 transition-all duration-300 cursor-pointer"
            >
              {t.newSession}
            </button>
            <Link
              href="/leaderboard"
              className="w-full py-4 bg-transparent border border-border text-foreground rounded-full text-lg font-medium hover:bg-muted/50 transition-all duration-300 cursor-pointer"
            >
              {t.leaderboard}
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              {t.home}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground pt-20 pb-4 px-4 sm:p-6 transition-colors duration-500 overflow-x-hidden overflow-y-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {isStarting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="text-8xl sm:text-[10rem] font-bold text-primary animate-bounce font-mono leading-none">{countdown}</div>
              <p className="text-muted-foreground animate-pulse text-xl sm:text-2xl tracking-[0.5em] uppercase font-light text-center px-4">Bersiap...</p>
            </div>
          </div>
        )}

        <main className="w-full max-w-xl flex flex-col items-center space-y-6 sm:space-y-12 pb-20 px-4 my-auto">
          <div className={`text-center space-y-4 sm:space-y-6 w-full transition-opacity duration-500 ${!question ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex justify-between items-center w-full max-w-xs mx-auto text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-full">
              <span>{t.question} {Math.max(1, (sessionLimit + 1) - remainingQuestions)} / {sessionLimit}</span>
              <span className="text-primary">{totalPoints} {t.pts}</span>
            </div>

            <div className="relative py-2 space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-arabic leading-[1.8] sm:leading-[2.0] md:leading-[2.2] text-foreground text-center px-2" dir="rtl">
                {question?.currentAyah.text}
              </h1>
              {question?.currentAyah.translation && <p className="text-sm md:text-base text-muted-foreground/80 italic px-4">"{question.currentAyah.translation}"</p>}
              {question?.currentAyah.audio && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium whitespace-nowrap leading-none ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/10 text-white'}`}
                  >
                    <span>{isPlaying ? t.stop : t.play}</span>
                    <span className="text-lg">{isPlaying ? '⏹️' : '▶️'}</span>
                  </button>
                  <audio ref={audioRef} src={question.currentAyah.audio} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} className="hidden" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground/60 font-medium">
              {t.surah} {question?.currentAyah.surahName || question?.currentAyah.surah} • {t.ayah} {question?.currentAyah.ayah}
            </p>
          </div>

          <div className="w-full">
            <DropZone selectedOption={selectedOption} isCorrect={feedback === 'correct'} isSubmitted={isSubmitted} onReset={() => setSelectedOption(null)} t={t} isValidating={isValidating} />
          </div>

          {!isSubmitted && selectedOption && (
            <button
              onClick={() => validateAnswer(selectedOption, question!)}
              disabled={isValidating}
              className={`w-full py-4 rounded-full text-lg font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${isValidating ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-80' : 'bg-foreground text-background hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer hover:bg-foreground/90'}`}
            >
              {isValidating && <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />}
              {isValidating ? 'Checking...' : t.confirm}
            </button>
          )}

          {!isSubmitted && question && (
            <div ref={setOptionsZoneRef} className="w-full grid grid-cols-1 gap-3">
              {question.options.map((option) => (
                <DraggableOption key={option.key} option={option} isSelected={selectedOption?.key === option.key} isDisabled={!!selectedOption} t={t} />
              ))}
            </div>
          )}

          <div className="w-full min-h-[100px] flex flex-col items-center justify-center space-y-4">
            {isSubmitted && (
              <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                {feedback === 'incorrect' && correctAyah && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                    <p className="text-amber-600 dark:text-amber-400 font-medium">{t.incorrect}</p>
                    <p className="font-arabic text-xl text-foreground dir-rtl">{correctAyah.text}</p>
                  </div>
                )}
                {feedback === 'correct' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 duration-500 space-y-4">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide text-lg">{t.correct}</p>
                    <div className="flex justify-center items-center gap-6">
                      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 delay-100">
                        <span className="text-3xl font-bold text-emerald-500 font-mono">+{pointsGained}</span>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-bold mt-1">{t.pointsLabel}</span>
                      </div>
                      {combo > 1 && (
                        <div className={`flex flex-col items-center animate-in fade-in zoom-in delay-200 ${combo >= 3 ? 'scale-110' : ''}`}>
                          <span className="text-3xl">🔥 x{combo}</span>
                          <span className="text-[10px] uppercase tracking-wider text-orange-500/70 font-bold mt-1">{t.comboLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (remainingQuestions <= 0) {
                      setSessionFinished(true);
                      playSound('completed');
                      confetti({ zIndex: 9999, particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    } else {
                      fetchQuestion();
                    }
                  }}
                  className="w-full py-4 bg-foreground text-background rounded-full text-lg font-medium tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 hover:bg-foreground/90 transition-all duration-300 cursor-pointer"
                >
                  {remainingQuestions <= 0 ? t.finish : t.next}
                </button>
              </div>
            )}
          </div>
        </main>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItem && (
            <div className="w-full p-4 rounded-xl border border-primary/50 bg-background shadow-2xl cursor-grabbing rotate-2 scale-105">
              <p className="font-arabic text-xl md:text-2xl text-center leading-loose dir-rtl">{activeDragItem.text}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

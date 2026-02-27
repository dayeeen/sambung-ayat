'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  closestCenter
} from '@dnd-kit/core';
import { Question, QuestionOption, ValidationResponse } from '../../types/quran';
import confetti from 'canvas-confetti';

const uiText = {
  id: {
    loading: 'Memuat Soal...',
    question: 'Pertanyaan',
    pts: 'POIN',
    tapToRemove: 'Tekan untuk menghapus',
    dragHere: 'Tarik ayat yang benar ke sini',
    play: 'Putar Tilawah',
    stop: 'Hentikan Tilawah',
    confirm: 'Konfirmasi Jawaban',
    correct: 'MasyaAllah, benar!',
    incorrect: 'Lanjutan yang benar adalah:',
    next: 'Ayat Berikutnya →',
    finish: 'Selesai',
    sessionFinished: 'Sesi Selesai!',
    completed: 'Alhamdulillah, antum telah menyelesaikan',
    questions: 'soal',
    totalPoints: 'Total Poin',
    correctAnswers: 'Jawaban Benar',
    lastStreak: 'Streak Terakhir',
    maxCombo: 'Max Combo',
    newSession: 'Mulai Sesi Baru',
    leaderboard: 'Lihat Peringkat',
    home: 'Kembali ke Beranda',
    surah: 'Surah',
    ayah: 'Ayat',
    selected: 'Terpilih',
    pointsLabel: 'Poin',
    comboLabel: 'Combo'
  },
  en: {
    loading: 'Loading Question...',
    question: 'Question',
    pts: 'PTS',
    tapToRemove: 'Tap to remove',
    dragHere: 'Drag the correct ayah here',
    play: 'Play Recitation',
    stop: 'Stop Recitation',
    confirm: 'Confirm Selection',
    correct: 'MashaAllah, Correct!',
    incorrect: 'The correct continuation is:',
    next: 'Next Verse →',
    finish: 'Finish',
    sessionFinished: 'Session Finished!',
    completed: 'Alhamdulillah, you have completed',
    questions: 'questions',
    totalPoints: 'Total Points',
    correctAnswers: 'Correct Answers',
    lastStreak: 'Last Streak',
    maxCombo: 'Max Combo',
    newSession: 'Start New Session',
    leaderboard: 'View Leaderboard',
    home: 'Back to Home',
    surah: 'Surah',
    ayah: 'Ayah',
    selected: 'Selected',
    pointsLabel: 'Points',
    comboLabel: 'Combo'
  }
};

// Draggable Option Component
function DraggableOption({ option, isSelected, isDisabled, language }: { option: QuestionOption; isSelected: boolean; isDisabled: boolean; language: 'id' | 'en' }) {
  const t = uiText[language];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `option-${option.id}`,
    data: { option },
    disabled: isDisabled || isSelected,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isSelected) {
    return (
      <div className="w-full p-4 rounded-xl border-2 border-dashed border-border bg-muted/20 opacity-50 flex items-center justify-center min-h-[80px]">
        <span className="text-muted-foreground text-sm">{t.selected}</span>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div className="w-full p-4 rounded-xl bg-muted/10 border-2 border-primary/20 opacity-30 min-h-[80px]" />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-full p-4 rounded-xl border border-border bg-white dark:bg-stone-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing touch-none select-none
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <p className="font-arabic text-lg sm:text-xl md:text-2xl text-center leading-relaxed" dir="rtl">
        {option.text}
      </p>
    </div>
  );
}

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

type DropZoneProps = {
  selectedOption: QuestionOption | null;
  isCorrect: boolean | null;
  isSubmitted: boolean;
  onReset: () => void;
  language: 'id' | 'en';
  isValidating?: boolean;
};

function DropZone({ selectedOption, isCorrect, isSubmitted, onReset, language, isValidating }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'answer-zone',
    disabled: isSubmitted,
  });
  
  const t = uiText[language];

  return (
    <div
      ref={setNodeRef}
      onClick={!isSubmitted && selectedOption ? onReset : undefined}
      className={`w-full min-h-[120px] sm:min-h-[160px] rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-center p-6 relative
          ${selectedOption
          ? isSubmitted
            ? isCorrect
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-amber-500 bg-amber-500/10'
            : 'border-primary/50 bg-background cursor-pointer hover:bg-muted/5'
          : isOver
            ? 'border-primary border-dashed bg-primary-bg/10 scale-[1.02]'
            : 'border-border border-dashed bg-muted/5'
        }
        `}
    >
      {selectedOption ? (
        <div className={`text-center w-full animate-in fade-in zoom-in-95 duration-300`}>
          <p dir="rtl" className={`font-arabic text-xl sm:text-2xl md:text-3xl leading-[2.2] 
              ${isSubmitted
              ? isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              : 'text-foreground'
            }`}>
            {selectedOption.text}
          </p>
          {!isSubmitted && (
            <p className="text-xs text-muted-foreground mt-4 uppercase tracking-wider">
              {t.tapToRemove}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground pointer-events-none space-y-2">
          <p className="text-sm font-medium">{t.dragHere}</p>
        </div>
      )}
    </div>
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
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAyah, setCorrectAyah] = useState<QuestionOption | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<QuestionOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState<number>(0);

  // New State for Points/Combo
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [pointsGained, setPointsGained] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(sessionLimit);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [isValidating, setIsValidating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isStarting, setIsStarting] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = uiText[language];

  const { setNodeRef: setOptionsZoneRef } = useDroppable({
    id: 'options-zone',
    disabled: false,
  });

  // Persist question limit
  useEffect(() => {
    if (limitParam) {
      localStorage.setItem('questionLimit', limitParam);
    }
  }, [limitParam]);

  const playSound = (type: 'correct' | 'wrong' | 'completed') => {
    const audio = new Audio(`/sfx/${type === 'correct' ? 'correct-answer' : type === 'wrong' ? 'wrong-answer' : 'completed'}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  useEffect(() => {
    if (isStarting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isStarting && countdown === 0) {
      setIsStarting(false);
    }
  }, [countdown, isStarting]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 10,
      },
    })
  );

  const fetchQuestion = async () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsLoading(true);
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

      // Reset state
      setSelectedOption(null);
      setFeedback(null);
      setCorrectAyah(null);
      setIsSubmitted(false);
      setActiveDragItem(null);
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

  // Auto-play audio when question loads
  useEffect(() => {
    if (!isStarting && question && audioRef.current) {
      audioRef.current.load();
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
  }, [question, isStarting]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const option = active.data.current?.option;
    setActiveDragItem(option);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    const option = active.data.current?.option as QuestionOption | undefined;
    if (!option) return;
    if (over && over.id === 'answer-zone') {
      setSelectedOption(option);
    } else if (over && over.id === 'options-zone') {
      if (!isSubmitted) setSelectedOption(null);
    }
  };

  const validateAnswer = async (optionToCheck?: QuestionOption) => {
    const option = optionToCheck || selectedOption;
    if (!option || !question) return;

    setIsValidating(true);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedAyahId: option.id,
          currentAyahId: question.currentAyah.id,
          sessionLimit: sessionLimit,
        }),
      });

      if (!res.ok) throw new Error('Validation failed');

      const data: ValidationResponse = await res.json();

      setFeedback(data.isCorrect ? 'correct' : 'incorrect');
      if (data.isCorrect) {
        setCorrectCount(prev => prev + 1);
        setStreak(data.currentCorrectStreak ?? 0);
        setCombo(data.comboStreak ?? 0);
        setPointsGained(data.pointsGained ?? 0);
        setMaxStreak(prev => Math.max(prev, data.currentCorrectStreak ?? 0));
        setMaxCombo(prev => Math.max(prev, data.comboStreak ?? 0));
        playSound('correct');
      } else {
        setStreak(0);
        setCombo(0);
        setPointsGained(0);
        playSound('wrong');
      }

      if (data.totalPoints !== undefined) setTotalPoints(data.totalPoints);
      if (data.remainingQuestions !== undefined) setRemainingQuestions(data.remainingQuestions);
      // Do not finish session immediately; show feedback first

      if (data.correctAyah) {
        // Map correctAyah to QuestionOption format if needed
        setCorrectAyah({
          id: data.correctAyah.id,
          text: data.correctAyah.text,
          surah: data.correctAyah.surah,
          ayah: data.correctAyah.ayah
        });
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetSelection = () => {
    if (!isSubmitted) {
      setSelectedOption(null);
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
      styles: {
        active: {
          opacity: '0.5',
        },
      },
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
                setCombo(0);
                setMaxCombo(0);
                setStreak(0);
                setMaxStreak(0);
                setPointsGained(0);
                setTotalPoints(0);
                setCorrectCount(0);
                setRemainingQuestions(sessionLimit);
                setCountdown(3);
                setIsStarting(true);
                fetchQuestion();
              }}
              className="w-full py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {t.newSession}
            </button>
            <a
              href="/leaderboard"
              className="w-full py-4 bg-transparent border border-border text-foreground rounded-full text-lg font-medium hover:bg-muted/50 transition-all duration-300"
            >
              {t.leaderboard}
            </a>
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t.home}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground pt-20 pb-4 px-4 sm:p-6 transition-colors duration-500 overflow-x-hidden overflow-y-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isStarting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="text-8xl sm:text-[10rem] font-bold text-primary animate-bounce font-mono leading-none">
                {countdown}
              </div>
              <p className="text-muted-foreground animate-pulse text-xl sm:text-2xl tracking-[0.5em] uppercase font-light text-center px-4">Bersiap...</p>
            </div>
          </div>
        )}

        <main className="w-full max-w-xl flex flex-col items-center space-y-6 sm:space-y-12 pb-20 px-4 my-auto">

          {/* Header / Verse Display */}
          <div className={`text-center space-y-4 sm:space-y-6 w-full transition-opacity duration-500 ${!question ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex justify-between items-center w-full max-w-xs mx-auto text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-full">
              <span>{t.question} {Math.max(1, (sessionLimit + 1) - remainingQuestions)} / {sessionLimit}</span>
              <span className="text-primary">{totalPoints} {t.pts}</span>
            </div>

            <div className="relative py-2 space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-arabic leading-[1.8] sm:leading-[2.0] md:leading-[2.2] text-foreground text-center px-2" dir="rtl">
                {question?.currentAyah.text}
              </h1>

              {question?.currentAyah.translation && (
                <p className="text-sm md:text-base text-muted-foreground/80 italic px-4">
                  "{question.currentAyah.translation}"
                </p>
              )}

              {question?.currentAyah.audio && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium whitespace-nowrap leading-none ${isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-primary hover:bg-primary/10 text-white'
                      }`}
                  >
                    <span>{isPlaying ? t.stop : t.play}</span>
                    <span className="text-lg">{isPlaying ? '⏹️' : '▶️'}</span>
                  </button>
                  <audio
                    ref={audioRef}
                    src={question.currentAyah.audio}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground/60 font-medium">
              {t.surah} {question?.currentAyah.surahName || question?.currentAyah.surah} • {t.ayah} {question?.currentAyah.ayah}
            </p>
          </div>

          {/* Drop Zone */}
          <div className="w-full">
            <DropZone
              selectedOption={selectedOption}
              isCorrect={feedback === 'correct'}
              isSubmitted={isSubmitted}
              onReset={handleResetSelection}
              language={language}
              isValidating={isValidating}
            />
          </div>

          {/* Confirm Button - Moved below Drop Zone */}
          {!isSubmitted && selectedOption && (
            <button
              onClick={() => validateAnswer()}
              disabled={isValidating}
              className={`w-full py-4 rounded-full text-lg font-medium tracking-wide transition-all duration-300 ${
                isValidating
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-foreground text-background hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {t.confirm}
            </button>
          )}

          {/* Options Grid */}
          {!isSubmitted && question && (
            <div ref={setOptionsZoneRef} className="w-full grid grid-cols-1 gap-3">
              {question.options.map((option) => (
                <DraggableOption
                  key={option.id}
                  option={option}
                  isSelected={selectedOption?.id === option.id}
                  isDisabled={!!selectedOption}
                  language={language}
                />
              ))}
            </div>
          )}

          {/* Actions & Feedback */}
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
                      confetti({
                        zIndex: 9999,
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                      });
                    } else {
                      fetchQuestion();
                    }
                  }}
                  className="w-full py-4 bg-foreground text-background rounded-full text-lg font-medium tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  {remainingQuestions <= 0 ? t.finish : t.next}
                </button>
              </div>
            )}
          </div>

        </main>

        {/* Drag Overlay for smooth movement */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItem ? (
            <div className="w-full p-4 rounded-xl border border-primary/50 bg-background shadow-2xl cursor-grabbing rotate-2 scale-105">
              <p className="font-arabic text-xl md:text-2xl text-center leading-loose dir-rtl">
                {activeDragItem.text}
              </p>
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>
    </div>
  );
}

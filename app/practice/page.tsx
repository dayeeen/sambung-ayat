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
  DragStartEvent
} from '@dnd-kit/core';
import { Question, QuestionOption, ValidationResponse } from '../../types/quran';

// Draggable Option Component
function DraggableOption({ option, isSelected, isDisabled }: { option: QuestionOption; isSelected: boolean; isDisabled: boolean }) {
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
        <span className="text-muted-foreground text-sm">Selected</span>
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
      className={`w-full p-4 rounded-xl border border-border bg-white dark:bg-stone-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing touch-none
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <p className="font-arabic text-xl md:text-2xl text-center leading-loose" dir="rtl">
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

// Drop Zone Component
function DropZone({ selectedOption, isCorrect, isSubmitted, onReset }: { selectedOption: QuestionOption | null; isCorrect: boolean | null; isSubmitted: boolean; onReset: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'answer-zone',
    disabled: !!selectedOption,
  });

  return (
    <div
      ref={setNodeRef}
      onClick={!isSubmitted && selectedOption ? onReset : undefined}
      className={`w-full min-h-[160px] rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-center p-6 relative
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
          <p className={`font-arabic text-2xl md:text-3xl leading-[2.2] dir-rtl 
            ${isSubmitted 
              ? isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              : 'text-foreground'
            }`}>
            {selectedOption.text}
          </p>
          {!isSubmitted && (
            <p className="text-xs text-muted-foreground mt-4 uppercase tracking-wider">
              Tap to remove
            </p>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground pointer-events-none space-y-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-2xl opacity-50">
            ✋
          </div>
          <p className="text-sm font-medium">Drag the correct ayah here</p>
        </div>
      )}
    </div>
  );
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const juzParam = searchParams.get('juz');

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAyah, setCorrectAyah] = useState<QuestionOption | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<QuestionOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
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
      const url = juzParam ? `/api/question?juz=${juzParam}` : '/api/question';
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
    fetchQuestion();
  }, [juzParam]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const option = active.data.current?.option;
    setActiveDragItem(option);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (over && over.id === 'answer-zone') {
      const option = active.data.current?.option as QuestionOption;
      setSelectedOption(option);
    }
  };

  const handleCheck = async () => {
    if (!selectedOption || !question) return;

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedAyahId: selectedOption.id,
          currentAyahId: question.currentAyah.id
        })
      });

      if (!res.ok) throw new Error('Validation failed');

      const data: ValidationResponse = await res.json();
      
      setFeedback(data.isCorrect ? 'correct' : 'incorrect');
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
        <div className="text-lg tracking-widest uppercase">Loading Question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 sm:p-6 transition-colors duration-500 overflow-x-hidden">
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <main className="w-full max-w-xl flex flex-col items-center space-y-8 md:space-y-12 pb-20">
          
          {/* Header / Verse Display */}
          <div className={`text-center space-y-6 w-full transition-opacity duration-500 ${!question ? 'opacity-0' : 'opacity-100'}`}>
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-[0.2em]">
                Complete the Verse
              </p>
              <div className="w-12 h-0.5 bg-border mx-auto rounded-full" />
            </div>

            <div className="relative py-2 space-y-4">
              <h1 className="text-2xl md:text-4xl font-arabic leading-[2.0] md:leading-[2.2] text-foreground text-center" dir="rtl">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
                  >
                    <span>{isPlaying ? 'Stop Recitation' : 'Play Recitation'}</span>
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
              Surah {question?.currentAyah.surah} • Ayah {question?.currentAyah.ayah}
            </p>
          </div>

          {/* Drop Zone */}
          <div className="w-full">
            <DropZone 
              selectedOption={selectedOption} 
              isCorrect={feedback === 'correct'} 
              isSubmitted={isSubmitted} 
              onReset={handleResetSelection}
            />
          </div>

          {/* Options Grid */}
          {!isSubmitted && question && (
            <div className="w-full grid grid-cols-1 gap-3">
              {question.options.map((option) => (
                <DraggableOption 
                  key={option.id} 
                  option={option} 
                  isSelected={selectedOption?.id === option.id}
                  isDisabled={!!selectedOption}
                />
              ))}
            </div>
          )}

          {/* Actions & Feedback */}
          <div className="w-full min-h-[100px] flex flex-col items-center justify-center space-y-4">
             {!isSubmitted ? (
               selectedOption && (
                <button 
                  onClick={handleCheck}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                >
                  Confirm Selection
                </button>
               )
             ) : (
                <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  {feedback === 'incorrect' && correctAyah && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                      <p className="text-amber-600 dark:text-amber-400 font-medium">The correct continuation is:</p>
                      <p className="font-arabic text-xl text-foreground dir-rtl">{correctAyah.text}</p>
                    </div>
                  )}
                  
                  {feedback === 'correct' && (
                     <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">Masha'Allah, Correct ✨</p>
                     </div>
                  )}

                  <button 
                    onClick={fetchQuestion}
                    className="w-full py-4 bg-foreground text-background rounded-full text-lg font-medium tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    Next Verse →
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
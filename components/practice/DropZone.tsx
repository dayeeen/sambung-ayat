import { useDroppable } from '@dnd-kit/core';
import { QuestionOption } from '@/types/quran';

type DropZoneProps = {
  selectedOption: QuestionOption | null;
  isCorrect: boolean | null;
  isSubmitted: boolean;
  onReset: () => void;
  t: any;
  isValidating?: boolean;
};

export function DropZone({ selectedOption, isCorrect, isSubmitted, onReset, t, isValidating }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'answer-zone',
    disabled: isSubmitted,
  });

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

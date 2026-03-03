import { useDraggable } from '@dnd-kit/core';
import { QuestionOption } from '@/types/quran';

export function DraggableOption({ 
  option, 
  isSelected, 
  isDisabled, 
  t 
}: { 
  option: QuestionOption; 
  isSelected: boolean; 
  isDisabled: boolean; 
  t: any 
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `option-${option.key}`,
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

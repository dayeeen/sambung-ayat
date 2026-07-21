import { useState } from 'react';
import { Question, QuestionOption, ValidationResponse } from '../types/quran';

export function useVerseValidation(sessionLimit: number, playSound: (type: 'correct' | 'wrong' | 'completed') => void) {
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAyah, setCorrectAyah] = useState<QuestionOption | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [pointsGained, setPointsGained] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(sessionLimit);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateAnswer = async (option: QuestionOption, question: Question) => {
    if (!option || !question) return;

    setIsValidating(true);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          choiceKey: option.key,
          challengeToken: question.challengeToken,
          sessionLimit: sessionLimit,
        }),
      });

      if (!res.ok) throw new Error('Validation failed');

      const data: ValidationResponse = await res.json();

      setFeedback(data.isCorrect ? 'correct' : 'incorrect');
      if (data.isCorrect) {
        setCorrectCount(prev => prev + 1);
        setStreak(data.currentCorrectStreak ?? (streak + 1));
        const nextCombo = (data.comboStreak !== undefined) ? data.comboStreak : (combo + 1);
        const gained = (data.pointsGained !== undefined) ? data.pointsGained : (10 + (nextCombo >= 3 ? nextCombo * 5 : 0));
        setCombo(nextCombo);
        setPointsGained(gained);
        setMaxStreak(prev => Math.max(prev, data.currentCorrectStreak ?? (streak + 1)));
        setMaxCombo(prev => Math.max(prev, nextCombo));
        playSound('correct');
      } else {
        setStreak(0);
        const nextCombo = 0;
        setCombo(nextCombo);
        setPointsGained(0);
        playSound('wrong');
      }

      if (data.totalPoints !== undefined) {
        setTotalPoints(data.totalPoints);
      } else {
        const inc = data.isCorrect ? (10 + ((data.comboStreak ?? (combo + 1)) >= 3 ? (data.comboStreak ?? (combo + 1)) * 5 : 0)) : 0;
        setTotalPoints(prev => {
          const next = prev + inc;
          try {
            if (typeof window !== 'undefined') {
              const snapshot = {
                totalPoints: next,
                remainingQuestions,
                correctCount: data.isCorrect ? (correctCount + 1) : correctCount,
                combo,
                maxCombo,
                streak,
                maxStreak,
              };
              window.localStorage.setItem('guestSession', JSON.stringify(snapshot));
            }
          } catch {}
          return next;
        });
      }
      if (data.remainingQuestions !== undefined) {
        setRemainingQuestions(data.remainingQuestions);
      } else {
        setRemainingQuestions(prev => {
          const next = Math.max(0, prev - 1);
          try {
            if (typeof window !== 'undefined') {
              const snapshot = JSON.parse(window.localStorage.getItem('guestSession') || '{}');
              snapshot.remainingQuestions = next;
              window.localStorage.setItem('guestSession', JSON.stringify(snapshot));
            }
          } catch {}
          return next;
        });
      }

      if (data.correctAyah) {
        setCorrectAyah({
          key: 'correct',
          text: data.correctAyah.text,
          surah: data.correctAyah.surah,
          ayah: data.correctAyah.ayah
        } as any);
      }
      setIsSubmitted(true);
      return data;
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const resetValidationState = () => {
    setFeedback(null);
    setCorrectAyah(null);
    setIsSubmitted(false);
  };

  const resetSessionStats = (limit: number) => {
    setCombo(0);
    setMaxCombo(0);
    setStreak(0);
    setMaxStreak(0);
    setPointsGained(0);
    setTotalPoints(0);
    setCorrectCount(0);
    setRemainingQuestions(limit);
    resetValidationState();
  };

  return {
    isValidating,
    feedback,
    correctAyah,
    streak,
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
  };
}

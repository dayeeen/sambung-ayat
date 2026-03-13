import { useState, useCallback } from 'react';
import { questionApi, GetQuestionParams } from '@/lib/api';
import { Question } from '@/types/quran';

export function useQuestion() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestion = useCallback(async (params: GetQuestionParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await questionApi.getQuestion(params);
      setQuestion(data);
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch question');
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetQuestion = useCallback(() => {
    setQuestion(null);
    setError(null);
  }, []);

  return {
    question,
    isLoading,
    error,
    fetchQuestion,
    resetQuestion
  };
}

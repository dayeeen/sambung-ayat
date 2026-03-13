import { useState, useEffect } from 'react';
import { surahApi, SurahMinimal } from '@/lib/api';

export function useSurahs(juzParam: string | null) {
  const [surahs, setSurahs] = useState<SurahMinimal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!juzParam) {
      setSurahs([]);
      return;
    }

    const fetchSurahs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await surahApi.getSurahsByJuz(juzParam);
        if (isMounted) setSurahs(result);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load surahs'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSurahs();

    return () => {
      isMounted = false;
    };
  }, [juzParam]);

  return {
    surahs,
    isLoading,
    error
  };
}

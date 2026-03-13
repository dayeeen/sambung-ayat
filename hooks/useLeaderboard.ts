import { useState, useEffect } from 'react';
import { leaderboardApi, LeaderboardSortBy, LeaderboardResponse } from '@/lib/api';

export function useLeaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('points');

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await leaderboardApi.getLeaderboard(sortBy);
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load leaderboard'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [sortBy]);

  return {
    users: data?.topUsers || [],
    currentUser: data?.currentUser || null,
    isLoading,
    error,
    sortBy,
    setSortBy
  };
}

import { apiClient } from './client';

export type LeaderboardSortBy = 'daily' | 'correct' | 'points';

export interface LeaderboardUser {
  id: string;
  displayName: string | null;
  longestStreak: number;
  longestCorrectStreak: number;
  totalCorrect: number;
  totalPoints: number;
}

export interface CurrentUserRank extends LeaderboardUser {
  rank: number;
}

export interface LeaderboardResponse {
  topUsers: LeaderboardUser[];
  currentUser: CurrentUserRank | null;
}

export const leaderboardApi = {
  /**
   * Fetches the leaderboard data optionally sorted by daily streak, correct answers, or total points.
   */
  getLeaderboard: async (sortBy: LeaderboardSortBy = 'points'): Promise<LeaderboardResponse> => {
    return apiClient<LeaderboardResponse>(`/leaderboard?sortBy=${sortBy}`);
  }
};

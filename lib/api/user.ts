import { apiClient } from './client';

export interface CurrentUserResponse {
  id: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
  totalCorrect: number;
  totalPoints: number;
  longestStreak: number;
}

export const userApi = {
  /**
   * Retrieves data for the currently authenticated user.
   */
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    return apiClient<CurrentUserResponse>('/user/current');
  }
};

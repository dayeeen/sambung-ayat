import { apiClient } from './client';
import { Question } from '@/types/quran';

export interface GetQuestionParams {
  juz?: string | string[] | null;
  surah?: string | null;
  lang?: 'id' | 'en';
}

export const questionApi = {
  /**
   * Fetches a generated question based on optional juz, surah, and language parameters.
   */
  getQuestion: async (params: GetQuestionParams): Promise<Question> => {
    const searchParams = new URLSearchParams();
    
    if (params.juz) {
      if (Array.isArray(params.juz)) {
         params.juz.forEach(j => searchParams.append('juz', j));
      } else {
         searchParams.append('juz', params.juz);
      }
    }
    
    if (params.surah) searchParams.append('surah', params.surah);
    if (params.lang) searchParams.append('lang', params.lang);

    const qs = searchParams.toString();
    const endpoint = `/question${qs ? `?${qs}` : ''}`;

    return apiClient<Question>(endpoint);
  }
};

import { apiClient } from './client';

export interface SurahMinimal {
  id: number;
  name: string;
  englishName: string;
}

export const surahApi = {
  /**
   * Fetches a list of surahs that are present in the specified juz(s).
   */
  getSurahsByJuz: async (juzParam: string): Promise<SurahMinimal[]> => {
    if (!juzParam) {
      throw new Error("Juz parameter is required");
    }
    return apiClient<SurahMinimal[]>(`/surahs?juz=${juzParam}`);
  }
};

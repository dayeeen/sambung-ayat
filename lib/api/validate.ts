import { apiClient } from './client';
import { ValidationRequest, ValidationResponse } from '@/types/quran';

export const validateApi = {
  /**
   * Validates a submitted answer for a question.
   */
  validateAnswer: async (data: ValidationRequest): Promise<ValidationResponse> => {
    return apiClient<ValidationResponse>('/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

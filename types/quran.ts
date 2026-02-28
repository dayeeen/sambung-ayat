export interface AlQuranResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface Ayah {
  number: number; // Global number (1-6236)
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  audio?: string;
  translation?: string;
}

export interface QuestionOption {
  id: number; // Using global ayah number as ID
  text: string;
  surah: number;
  ayah: number;
}

export interface Question {
  /** Present when fetched with sessionId (tracked mode) */
  questionId?: string;
  currentAyah: {
    id: number;
    text: string;
    surah: number;
    surahName?: string;
    surahEnglishName?: string;
    ayah: number;
    audio?: string;
    translation?: string;
  };
  options: QuestionOption[];
}

// Internal type for generator before sanitizing for frontend
export interface GeneratedQuestion extends Question {
  correctAyahId: number;
}

export interface ValidationRequest {
  selectedAyahId: number;
  currentAyahId: number;
  sessionLimit?: number;
  /** Required for tracked sessions (anti-abuse). Omit for guest validation only. */
  sessionId?: string;
  /** Required for tracked sessions. Omit for guest validation only. */
  questionId?: string;
}

export interface ValidationResponse {
  isCorrect: boolean;
  currentStreak?: number;
  longestStreak?: number;
  currentCorrectStreak?: number;
  
  comboStreak?: number;
  pointsGained?: number;
  totalPoints?: number;
  remainingQuestions?: number;
  sessionFinished?: boolean;

  correctAyah?: {
    id: number;
    text: string;
    surah: number;
    ayah: number;
  };
}

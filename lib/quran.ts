import quranData from '../data/quran.json';

export interface Ayah {
  surah: number;
  ayah: number;
  text: string;
}

// Function to normalize Arabic text
export function normalizeArabic(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  
  // Remove all diacritics (tashkeel)
  normalized = normalized.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
  
  // Remove Tatweel (elongation)
  normalized = normalized.replace(/\u0640/g, '');
  
  // Normalize Alef forms
  normalized = normalized.replace(/[أإآ]/g, 'ا');
  
  // Normalize Ya/Alif Maqsura
  normalized = normalized.replace(/ى/g, 'ي');
  
  // Normalize Ta Marbuta
  normalized = normalized.replace(/ة/g, 'ه');
  
  // Remove extra spaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

export function getRandomAyah(): Ayah {
  // We want to avoid the last ayah of the dataset because it has no next ayah
  // Or handle it gracefully. For now, let's just pick any ayah that has a next one.
  // Actually, let's just pick any random one, and handle "no next ayah" in the UI or logic.
  // But for a better user experience, let's filter out the very last one in the dataset if it's sequential.
  // Since our dataset is small and sequential, we can just pick from 0 to length - 2.
  
  // However, the dataset might not be fully sequential (e.g. gaps between surahs).
  // So a safer bet is to pick a random ayah, then check if getNextAyah returns something.
  
  let randomAyah: Ayah;
  let nextAyah: Ayah | null = null;
  
  do {
    const randomIndex = Math.floor(Math.random() * quranData.length);
    randomAyah = quranData[randomIndex] as Ayah;
    nextAyah = getNextAyah(randomAyah.surah, randomAyah.ayah);
  } while (!nextAyah);
  
  return randomAyah;
}

export function getNextAyah(surah: number, ayah: number): Ayah | null {
  const nextAyah = quranData.find(
    (a) => a.surah === surah && a.ayah === ayah + 1
  );
  
  // Also handle transition to next Surah if needed? 
  // Usually "next verse" implies the next verse in the same surah or the first of the next.
  // The provided dataset has sequential verses.
  // If not found in same surah, check if there is a verse 1 of surah + 1
  if (!nextAyah) {
     const nextSurahFirstAyah = quranData.find(
      (a) => a.surah === surah + 1 && a.ayah === 1
    );
    return nextSurahFirstAyah as Ayah || null;
  }

  return nextAyah as Ayah;
}

export function checkAnswer(userInput: string, correctText: string): boolean {
  const normalizedInput = normalizeArabic(userInput);
  const normalizedCorrect = normalizeArabic(correctText);
  
  return normalizedInput === normalizedCorrect;
}

export interface Question {
  currentAyah: Ayah;
  correctNext: Ayah;
  options: Ayah[];
}

export function generateQuestion(): Question {
  const currentAyah = getRandomAyah();
  const correctNext = getNextAyah(currentAyah.surah, currentAyah.ayah);

  if (!correctNext) {
    // Should not happen due to getRandomAyah logic, but for safety:
    return generateQuestion();
  }

  // Get 3 distractors
  const distractors: Ayah[] = [];
  const maxAttempts = 20; // Prevent infinite loop if dataset is small
  
  while (distractors.length < 3) {
    const randomIdx = Math.floor(Math.random() * quranData.length);
    const candidate = quranData[randomIdx] as Ayah;

    // Distractor rules:
    // 1. Not the correct next ayah
    // 2. Not the current ayah (unlikely but possible)
    // 3. Not already in distractors
    const isDuplicate = distractors.some(d => d.surah === candidate.surah && d.ayah === candidate.ayah);
    const isCorrect = candidate.surah === correctNext.surah && candidate.ayah === correctNext.ayah;
    const isCurrent = candidate.surah === currentAyah.surah && candidate.ayah === currentAyah.ayah;

    if (!isDuplicate && !isCorrect && !isCurrent) {
      distractors.push(candidate);
    }
  }

  // Combine and shuffle
  const options = [...distractors, correctNext];
  
  // Simple shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    currentAyah,
    correctNext,
    options
  };
}

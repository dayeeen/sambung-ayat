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

import { fetchAyahByGlobalNumber, fetchNextAyah, fetchRandomAyah } from './alquran';
import { GeneratedQuestion, QuestionOption } from '../types/quran';

const TOTAL_AYAHS = 6236;

export async function generateQuestion(): Promise<GeneratedQuestion> {
  // 1. Pick a random starting ayah (avoiding the very last one)
  const currentAyah = await fetchRandomAyah();
  
  // 2. Fetch the correct next ayah
  const correctNext = await fetchNextAyah(currentAyah.number);

  // 3. Generate 3 distractors
  const options: QuestionOption[] = [];
  
  // Start with the correct answer in the array
  options.push({
    id: correctNext.number,
    text: correctNext.text,
    surah: correctNext.surah.number,
    ayah: correctNext.numberInSurah
  });

  const usedIds = new Set<number>([currentAyah.number, correctNext.number]);

  // We need 3 more options for a total of 4
  let attempts = 0;
  while (options.length < 4 && attempts < 20) {
    attempts++;
    
    // Pick random ID, avoid current/correct
    const randomId = Math.floor(Math.random() * TOTAL_AYAHS) + 1;
    if (usedIds.has(randomId)) continue;
    
    try {
      const distractor = await fetchAyahByGlobalNumber(randomId);
      
      // Safety: Skip if text is identical to correct answer (rare edge case)
      if (distractor.text === correctNext.text) continue;

      options.push({
        id: distractor.number,
        text: distractor.text,
        surah: distractor.surah.number,
        ayah: distractor.numberInSurah
      });
      
      usedIds.add(randomId);
    } catch (error) {
      console.warn(`Failed to fetch distractor ${randomId}, skipping.`);
    }
  }

  // 4. Shuffle options (Fisher-Yates)
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    currentAyah: {
      id: currentAyah.number,
      text: currentAyah.text,
      surah: currentAyah.surah.number,
      ayah: currentAyah.numberInSurah
    },
    correctAyahId: correctNext.number,
    options
  };
}

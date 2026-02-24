import { Ayah, AlQuranResponse } from '../types/quran';

// In-memory cache for Ayahs
// Map<globalNumber, Ayah>
const ayahCache = new Map<number, Ayah>();

const BASE_URL = 'https://api.alquran.cloud/v1';
const EDITION = 'quran-uthmani';

/**
 * Fetches a specific ayah by its global number (1-6236)
 */
export async function fetchAyahByGlobalNumber(number: number): Promise<Ayah> {
  // 1. Check Cache
  if (ayahCache.has(number)) {
    return ayahCache.get(number)!;
  }

  // 2. Fetch from API with retry
  try {
    const data = await fetchWithRetry(`${BASE_URL}/ayah/${number}/${EDITION}`);
    const response: AlQuranResponse<Ayah> = await data.json();

    if (response.code !== 200 || !response.data) {
      throw new Error(`Failed to fetch ayah ${number}: ${response.status}`);
    }

    // 3. Store in Cache
    ayahCache.set(number, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ayah ${number}:`, error);
    throw error;
  }
}

/**
 * Fetches a random ayah
 */
export async function fetchRandomAyah(): Promise<Ayah> {
  // Total ayahs in Quran is 6236.
  // We avoid the very last ayah (6236) as a starting point because it has no next verse.
  const randomNum = Math.floor(Math.random() * 6235) + 1;
  return fetchAyahByGlobalNumber(randomNum);
}

/**
 * Fetches the next ayah based on current global number
 */
export async function fetchNextAyah(currentGlobalNumber: number): Promise<Ayah> {
  if (currentGlobalNumber >= 6236) {
    throw new Error('No next ayah available (end of Quran)');
  }
  return fetchAyahByGlobalNumber(currentGlobalNumber + 1);
}

/**
 * Fetches all ayahs for a specific Juz (1-30)
 */
export async function fetchJuz(juzNumber: number): Promise<Ayah[]> {
  if (juzNumber < 1 || juzNumber > 30) {
    throw new Error('Juz number must be between 1 and 30');
  }

  // Use the Juz endpoint which returns all verses for that Juz
  const url = `${BASE_URL}/juz/${juzNumber}/${EDITION}`;
  
  try {
    const data = await fetchWithRetry(url);
    const response: AlQuranResponse<{ ayahs: Ayah[] }> = await data.json();

    if (response.code !== 200 || !response.data) {
      throw new Error(`Failed to fetch Juz ${juzNumber}: ${response.status}`);
    }

    // Cache the ayahs individually too for future lookups
    response.data.ayahs.forEach(ayah => {
        ayahCache.set(ayah.number, ayah);
    });

    return response.data.ayahs;
  } catch (error) {
    console.error(`Error fetching Juz ${juzNumber}:`, error);
    throw error;
  }
}

/**
 * Fetches audio and translation for a specific ayah
 */
export async function fetchAyahDetails(number: number): Promise<{ audio: string; translation: string }> {
  // Use editions endpoint to get both in one call
  const url = `${BASE_URL}/ayah/${number}/editions/ar.alafasy,id.indonesian`;
  
  try {
    const data = await fetchWithRetry(url);
    const response = await data.json();

    if (response.code !== 200 || !response.data) {
      throw new Error(`Failed to fetch ayah details ${number}: ${response.status}`);
    }

    // Response data is an array of objects corresponding to the requested editions
    const audioData = response.data.find((item: any) => item.edition.identifier === 'ar.alafasy');
    const translationData = response.data.find((item: any) => item.edition.identifier === 'id.indonesian');

    return {
      audio: audioData?.audio || '',
      translation: translationData?.text || ''
    };
  } catch (error) {
    console.error(`Error fetching details for ayah ${number}:`, error);
    return { audio: '', translation: '' }; // Fallback
  }
}

/**
 * Helper to fetch with timeout and 1 retry
 */
async function fetchWithRetry(url: string, retries = 1, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      next: { revalidate: 3600 } // ISR-like behavior
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    clearTimeout(id);
    if (retries > 0) {
      console.warn(`Retrying fetch for ${url}...`);
      return fetchWithRetry(url, retries - 1, timeoutMs);
    }
    throw error;
  }
}

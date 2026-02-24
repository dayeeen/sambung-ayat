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

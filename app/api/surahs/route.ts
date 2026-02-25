import { NextRequest, NextResponse } from 'next/server';
import { fetchJuz } from '../../../lib/alquran';

// Cache for surahs in each juz
const juzSurahCache = new Map<number, { id: number; name: string; englishName: string }[]>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const juzParam = searchParams.get('juz');
    
    if (!juzParam) {
        return NextResponse.json({ error: 'Juz parameter is required' }, { status: 400 });
    }

    const juz = parseInt(juzParam, 10);
    if (isNaN(juz) || juz < 1 || juz > 30) {
        return NextResponse.json({ error: 'Invalid Juz number' }, { status: 400 });
    }

    // Check cache
    if (juzSurahCache.has(juz)) {
        return NextResponse.json(juzSurahCache.get(juz));
    }

    // Fetch full Juz content
    const ayahs = await fetchJuz(juz);
    
    // Extract unique Surahs
    const surahMap = new Map<number, { id: number; name: string; englishName: string }>();
    
    ayahs.forEach(ayah => {
        if (!surahMap.has(ayah.surah.number)) {
            surahMap.set(ayah.surah.number, {
                id: ayah.surah.number,
                name: ayah.surah.englishName,
                englishName: ayah.surah.englishName
            });
        }
    });

    const surahs = Array.from(surahMap.values());
    
    // Cache it
    juzSurahCache.set(juz, surahs);

    return NextResponse.json(surahs);
  } catch (error) {
    console.error('Surah API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surahs' },
      { status: 503 }
    );
  }
}
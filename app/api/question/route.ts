import { NextRequest, NextResponse } from 'next/server';
import { generateQuestion } from '../../../lib/question-generator';
import { Question } from '../../../types/quran';

export const revalidate = 0; // Dynamic, no caching for question generation

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const juzParam = searchParams.getAll('juz').join(',');
    const surahParam = searchParams.getAll('surah').join(',');
    const langParam = searchParams.get('lang');
    
    const juzNumbers = juzParam
      ? Array.from(
          new Set(
            juzParam
              .split(',')
              .map(v => v.trim())
              .filter(Boolean)
              .map(v => parseInt(v, 10))
          )
        )
      : [];

    const juz = juzNumbers.length === 0 ? undefined : juzNumbers.length === 1 ? juzNumbers[0] : juzNumbers;
    const lang = (langParam === 'en' ? 'en' : 'id') as 'id' | 'en';
    
    // Validate Juz
    if (juzNumbers.some(n => isNaN(n) || n < 1 || n > 30)) {
      return NextResponse.json({ error: 'Invalid Juz number. Must be between 1 and 30.' }, { status: 400 });
    }

    const generated = await generateQuestion(juz, surahParam || undefined, lang);
    
    // Transform to public Question type (hide correctAyahId)
    const publicQuestion: Question = {
      currentAyah: generated.currentAyah,
      options: generated.options
    };

    return NextResponse.json(publicQuestion);
  } catch (error) {
    console.error('Question API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question. Please try again.' },
      { status: 503 }
    );
  }
}

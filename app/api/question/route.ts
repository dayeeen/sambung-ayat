import { NextRequest, NextResponse } from 'next/server';
import { generateQuestion } from '../../../lib/question-generator';
import { Question } from '../../../types/quran';

export const revalidate = 0; // Dynamic, no caching for question generation

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const juzParam = searchParams.get('juz');
    const surahParam = searchParams.get('surah');
    const langParam = searchParams.get('lang');
    
    const juz = juzParam ? parseInt(juzParam, 10) : undefined;
    const lang = (langParam === 'en' ? 'en' : 'id') as 'id' | 'en';
    
    // Validate Juz
    if (juz && (isNaN(juz) || juz < 1 || juz > 30)) {
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

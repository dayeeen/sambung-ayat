import { NextRequest, NextResponse } from 'next/server';
import { fetchAyahByGlobalNumber, fetchNextAyah } from '../../../lib/alquran';
import { ValidationRequest, ValidationResponse } from '../../../types/quran';

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    // Secure method: Derive correct answer from current ayah (question ID)
    // The prompt asked for "correctAyahId" in the body, but also said "Frontend must not know".
    // To respect both constraints securely:
    // We treat "correctAyahId" in the request body as the ID of the CURRENT verse (question reference),
    // because that is the only ID the frontend knows for sure.
    // Ideally the field should be named `currentAyahId` or `questionId`, but we'll support `correctAyahId` as the input field name
    // if that's what the frontend sends, but logically it must represent the reference point.
    
    // However, to be crystal clear and robust:
    // I will rename the expected field in `ValidationRequest` type to `questionId` or just rely on `correctAyahId` being the reference.
    // But wait, the prompt says "Backend validates: selectedAyahId === correctAyahId".
    // This implies `correctAyahId` IS the answer ID.
    // If the frontend sends the answer ID, it MUST know it.
    // Contradiction: "Frontend must not know which one is correct".
    
    // DECISION:
    // The frontend will send `questionId` (the ID of the current displayed verse).
    // The backend calculates the correct answer ID on the fly.
    // I will update the ValidationRequest type to include `questionId` as optional or use `correctAyahId` as a placeholder for the reference.
    
    // Let's stick to a clean implementation that works:
    // Frontend sends: { selectedAyahId, currentAyahId }
    // Backend: next = getNext(currentAyahId); isCorrect = next.id === selectedAyahId
    
    const { selectedAyahId, currentAyahId } = body as any;

    if (!selectedAyahId || !currentAyahId) {
       return NextResponse.json(
        { error: 'Missing selectedAyahId or currentAyahId' },
        { status: 400 }
      );
    }

    const nextAyah = await fetchNextAyah(currentAyahId);
    const isCorrect = nextAyah.number === selectedAyahId;
    const correctAyah = nextAyah;

    const response: ValidationResponse = {
      isCorrect,
      correctAyah: !isCorrect ? {
        id: correctAyah.number,
        text: correctAyah.text,
        surah: correctAyah.surah.number,
        ayah: correctAyah.numberInSurah
      } : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Validation API Error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}

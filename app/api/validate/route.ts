import { NextRequest, NextResponse } from 'next/server';
import { fetchNextAyah } from '../../../lib/alquran';
import { ValidationRequest } from '../../../types/quran';
import { getCurrentUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { selectedAyahId, currentAyahId } = body;

    if (!selectedAyahId || !currentAyahId) {
       return NextResponse.json(
        { error: 'Missing selectedAyahId or currentAyahId' },
        { status: 400 }
      );
    }

    const nextAyah = await fetchNextAyah(currentAyahId);
    const isCorrect = nextAyah.number === selectedAyahId;
    const correctAyah = nextAyah;

    // Save Progress (Guest or Logged In)
    try {
      const user = await getCurrentUser();
      if (user) {
        // Create Answer Record
        await prisma.answer.create({
          data: {
            userId: user.id,
            ayahId: currentAyahId, // Using current ayah as question reference
            isCorrect: isCorrect,
            // sessionId is optional
          }
        });

        // Update User Stats
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            totalAttempted: { increment: 1 },
            totalCorrect: isCorrect ? { increment: 1 } : undefined,
            currentStreak: isCorrect ? { increment: 1 } : 0,
            lastActiveAt: new Date(),
          }
        });

        // Check and update Longest Streak
        if (isCorrect && updatedUser.currentStreak > updatedUser.longestStreak) {
           await prisma.user.update({
             where: { id: user.id },
             data: { longestStreak: updatedUser.currentStreak }
           });
        }
      }
    } catch (dbError) {
      console.error('Failed to save progress to DB:', dbError);
      // Continue without failing the request
    }

    return NextResponse.json({
      isCorrect,
      correctAyah: !isCorrect ? {
        id: correctAyah.number,
        text: correctAyah.text,
        surah: correctAyah.surah.number,
        ayah: correctAyah.numberInSurah
      } : undefined
    });

  } catch (error) {
    console.error('Validation API Error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}

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
    let currentStreak = 0;
    let longestStreak = 0;
    let currentCorrectStreak = 0;
    let sessionData = null;

    try {
      const user = await getCurrentUser();
      if (user) {
        // Find or Create Active Session
        let session = await prisma.session.findFirst({
          where: {
            userId: user.id,
            endedAt: null,
            totalQuestions: { lt: 10 }
          }
        });

        if (!session) {
          session = await prisma.session.create({
            data: { userId: user.id }
          });
        }

        // Streak Logic
        const now = new Date();
        const lastActive = new Date(user.lastActiveAt);
        
        // Normalize to local date (or UTC, consistent)
        // Using simple day comparison
        const isSameDay = now.toDateString() === lastActive.toDateString();
        
        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = yesterday.toDateString() === lastActive.toDateString();

        let newCurrentStreak = user.currentStreak;
        // @ts-ignore - Property exists after migration
        let newCurrentCorrectStreak = user.currentCorrectStreak || 0;

        // Point System Logic
        let gainedPoint = 0;
        // @ts-ignore
        let newComboStreak = session.comboStreak || 0;

        if (isCorrect) {
          if (isSameDay) {
            // No change to streak count, but ensure it's at least 1 if it was 0
             newCurrentStreak = Math.max(user.currentStreak, 1);
          } else if (isYesterday) {
            newCurrentStreak += 1;
          } else {
            // Missed a day or more (or first time)
            newCurrentStreak = 1;
          }
          newCurrentCorrectStreak += 1;

          // Points Calculation
          newComboStreak += 1;
          const basePoint = 10;
          const bonus = newComboStreak >= 3 ? newComboStreak * 5 : 0;
          gainedPoint = basePoint + bonus;

        } else {
          newCurrentCorrectStreak = 0;
          newComboStreak = 0;
        }

        // @ts-ignore
        const newMaxCombo = Math.max(session.maxCombo || 0, newComboStreak);
        const newTotalQuestions = session.totalQuestions + 1;
        const isSessionFinished = newTotalQuestions >= 10;

        // Update Session
        const updatedSession = await prisma.session.update({
          where: { id: session.id },
          data: {
            totalQuestions: { increment: 1 },
            correctAnswers: isCorrect ? { increment: 1 } : undefined,
            comboStreak: newComboStreak,
            maxCombo: newMaxCombo,
            totalPoints: { increment: gainedPoint },
            endedAt: isSessionFinished ? new Date() : undefined
          }
        });

        sessionData = {
          comboStreak: newComboStreak,
          pointsGained: gainedPoint,
          totalPoints: updatedSession.totalPoints,
          remainingQuestions: 10 - newTotalQuestions,
          sessionFinished: isSessionFinished
        };

        // Create Answer Record
        await prisma.answer.create({
          data: {
            userId: user.id,
            sessionId: session.id,
            ayahId: currentAyahId,
            isCorrect: isCorrect,
          }
        });

        // Update User Stats
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            totalAttempted: { increment: 1 },
            totalCorrect: isCorrect ? { increment: 1 } : undefined,
            currentStreak: isCorrect ? newCurrentStreak : undefined, // Only update streak on correct
            longestStreak: isCorrect && newCurrentStreak > user.longestStreak ? newCurrentStreak : undefined,
            
            currentCorrectStreak: newCurrentCorrectStreak,
            // @ts-ignore
            longestCorrectStreak: newCurrentCorrectStreak > (user.longestCorrectStreak || 0) ? newCurrentCorrectStreak : undefined,
            
            totalPoints: { increment: gainedPoint },
            lastActiveAt: isCorrect ? new Date() : undefined,
          }
        });
        
        currentStreak = updatedUser.currentStreak;
        longestStreak = updatedUser.longestStreak;
        // @ts-ignore
        currentCorrectStreak = updatedUser.currentCorrectStreak;
      }
    } catch (dbError) {
      console.error('Failed to save progress to DB:', dbError);
    }

    return NextResponse.json({
      isCorrect,
      currentStreak: isCorrect ? currentStreak : undefined,
      longestStreak: isCorrect ? longestStreak : undefined,
      currentCorrectStreak: isCorrect ? currentCorrectStreak : undefined,
      ...sessionData,
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

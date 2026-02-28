import { NextRequest, NextResponse } from "next/server";
import { fetchNextAyah, fetchAyahByGlobalNumber } from "../../../lib/alquran";
import { ValidationRequest } from "../../../types/quran";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { selectedAyahId, currentAyahId, sessionId, questionId } = body;

    if (!selectedAyahId || !currentAyahId) {
      return NextResponse.json(
        { error: "Missing selectedAyahId or currentAyahId" },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();

    // Tracked flow: sessionId + questionId required for saving points (anti-abuse)
    if (sessionId && questionId) {
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized. Sign in to save progress." },
          { status: 401 },
        );
      }

      const pending = await prisma.pendingQuestion.findUnique({
        where: { id: questionId },
        include: { session: true },
      });

      if (
        pending?.sessionId !== sessionId ||
        pending?.session?.userId !== user.id
      ) {
        return NextResponse.json(
          {
            error: "Invalid or expired question. Please refresh and try again.",
          },
          { status: 400 },
        );
      }

      if (pending.session.endedAt) {
        return NextResponse.json(
          { error: "Session has ended. Start a new session." },
          { status: 400 },
        );
      }

      const isCorrect = pending.correctAyahId === selectedAyahId;

      // Already answered: return result without adding points (anti-abuse)
      if (pending.answeredAt) {
        const correctAyah = await fetchAyahByGlobalNumber(
          pending.correctAyahId,
        );
        return NextResponse.json({
          isCorrect,
          pointsGained: 0,
          correctAyah: isCorrect
            ? undefined
            : {
                id: correctAyah.number,
                text: correctAyah.text,
                surah: correctAyah.surah.number,
                ayah: correctAyah.numberInSurah,
              },
        });
      }

      // Mark as answered immediately to prevent duplicate submissions
      await prisma.pendingQuestion.update({
        where: { id: questionId },
        data: { answeredAt: new Date() },
      });

      const session = pending.session;
      const maxQuestions = session.maxQuestions || 10;

      // Streak Logic
      const now = new Date();
      const lastActive = new Date(user.lastActiveAt);
      const isSameDay = now.toDateString() === lastActive.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        yesterday.toDateString() === lastActive.toDateString();

      let newCurrentStreak = user.currentStreak;
      let newCurrentCorrectStreak = user.currentCorrectStreak || 0;
      let gainedPoint = 0;
      let newComboStreak = session.comboStreak || 0;

      if (isCorrect) {
        if (isSameDay) {
          newCurrentStreak = Math.max(user.currentStreak, 1);
        } else if (isYesterday) {
          newCurrentStreak += 1;
        } else {
          newCurrentStreak = 1;
        }
        newCurrentCorrectStreak += 1;
        newComboStreak += 1;
        const basePoint = 10;
        const bonus = newComboStreak >= 3 ? newComboStreak * 5 : 0;
        gainedPoint = basePoint + bonus;
      } else {
        newCurrentCorrectStreak = 0;
        newComboStreak = 0;
      }

      const newMaxCombo = Math.max(session.maxCombo || 0, newComboStreak);
      const newTotalQuestions = session.totalQuestions + 1;
      const isSessionFinished = newTotalQuestions >= maxQuestions;

      const updatedSession = await prisma.session.update({
        where: { id: session.id },
        data: {
          totalQuestions: { increment: 1 },
          correctAnswers: isCorrect ? { increment: 1 } : undefined,
          comboStreak: newComboStreak,
          maxCombo: newMaxCombo,
          totalPoints: { increment: gainedPoint },
          endedAt: isSessionFinished ? new Date() : undefined,
        },
      });

      await prisma.answer.create({
        data: {
          userId: user.id,
          sessionId: session.id,
          ayahId: currentAyahId,
          isCorrect,
        },
      });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          totalAttempted: { increment: 1 },
          totalCorrect: isCorrect ? { increment: 1 } : undefined,
          currentStreak: isCorrect ? newCurrentStreak : undefined,
          longestStreak:
            isCorrect && newCurrentStreak > user.longestStreak
              ? newCurrentStreak
              : undefined,
          currentCorrectStreak: newCurrentCorrectStreak,
          longestCorrectStreak:
            newCurrentCorrectStreak > (user.longestCorrectStreak || 0)
              ? newCurrentCorrectStreak
              : undefined,
          totalPoints: { increment: gainedPoint },
          lastActiveAt: isCorrect ? new Date() : undefined,
        },
      });

      const correctAyah = await fetchAyahByGlobalNumber(pending.correctAyahId);

      return NextResponse.json({
        isCorrect,
        currentStreak: isCorrect ? updatedUser.currentStreak : undefined,
        longestStreak: isCorrect ? updatedUser.longestStreak : undefined,
        currentCorrectStreak: isCorrect
          ? updatedUser.currentCorrectStreak
          : undefined,
        comboStreak: newComboStreak,
        pointsGained: gainedPoint,
        totalPoints: updatedSession.totalPoints,
        remainingQuestions: maxQuestions - newTotalQuestions,
        sessionFinished: isSessionFinished,
        correctAyah: isCorrect
          ? undefined
          : {
              id: correctAyah.number,
              text: correctAyah.text,
              surah: correctAyah.surah.number,
              ayah: correctAyah.numberInSurah,
            },
      });
    }

    // Guest / legacy: validate correctness only, no points saved
    const nextAyah = await fetchNextAyah(currentAyahId);
    const isCorrect = nextAyah.number === selectedAyahId;

    return NextResponse.json({
      isCorrect,
      correctAyah: isCorrect
        ? undefined
        : {
            id: nextAyah.number,
            text: nextAyah.text,
            surah: nextAyah.surah.number,
            ayah: nextAyah.numberInSurah,
          },
    });
  } catch (error) {
    console.error("Validation API Error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}

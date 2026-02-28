import { NextRequest, NextResponse } from "next/server";
import { generateQuestion } from "../../../lib/question-generator";
import { Question } from "../../../types/quran";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const revalidate = 0; // Dynamic, no caching for question generation

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const juzParam = searchParams.getAll("juz").join(",");
    const surahParam = searchParams.getAll("surah").join(",");
    const langParam = searchParams.get("lang");
    const sessionIdParam = searchParams.get("sessionId");

    const juzNumbers = juzParam
      ? Array.from(
          new Set(
            juzParam
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .map((v) => Number.parseInt(v, 10)),
          ),
        )
      : [];

    let juz: number | number[] | undefined;
    if (juzNumbers.length === 0) {
      juz = undefined;
    } else if (juzNumbers.length === 1) {
      juz = juzNumbers[0];
    } else {
      juz = juzNumbers;
    }

    const lang = langParam === "en" ? "en" : "id";

    // Validate Juz
    if (juzNumbers.some((n) => Number.isNaN(n) || n < 1 || n > 30)) {
      return NextResponse.json(
        { error: "Invalid Juz number. Must be between 1 and 30." },
        { status: 400 },
      );
    }

    const generated = await generateQuestion(
      juz,
      surahParam || undefined,
      lang,
    );

    // Transform to public Question type (hide correctAyahId)
    const publicQuestion: Question = {
      currentAyah: generated.currentAyah,
      options: generated.options,
    };

    // If sessionId provided, create PendingQuestion and return questionId (for anti-abuse)
    if (sessionIdParam) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized. Session required for tracked play." },
          { status: 401 },
        );
      }

      const session = await prisma.session.findFirst({
        where: { id: sessionIdParam, userId: user.id, endedAt: null },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Invalid or expired session. Please start a new session." },
          { status: 400 },
        );
      }

      const pending = await prisma.pendingQuestion.create({
        data: {
          sessionId: session.id,
          currentAyahId: generated.currentAyah.id,
          correctAyahId: generated.correctAyahId,
        },
      });

      return NextResponse.json({
        questionId: pending.id,
        ...publicQuestion,
      });
    }

    return NextResponse.json(publicQuestion);
  } catch (error) {
    console.error("Question API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate question. Please try again." },
      { status: 503 },
    );
  }
}

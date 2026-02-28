import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to start a session.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const sessionLimit = typeof body.sessionLimit === 'number' ? body.sessionLimit : 10;

    // Close any existing active session
    await prisma.session.updateMany({
      where: { userId: user.id, endedAt: null },
      data: { endedAt: new Date() }
    });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        maxQuestions: Math.min(Math.max(1, sessionLimit), 100)
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Session start API Error:', error);
    return NextResponse.json(
      { error: 'Failed to start session.' },
      { status: 500 }
    );
  }
}

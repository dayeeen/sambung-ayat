import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isGuest: user.isGuest,
      totalCorrect: user.totalCorrect,
      totalPoints: user.totalPoints,
      longestStreak: user.longestStreak,
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
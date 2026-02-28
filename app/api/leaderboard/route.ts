import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy');

    let orderBy: Prisma.UserOrderByWithRelationInput[] = [];
    if (sortBy === 'correct') {
      orderBy = [
        { longestCorrectStreak: 'desc' },
        { totalCorrect: 'desc' },
      ];
    } else if (sortBy === 'daily') {
      orderBy = [
        { longestStreak: 'desc' },
        { totalCorrect: 'desc' },
      ];
    } else {
      orderBy = [
        { totalPoints: 'desc' },
        { longestStreak: 'desc' },
      ];
    }

    const topUsers = await prisma.user.findMany({
      where: {
        isGuest: false,
      },
      orderBy: orderBy,
      take: 10,
      select: {
        id: true,
        displayName: true,
        longestStreak: true,
        longestCorrectStreak: true,
        totalCorrect: true,
        totalPoints: true,
      },
    });

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

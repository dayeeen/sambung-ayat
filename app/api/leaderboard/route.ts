import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy");

    let orderBy: Prisma.UserOrderByWithRelationInput[] = [];
    if (sortBy === "correct") {
      orderBy = [{ longestCorrectStreak: "desc" }, { totalCorrect: "desc" }];
    } else if (sortBy === "daily") {
      orderBy = [{ longestStreak: "desc" }, { totalCorrect: "desc" }];
    } else {
      orderBy = [{ totalPoints: "desc" }, { longestStreak: "desc" }];
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

    // Get current user's rank
    let currentUserRank = null;
    let currentUserData = null;

    const supabase = await createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (sessionUser) {
      const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          displayName: true,
          longestStreak: true,
          longestCorrectStreak: true,
          totalCorrect: true,
          totalPoints: true,
        },
      });

      if (user) {
        currentUserData = user;

        let orCondition: Prisma.UserWhereInput[];
        if (sortBy === "correct") {
          orCondition = [
            { longestCorrectStreak: { gt: user.longestCorrectStreak } },
            {
              longestCorrectStreak: user.longestCorrectStreak,
              totalCorrect: { gt: user.totalCorrect },
            },
          ];
        } else if (sortBy === "daily") {
          orCondition = [
            { longestStreak: { gt: user.longestStreak } },
            {
              longestStreak: user.longestStreak,
              totalCorrect: { gt: user.totalCorrect },
            },
          ];
        } else {
          orCondition = [
            { totalPoints: { gt: user.totalPoints } },
            {
              totalPoints: user.totalPoints,
              longestStreak: { gt: user.longestStreak },
            },
          ];
        }

        const betterUsersCount = await prisma.user.count({
          where: {
            isGuest: false,
            OR: orCondition,
          },
        });

        currentUserRank = betterUsersCount + 1;
      }
    }

    return NextResponse.json({
      topUsers,
      currentUser: currentUserData
        ? {
            ...currentUserData,
            rank: currentUserRank,
          }
        : null,
    });
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}

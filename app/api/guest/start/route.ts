import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const GUEST_COOKIE = 'guest_id';

export async function POST() {
  try {
    const cookieStore = await cookies();
    let guestId = cookieStore.get(GUEST_COOKIE)?.value;

    if (!guestId) {
      guestId = crypto.randomUUID();
      cookieStore.set(GUEST_COOKIE, guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 * 1,
      });
    }

    let user = await prisma.user.findUnique({
      where: { id: guestId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: guestId!,
          isGuest: true,
          displayName: `Hamba-${Math.floor(Math.random() * 9000) + 1000}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Guest start error:', error);
    return NextResponse.json(
      { error: 'Failed to start guest session' },
      { status: 500 }
    );
  }
}

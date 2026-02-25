import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { displayName } = await request.json();
    
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    if (displayName.length > 50) {
      return NextResponse.json(
        { error: 'Display name must be 50 characters or less' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: displayName.trim() },
      select: {
        id: true,
        displayName: true,
        email: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Display Name Error:', error);
    return NextResponse.json(
      { error: 'Failed to update display name' },
      { status: 500 }
    );
  }
}

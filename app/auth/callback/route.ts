import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { prisma } from '../../../lib/prisma'
import { cookies } from 'next/headers'

const GUEST_COOKIE = 'guest_id'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data: { user: supabaseUser } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && supabaseUser) {
      // Logic to merge guest data
      const cookieStore = await cookies()
      const guestId = cookieStore.get(GUEST_COOKIE)?.value

      if (guestId) {
        // Find Guest Data
        const guestUser = await prisma.user.findUnique({
          where: { id: guestId, isGuest: true },
          include: { sessions: true, answers: true }
        })

        if (guestUser) {
          // Check if Supabase user already exists in DB
          let dbUser = await prisma.user.findUnique({
            where: { id: supabaseUser.id }
          })

          if (!dbUser) {
            // New User: Create with Supabase ID
            // If user doesn't exist, we create one with guest's stats
            dbUser = await prisma.user.create({
              data: {
                id: supabaseUser.id,
                email: supabaseUser.email,
                provider: 'google',
                displayName: supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'Hamba Allah',
                isGuest: false,
                // Inherit stats
                totalCorrect: guestUser.totalCorrect,
                totalAttempted: guestUser.totalAttempted,
                currentStreak: guestUser.currentStreak,
                longestStreak: guestUser.longestStreak,
                lastActiveAt: guestUser.lastActiveAt // Keep guest's last active or use now? Guest's seems fine.
              }
            })
          } else {
            // Existing User: Merge stats
            // We simply add the counts. 
            // For streaks, we could take the max, but adding counts is safer for total progress.
            // Logic: Total attempts/correct are additive. Streaks are not really additive.
            // Let's just add totals.
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                totalCorrect: { increment: guestUser.totalCorrect },
                totalAttempted: { increment: guestUser.totalAttempted },
                // Update display name if missing
                displayName: dbUser.displayName ? undefined : (supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'Hamba Allah'),
              }
            })
          }

          // Move Answers and Sessions to new User ID
          // Use transaction for safety
          await prisma.$transaction([
            prisma.answer.updateMany({
              where: { userId: guestId },
              data: { userId: dbUser.id }
            }),
            prisma.session.updateMany({
              where: { userId: guestId },
              data: { userId: dbUser.id }
            }),
            // Delete Guest User
            prisma.user.delete({
              where: { id: guestId }
            })
          ])

          // Clear Guest Cookie
          cookieStore.delete(GUEST_COOKIE)
        }
      } else {
         // No guest ID, ensure DB user exists for logged in user
          const dbUser = await prisma.user.findUnique({
            where: { id: supabaseUser.id }
          })
          
          if (!dbUser) {
             await prisma.user.create({
                data: {
                  id: supabaseUser.id,
                  email: supabaseUser.email,
                  provider: 'google',
                  displayName: supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'Hamba Allah',
                  isGuest: false,
                }
             })
          } else if (!dbUser.displayName) {
             // Update display name if missing for existing user
             await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                   displayName: supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'Hamba Allah'
                }
             })
          }
      }
    }
  }

  // Redirect to original page
  return NextResponse.redirect(new URL(next, origin))
}

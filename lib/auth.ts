import { createClient } from './supabase/server'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

const GUEST_COOKIE = 'guest_id'

export async function getCurrentUser() {
  const supabase = await createClient()
  
  // 1. Check Supabase Auth
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

  if (supabaseUser) {
    // Return DB user linked to Supabase
    let dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    })
    
    // If DB user doesn't exist but Supabase does (first login or sync issue), create it
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          provider: supabaseUser.app_metadata.provider || 'google',
          displayName: supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'Hamba Allah',
          isGuest: false
        }
      })
    }
    return dbUser
  }

  // 2. Check Guest Cookie
  const cookieStore = await cookies()
  const guestId = cookieStore.get(GUEST_COOKIE)?.value

  if (guestId) {
    let guestUser = await prisma.user.findUnique({
      where: { id: guestId }
    })
    
    // Create guest if missing (lazy creation)
    if (!guestUser) {
      try {
        guestUser = await prisma.user.create({
          data: {
            id: guestId,
            isGuest: true,
            displayName: `Hamba-${Math.floor(Math.random() * 9000) + 1000}`
          }
        })
      } catch (e) {
        // Handle race condition where middleware sets cookie but DB create fails (e.g. duplicate)
        // Retry fetch
        guestUser = await prisma.user.findUnique({ where: { id: guestId } })
      }
    }
    return guestUser
  }

  // Should not happen if middleware is working
  return null
}

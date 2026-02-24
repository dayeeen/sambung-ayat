import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const GUEST_COOKIE = 'guest_id'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Refresh Supabase Session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  // 2. Ensure Guest Cookie
  let guestId = request.cookies.get(GUEST_COOKIE)?.value
  
  if (!guestId) {
    guestId = crypto.randomUUID()
    
    // Create new headers to pass the cookie to downstream (Server Components/API)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('cookie', request.cookies.toString() + `; ${GUEST_COOKIE}=${guestId}`)
    
    // Update response with new request headers
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Set cookie on the response for the client
    response.cookies.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

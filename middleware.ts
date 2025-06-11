import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update the session first
  const response = await updateSession(request)
  
  // Get the pathname
  const pathname = request.nextUrl.pathname
  
  // Check if user is trying to access the dashboard
  if (pathname === '/dashboard') {
    // Redirect to feed instead
    return NextResponse.redirect(new URL('/feed', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
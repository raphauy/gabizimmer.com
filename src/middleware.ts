import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { nextUrl } = request
  
  // Skip middleware for static files and API routes
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Get token using JWT approach (works in Edge Runtime)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-authjs.session-token' 
      : 'authjs.session-token'
  })
  
  const isLoggedIn = !!token
  const userRole = token?.role as string || ""

  // Public routes (no authentication required) - Landing page is public
  const publicRoutes = ["/login", "/", "/register"]
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  
  if (isPublicRoute) {
    // Only redirect logged-in users from login page, not from landing
    if (isLoggedIn && nextUrl.pathname === "/login") {
      // Redirect authenticated users to admin panel
      return NextResponse.redirect(new URL("/admin", nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Role-based access control
  // Only superadmins can access /admin
  if (nextUrl.pathname.startsWith("/admin") && userRole !== "superadmin") {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
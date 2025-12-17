import NextAuth from "next-auth"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    const isDashboard = nextUrl.pathname.startsWith('/dashboard')
    const isAuthRoute = nextUrl.pathname.startsWith('/auth')
    const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
    const isPublicRoute = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/topic') // Allow reading topics? Maybe some of them. Let's say landing is public.

    if (isApiAuthRoute) {
        return null as any // Allow default response for auth routes
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', nextUrl))
        }
        return null
    }

    if (!isLoggedIn && !isPublicRoute) {
        // Redirect to login if trying to access private route
        // For now, let's assume everything except landing and auth is protected or semi-protected.
        // If student needs to access /topics, they need login (per requirements student reads theory).
        // So /topics is protected.
        return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }

    return null
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

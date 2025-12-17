import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnQuiz = nextUrl.pathname.startsWith('/quiz')

            if (isOnDashboard || isOnQuiz) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (nextUrl.pathname === '/auth/login' || nextUrl.pathname === '/auth/register')) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }

            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.userId = user.id
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as string
                session.user.id = token.userId as string
            }
            return session
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig

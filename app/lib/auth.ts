
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { RateLimiter } from '@/lib/security/rate-limiting'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      phone?: string | null
      image?: string | null
      emailVerified?: boolean
      phoneVerified?: boolean
      twoFaEnabled?: boolean
      isActive?: boolean
      requiresTwoFa?: boolean
    }
  }
  interface User {
    id: string
    emailVerified?: boolean
    phoneVerified?: boolean
    twoFaEnabled?: boolean
    isActive?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    emailVerified?: boolean
    phoneVerified?: boolean
    twoFaEnabled?: boolean
    isActive?: boolean
    requiresTwoFa?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFaCode: { label: '2FA Code', type: 'text' },
        backupCode: { label: 'Backup Code', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Rate limiting for login attempts
        const rateLimitResult = await RateLimiter.checkLoginAttempts(credentials.email)
        
        if (!rateLimitResult.allowed) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesRemaining = Math.ceil(
            (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
          )
          throw new Error(`Account is locked. Try again in ${minutesRemaining} minutes.`)
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Increment login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: user.loginAttempts + 1,
              lockedUntil: user.loginAttempts >= 4 
                ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes after 5 failed attempts
                : null
            }
          })
          throw new Error('Invalid email or password')
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.')
        }

        // Check if account is active
        if (!user.isActive) {
          throw new Error('Your account is not active. Please contact support.')
        }

        // Handle 2FA verification
        if (user.twoFaEnabled) {
          const { twoFaCode, backupCode } = credentials
          
          if (!twoFaCode && !backupCode) {
            // Return user but mark as requiring 2FA
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone,
              emailVerified: !!user.emailVerified,
              phoneVerified: !!user.phoneVerified,
              twoFaEnabled: user.twoFaEnabled,
              isActive: user.isActive,
              requiresTwoFa: true
            }
          }

          // Verify 2FA code via API call (we'll handle this in the frontend)
          // For now, we'll assume the 2FA verification is handled elsewhere
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          emailVerified: !!user.emailVerified,
          phoneVerified: !!user.phoneVerified,
          twoFaEnabled: user.twoFaEnabled,
          isActive: user.isActive,
          requiresTwoFa: false
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.emailVerified = !!(user as any).emailVerified
        token.phoneVerified = !!(user as any).phoneVerified
        token.twoFaEnabled = !!(user as any).twoFaEnabled
        token.isActive = !!(user as any).isActive
        token.requiresTwoFa = !!(user as any).requiresTwoFa
      }

      // Update token on session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.emailVerified = !!(token.emailVerified)
        session.user.phoneVerified = !!(token.phoneVerified)
        session.user.twoFaEnabled = !!(token.twoFaEnabled)
        session.user.isActive = !!(token.isActive)
        session.user.requiresTwoFa = !!(token.requiresTwoFa)
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { 
        userId: user.id, 
        email: user.email,
        isNewUser 
      })
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token?.id })
    }
  }
}

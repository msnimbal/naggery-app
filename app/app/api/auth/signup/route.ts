
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { VerificationService } from '@/lib/security/verification'
import { EmailService } from '@/lib/security/email-service'
import { SecurityUtils } from '@/lib/security/encryption'
import { RateLimiter } from '@/lib/security/rate-limiting'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, gender, termsAccepted } = await request.json()

    if (!name || !email || !password || !phone || !gender) {
      return NextResponse.json(
        { error: 'Name, email, password, phone number, and gender are required' },
        { status: 400 }
      )
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the Terms and Conditions to create an account' },
        { status: 400 }
      )
    }

    // Validate gender
    const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender selection' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!SecurityUtils.isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone number
    const formattedPhone = SecurityUtils.formatPhone(phone)
    if (!SecurityUtils.isValidPhone(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please include country code (e.g., +1234567890)' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = SecurityUtils.isPasswordStrong(password)
    if (!passwordValidation.isStrong) {
      return NextResponse.json(
        { error: 'Password requirements not met', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await RateLimiter.checkLoginAttempts(clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    // Check if user already exists with email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if user already exists with phone
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: formattedPhone }
    })

    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (inactive until email verification)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: formattedPhone,
        gender,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        isActive: false // User must verify email first
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        isActive: true,
        createdAt: true
      }
    })

    // Create email verification request
    const { token } = await VerificationService.createVerificationRequest(
      user.id,
      'EMAIL_VERIFICATION'
    )

    // Send verification email (mock in development)
    const emailSent = await EmailService.sendVerificationEmail(
      user.email,
      token,
      user.name || 'User'
    )

    if (!emailSent) {
      // If email sending fails, still return success but mention the issue
      console.error('Failed to send verification email')
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully! Please check your email to verify your account before logging in.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        nextStep: 'email_verification'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { VerificationService } from '@/lib/security/verification'
import { RateLimiter } from '@/lib/security/rate-limiting'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await RateLimiter.checkVerificationAttempts(clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    // Verify the email token
    const isValid = await VerificationService.verifyEmailToken(token)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Get the verification request to update user
    const verificationRequest = await VerificationService.getVerificationRequest(token)
    
    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      )
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: verificationRequest.userId },
      data: { 
        emailVerified: new Date(),
        isActive: true // Activate account after email verification
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email verified successfully! You can now log in.' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitResult = await RateLimiter.checkVerificationAttempts(email)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Create verification request
    const { token } = await VerificationService.createVerificationRequest(
      user.id,
      'EMAIL_VERIFICATION'
    )

    // Send verification email (mock in development)
    const emailSent = true // Mock success
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    console.log(`\n=== EMAIL VERIFICATION RESEND ===`)
    console.log(`Email: ${email}`)
    console.log(`Verification URL: ${process.env.NEXTAUTH_URL}/verify-email?token=${token}`)
    console.log(`================================\n`)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Verification email sent successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

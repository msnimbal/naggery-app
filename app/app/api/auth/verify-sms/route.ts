
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { VerificationService } from '@/lib/security/verification'
import { SMSService } from '@/lib/security/sms-service'
import { RateLimiter } from '@/lib/security/rate-limiting'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Send SMS verification code
export async function POST(request: NextRequest) {
  try {
    const { phone, userId } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!SMSService.validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please include country code (e.g., +1234567890)' },
        { status: 400 }
      )
    }

    // Rate limiting for SMS
    const rateLimitResult = await RateLimiter.checkSMSAttempts(phone)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    let user
    if (userId) {
      // For logged-in users updating phone
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
    } else {
      // For signup process
      user = await prisma.user.findUnique({
        where: { phone }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create verification request
    const { code } = await VerificationService.createVerificationRequest(
      user.id,
      'SMS_VERIFICATION'
    )

    // Send SMS (mock in development)
    const smsSent = await SMSService.sendVerificationSMS(phone, code!)
    
    if (!smsSent) {
      return NextResponse.json(
        { error: 'Failed to send SMS verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'SMS verification code sent successfully',
        maskedPhone: SMSService.maskPhoneNumber(phone)
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('SMS verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify SMS code
export async function PUT(request: NextRequest) {
  try {
    const { token, code } = await request.json()

    if (!token || !code) {
      return NextResponse.json(
        { error: 'Token and verification code are required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await RateLimiter.checkVerificationAttempts(`${clientIP}:${token}`)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    // Verify the SMS code
    const isValid = await VerificationService.verifyCode(token, code)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
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

    // Update user phone verification status
    await prisma.user.update({
      where: { id: verificationRequest.userId },
      data: { 
        phoneVerified: new Date()
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Phone number verified successfully!' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('SMS code verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

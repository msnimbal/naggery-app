
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TwoFactorAuth } from '@/lib/security/two-factor'
import { RateLimiter } from '@/lib/security/rate-limiting'

export const dynamic = 'force-dynamic'

// Generate 2FA secret and QR code
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitResult = await RateLimiter.check2FAAttempts(session.user.id)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.twoFaEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      )
    }

    // Generate secret and QR code
    const secret = TwoFactorAuth.generateSecret()
    const qrCodeUrl = await TwoFactorAuth.generateQRCode(
      secret,
      user.email,
      'Naggery'
    )

    // Generate backup codes
    const backupCodes = TwoFactorAuth.generateBackupCodes()

    // Store the secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFaSecret: secret }
    })

    // Store backup codes
    await prisma.backupCode.deleteMany({
      where: { userId: user.id }
    })

    await prisma.backupCode.createMany({
      data: backupCodes.map(code => ({
        userId: user.id,
        code
      }))
    })

    return NextResponse.json(
      {
        secret,
        qrCodeUrl,
        backupCodes,
        message: 'Scan the QR code with your authenticator app, then verify with a code to enable 2FA'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitResult = await RateLimiter.check2FAAttempts(session.user.id)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.twoFaSecret) {
      return NextResponse.json(
        { error: 'No 2FA setup found. Please start the setup process first.' },
        { status: 400 }
      )
    }

    if (user.twoFaEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      )
    }

    // Verify the code
    const isValid = TwoFactorAuth.verifyToken(code, user.twoFaSecret)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFaEnabled: true }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '2FA enabled successfully! Your account is now more secure.' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { code, backupCode } = await request.json()

    if (!code && !backupCode) {
      return NextResponse.json(
        { error: '2FA code or backup code is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { backupCodes: true }
    })

    if (!user || !user.twoFaEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    let isValid = false

    if (code && user.twoFaSecret) {
      // Verify with 2FA code
      isValid = TwoFactorAuth.verifyToken(code, user.twoFaSecret)
    } else if (backupCode) {
      // Verify with backup code
      const validBackupCode = user.backupCodes.find(
        bc => bc.code === backupCode.toUpperCase() && !bc.used
      )
      
      if (validBackupCode) {
        isValid = true
        // Mark backup code as used
        await prisma.backupCode.update({
          where: { id: validBackupCode.id },
          data: { used: true, usedAt: new Date() }
        })
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code or backup code' },
        { status: 400 }
      )
    }

    // Disable 2FA and clean up
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFaEnabled: false,
        twoFaSecret: null
      }
    })

    // Delete all backup codes
    await prisma.backupCode.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '2FA disabled successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TwoFactorAuth } from '@/lib/security/two-factor'
import { RateLimiter } from '@/lib/security/rate-limiting'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Verify 2FA code during login
export async function POST(request: NextRequest) {
  try {
    const { userId, code, backupCode } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!code && !backupCode) {
      return NextResponse.json(
        { error: '2FA code or backup code is required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitResult = await RateLimiter.check2FAAttempts(userId)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { backupCodes: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.twoFaEnabled || !user.twoFaSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this user' },
        { status: 400 }
      )
    }

    let isValid = false
    let backupCodeUsed = false

    if (code) {
      // Verify with 2FA code
      isValid = TwoFactorAuth.verifyToken(code, user.twoFaSecret)
    } else if (backupCode) {
      // Verify with backup code
      const validBackupCode = user.backupCodes.find(
        bc => bc.code === backupCode.toUpperCase() && !bc.used
      )
      
      if (validBackupCode) {
        isValid = true
        backupCodeUsed = true
        
        // Mark backup code as used
        await prisma.backupCode.update({
          where: { id: validBackupCode.id },
          data: { used: true, usedAt: new Date() }
        })
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 2FA code or backup code' },
        { status: 400 }
      )
    }

    // Reset login attempts on successful 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        loginAttempts: 0,
        lockedUntil: null
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '2FA verification successful',
        backupCodeUsed
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

// Get backup codes (for authenticated users)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const backupCodes = await prisma.backupCode.findMany({
      where: { 
        userId: session.user.id,
        used: false
      },
      select: {
        code: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const usedBackupCodes = await prisma.backupCode.count({
      where: { 
        userId: session.user.id,
        used: true
      }
    })

    return NextResponse.json(
      {
        backupCodes: backupCodes.map(bc => bc.code),
        usedCount: usedBackupCodes,
        totalCount: backupCodes.length + usedBackupCodes
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get backup codes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SecuritySettings } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Get security settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        backupCodes: {
          select: { used: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const emailVerified = !!user.emailVerified
    const phoneVerified = !!user.phoneVerified
    const twoFaEnabled = user.twoFaEnabled
    const backupCodesGenerated = user.backupCodes.length > 0

    let verificationStep: SecuritySettings['verificationStep'] = 'complete'

    if (!emailVerified) {
      verificationStep = 'email'
    } else if (!phoneVerified) {
      verificationStep = 'phone'
    } else if (!twoFaEnabled) {
      verificationStep = '2fa'
    }

    const securitySettings: SecuritySettings = {
      emailVerified,
      phoneVerified,
      twoFaEnabled,
      backupCodesGenerated,
      verificationStep
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      twoFaEnabled: user.twoFaEnabled,
      isActive: user.isActive,
      loginAttempts: user.loginAttempts,
      lockedUntil: user.lockedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json(
      {
        user: userInfo,
        security: securitySettings,
        backupCodesCount: {
          total: user.backupCodes.length,
          used: user.backupCodes.filter(bc => bc.used).length,
          remaining: user.backupCodes.filter(bc => !bc.used).length
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get security settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user profile (phone number, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, phone } = await request.json()

    const updateData: any = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (phone !== undefined) {
      if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Please include country code (e.g., +1234567890)' },
          { status: 400 }
        )
      }

      // Check if phone number is already taken by another user
      if (phone) {
        const existingUser = await prisma.user.findFirst({
          where: {
            phone,
            id: { not: session.user.id }
          }
        })

        if (existingUser) {
          return NextResponse.json(
            { error: 'This phone number is already associated with another account' },
            { status: 400 }
          )
        }
      }

      updateData.phone = phone
      
      // Reset phone verification if phone number changed
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (currentUser?.phone !== phone) {
        updateData.phoneVerified = null
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        twoFaEnabled: true,
        isActive: true,
        updatedAt: true
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

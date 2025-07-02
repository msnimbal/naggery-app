
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SecurityUtils } from '@/lib/security/encryption'
import { ApiProvider } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyName, apiKey, isActive } = await request.json()

    // Find the API key
    const existingApiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingApiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    let updateData: any = {}

    if (keyName !== undefined) {
      updateData.keyName = keyName.trim()
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (apiKey) {
      // Validate new API key format
      const validation = SecurityUtils.validateApiKeyFormat(apiKey, existingApiKey.provider)
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      // Encrypt the new API key
      updateData.encryptedKey = SecurityUtils.encryptApiKey(apiKey)
    }

    // Update the API key
    const updatedApiKey = await prisma.apiKey.update({
      where: {
        id: params.id
      },
      data: updateData,
      select: {
        id: true,
        provider: true,
        keyName: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'API key updated successfully',
      apiKey: updatedApiKey
    })

  } catch (error) {
    console.error('Update API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find and delete the API key
    const deletedApiKey = await prisma.apiKey.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (deletedApiKey.count === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'API key deleted successfully'
    })

  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SecurityUtils } from '@/lib/security/encryption'
import { ApiProvider } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        provider: true,
        keyName: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, keyName, apiKey } = await request.json()

    if (!provider || !keyName || !apiKey) {
      return NextResponse.json(
        { error: 'Provider, key name, and API key are required' },
        { status: 400 }
      )
    }

    // Validate API key format
    const validation = SecurityUtils.validateApiKeyFormat(apiKey, provider as ApiProvider)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if user already has an API key for this provider
    const existingKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider as ApiProvider
        }
      }
    })

    if (existingKey) {
      return NextResponse.json(
        { error: `You already have an API key for ${provider}. Please update the existing one instead.` },
        { status: 409 }
      )
    }

    // Encrypt the API key
    const encryptedKey = SecurityUtils.encryptApiKey(apiKey)

    // Save to database
    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        provider: provider as ApiProvider,
        keyName: keyName.trim(),
        encryptedKey,
        isActive: true
      },
      select: {
        id: true,
        provider: true,
        keyName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'API key saved successfully',
      apiKey: newApiKey
    }, { status: 201 })

  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

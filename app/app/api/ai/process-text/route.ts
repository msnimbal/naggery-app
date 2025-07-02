
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AiProcessingService } from '@/lib/ai-processing'
import { SecurityUtils } from '@/lib/security/encryption'
import { ApiProvider } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      text, 
      entryId, 
      provider, 
      options 
    } = await request.json()

    if (!text || !provider) {
      return NextResponse.json(
        { error: 'Text and provider are required' },
        { status: 400 }
      )
    }

    // Get user's API key for the specified provider
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider as ApiProvider
        }
      }
    })

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return NextResponse.json(
        { error: `No active ${provider} API key found. Please add one in your security settings.` },
        { status: 400 }
      )
    }

    // Decrypt the API key
    let decryptedApiKey: string
    try {
      decryptedApiKey = SecurityUtils.decryptApiKey(apiKeyRecord.encryptedKey)
    } catch (error) {
      console.error('Failed to decrypt API key:', error)
      return NextResponse.json(
        { error: 'Failed to decrypt API key. Please update your API key.' },
        { status: 500 }
      )
    }

    // Update entry status to GENERATING if entryId provided
    if (entryId) {
      const entry = await prisma.entry.findFirst({
        where: {
          id: entryId,
          userId: session.user.id
        }
      })

      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
      }

      await prisma.entry.update({
        where: { id: entryId },
        data: { 
          processingStatus: 'GENERATING',
          aiProvider: provider
        }
      })
    }

    // Process the text with AI
    const result = await AiProcessingService.processText(
      text,
      provider as ApiProvider,
      decryptedApiKey,
      options
    )

    // Update API key last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() }
    })

    if (result.success) {
      // Update entry with AI notes if entryId provided
      if (entryId) {
        await prisma.entry.update({
          where: { id: entryId },
          data: { 
            aiNotes: result.notes,
            processingStatus: 'COMPLETED'
          }
        })
      }

      return NextResponse.json({
        success: true,
        notes: result.notes,
        categories: result.categories,
        keyPoints: result.keyPoints,
        emotionalContext: result.emotionalContext,
        provider: result.provider
      })
    } else {
      // Update entry status to FAILED if entryId provided
      if (entryId) {
        await prisma.entry.update({
          where: { id: entryId },
          data: { processingStatus: 'FAILED' }
        })
      }

      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('AI processing error:', error)
    
    // Update entry status to FAILED if error occurred
    const { entryId } = await request.json().catch(() => ({}))
    if (entryId) {
      try {
        await prisma.entry.update({
          where: { id: entryId },
          data: { processingStatus: 'FAILED' }
        })
      } catch (updateError) {
        console.error('Failed to update entry status:', updateError)
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

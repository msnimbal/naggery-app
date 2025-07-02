
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const mood = searchParams.get('mood')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {
      userId: session.user.id
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (mood && mood !== 'all') {
      where.mood = mood
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const entries = await prisma.entry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        voiceUrl: true,
        transcription: true,
        aiNotes: true,
        processingStatus: true,
        aiProvider: true,
        mood: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const total = await prisma.entry.count({ where })

    return NextResponse.json({
      entries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get entries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      type, 
      title, 
      content, 
      voiceUrl, 
      transcription,
      aiNotes,
      processingStatus,
      aiProvider,
      mood 
    } = await request.json()

    if (!type || !mood) {
      return NextResponse.json(
        { error: 'Type and mood are required' },
        { status: 400 }
      )
    }

    if (type === 'TEXT' && !content && !transcription) {
      return NextResponse.json(
        { error: 'Content or transcription is required for text entries' },
        { status: 400 }
      )
    }

    if (type === 'VOICE' && !voiceUrl && !transcription) {
      return NextResponse.json(
        { error: 'Voice URL or transcription is required for voice entries' },
        { status: 400 }
      )
    }

    const entry = await prisma.entry.create({
      data: {
        userId: session.user.id,
        type,
        title,
        content,
        voiceUrl,
        transcription,
        aiNotes,
        processingStatus: processingStatus || 'NONE',
        aiProvider,
        mood
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        voiceUrl: true,
        transcription: true,
        aiNotes: true,
        processingStatus: true,
        aiProvider: true,
        mood: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Create entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

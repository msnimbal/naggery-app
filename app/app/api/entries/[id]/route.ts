
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = await prisma.entry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        voiceUrl: true,
        mood: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Get entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, mood } = await request.json()

    const entry = await prisma.entry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const updatedEntry = await prisma.entry.update({
      where: { id: params.id },
      data: {
        title,
        content,
        mood
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        voiceUrl: true,
        mood: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Update entry error:', error)
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

    const entry = await prisma.entry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    await prisma.entry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Delete entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

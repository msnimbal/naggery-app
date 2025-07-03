
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { encryptData, decryptData } from "@/lib/encryption"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    let whereClause: any = {
      userId: session.user.id
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add tag filtering
    if (tag) {
      whereClause.tags = {
        has: tag
      }
    }

    const entries = await prisma.journalEntry.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        encrypted: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Decrypt content if encrypted
    const decryptedEntries = entries.map(entry => ({
      ...entry,
      content: entry.encrypted ? decryptData(entry.content) : entry.content
    }))

    return NextResponse.json(decryptedEntries)

  } catch (error) {
    console.error("Get journal entries error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, tags, encrypt = true } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Encrypt content if requested
    const finalContent = encrypt ? encryptData(content) : content

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        title,
        content: finalContent,
        tags: tags || [],
        encrypted: encrypt,
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        encrypted: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Return decrypted content for frontend
    const responseEntry = {
      ...entry,
      content: entry.encrypted ? decryptData(entry.content) : entry.content
    }

    return NextResponse.json(responseEntry)

  } catch (error) {
    console.error("Create journal entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

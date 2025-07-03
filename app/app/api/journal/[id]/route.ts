
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { encryptData, decryptData } from "@/lib/encryption"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
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

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // Decrypt content if encrypted
    const decryptedEntry = {
      ...entry,
      content: entry.encrypted ? decryptData(entry.content) : entry.content
    }

    return NextResponse.json(decryptedEntry)

  } catch (error) {
    console.error("Get journal entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // Encrypt content if requested
    const finalContent = encrypt ? encryptData(content) : content

    const entry = await prisma.journalEntry.update({
      where: { id: params.id },
      data: {
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
    console.error("Update journal entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    await prisma.journalEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Entry deleted successfully" })

  } catch (error) {
    console.error("Delete journal entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

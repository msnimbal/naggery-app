
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { decryptData } from "@/lib/encryption"

export const dynamic = "force-dynamic"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if recording exists and belongs to user
    const existingRecording = await prisma.voiceRecording.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingRecording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 })
    }

    await prisma.voiceRecording.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Recording deleted successfully" })

  } catch (error) {
    console.error("Delete voice recording error:", error)
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

    const { title } = await request.json()

    // Check if recording exists and belongs to user
    const existingRecording = await prisma.voiceRecording.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingRecording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 })
    }

    const recording = await prisma.voiceRecording.update({
      where: { id: params.id },
      data: { title },
      select: {
        id: true,
        title: true,
        audioFileUrl: true,
        transcription: true,
        duration: true,
        encrypted: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Return decrypted transcription for frontend
    const responseRecording = {
      ...recording,
      transcription: recording.encrypted && recording.transcription 
        ? decryptData(recording.transcription) 
        : recording.transcription
    }

    return NextResponse.json(responseRecording)

  } catch (error) {
    console.error("Update voice recording error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


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

    const recordings = await prisma.voiceRecording.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        audioFileUrl: true,
        transcription: true,
        duration: true,
        encrypted: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Decrypt transcriptions if encrypted
    const decryptedRecordings = recordings.map(recording => ({
      ...recording,
      transcription: recording.encrypted && recording.transcription 
        ? decryptData(recording.transcription) 
        : recording.transcription
    }))

    return NextResponse.json(decryptedRecordings)

  } catch (error) {
    console.error("Get voice recordings error:", error)
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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const title = formData.get('title') as string
    const duration = parseInt(formData.get('duration') as string)

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      )
    }

    // Convert audio file to base64 for storage (in a real app, you'd store in cloud storage)
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    const audioDataUrl = `data:${audioFile.type};base64,${audioBase64}`

    // Get transcription using LLM API
    let transcription = null
    try {
      const transcriptionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/voice-notes/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: audioDataUrl,
          mimeType: audioFile.type
        })
      })

      if (transcriptionResponse.ok) {
        const transcriptionData = await transcriptionResponse.json()
        transcription = transcriptionData.transcription
      }
    } catch (error) {
      console.error('Transcription error:', error)
      // Continue without transcription if it fails
    }

    // Encrypt transcription if present
    const finalTranscription = transcription ? encryptData(transcription) : null

    const recording = await prisma.voiceRecording.create({
      data: {
        userId: session.user.id,
        title: title || null,
        audioFileUrl: audioDataUrl,
        transcription: finalTranscription,
        duration: duration || null,
        encrypted: !!transcription,
      },
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
    console.error("Create voice recording error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

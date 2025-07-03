
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { decryptData } from "@/lib/encryption"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        createdAt: true,
      }
    })

    // Get journal entries
    const journalEntries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        encrypted: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Decrypt journal entries if encrypted
    const decryptedEntries = journalEntries.map(entry => ({
      ...entry,
      content: entry.encrypted ? decryptData(entry.content) : entry.content
    }))

    // Get voice recordings
    const voiceRecordings = await prisma.voiceRecording.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        transcription: true,
        duration: true,
        encrypted: true,
        createdAt: true,
        updatedAt: true,
        // Note: audioFileUrl is excluded for privacy/size reasons
      },
      orderBy: { createdAt: 'desc' }
    })

    // Decrypt transcriptions if encrypted
    const decryptedRecordings = voiceRecordings.map(recording => ({
      ...recording,
      transcription: recording.encrypted && recording.transcription 
        ? decryptData(recording.transcription) 
        : recording.transcription
    }))

    // Get settings
    const settings = await prisma.userSettings.findFirst({
      where: { userId },
      select: {
        privacySettings: true,
        notificationPreferences: true,
        themePreferences: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Compile export data
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        appName: "Naggery"
      },
      user,
      journalEntries: decryptedEntries,
      voiceRecordings: decryptedRecordings,
      settings,
      statistics: {
        totalJournalEntries: decryptedEntries.length,
        totalVoiceRecordings: decryptedRecordings.length,
        firstEntryDate: decryptedEntries.length > 0 
          ? decryptedEntries[decryptedEntries.length - 1].createdAt 
          : null,
        lastEntryDate: decryptedEntries.length > 0 
          ? decryptedEntries[0].createdAt 
          : null,
      }
    }

    // Return as JSON file download
    const response = new NextResponse(JSON.stringify(exportData, null, 2))
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('Content-Disposition', `attachment; filename="naggery-data-export-${new Date().toISOString().split('T')[0]}.json"`)

    return response

  } catch (error) {
    console.error("Export data error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

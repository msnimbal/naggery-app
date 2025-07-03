
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { audioData, mimeType } = await request.json()

    if (!audioData) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      )
    }

    // Extract base64 data from data URL
    const base64Data = audioData.split(',')[1]
    
    // Prepare the request for the LLM API
    const transcriptionRequest = {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: "audio.webm",
                file_data: audioData
              }
            },
            {
              type: "text", 
              text: "Please transcribe this audio recording accurately. Return only the transcribed text without any additional formatting or comments."
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify(transcriptionRequest)
    })

    if (!response.ok) {
      throw new Error(`Transcription API error: ${response.status}`)
    }

    const data = await response.json()
    const transcription = data.choices?.[0]?.message?.content?.trim() || ""

    return NextResponse.json({ transcription })

  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    )
  }
}

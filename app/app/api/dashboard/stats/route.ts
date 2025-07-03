
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get total counts
    const [totalEntries, totalRecordings] = await Promise.all([
      prisma.journalEntry.count({
        where: { userId }
      }),
      prisma.voiceRecording.count({
        where: { userId }
      })
    ])

    // Get weekly counts (last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [weeklyEntries, weeklyRecordings] = await Promise.all([
      prisma.journalEntry.count({
        where: {
          userId,
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      prisma.voiceRecording.count({
        where: {
          userId,
          createdAt: {
            gte: oneWeekAgo
          }
        }
      })
    ])

    return NextResponse.json({
      totalEntries,
      totalRecordings,
      weeklyEntries,
      weeklyRecordings,
    })

  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

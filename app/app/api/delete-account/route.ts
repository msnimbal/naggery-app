
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Delete all user data in the correct order (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete user settings
      await tx.userSettings.deleteMany({
        where: { userId }
      })

      // Delete voice recordings
      await tx.voiceRecording.deleteMany({
        where: { userId }
      })

      // Delete journal entries
      await tx.journalEntry.deleteMany({
        where: { userId }
      })

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId }
      })

      // Delete accounts (OAuth)
      await tx.account.deleteMany({
        where: { userId }
      })

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({ 
      message: "Account and all associated data have been permanently deleted" 
    })

  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}

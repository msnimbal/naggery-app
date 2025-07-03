
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

    const settings = await prisma.userSettings.findFirst({
      where: {
        userId: session.user.id
      },
      select: {
        privacySettings: true,
        notificationPreferences: true,
        themePreferences: true,
      }
    })

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          privacySettings: {
            dataEncryption: true,
            shareAnalytics: false,
          },
          notificationPreferences: {
            emailNotifications: false,
            pushNotifications: false,
          },
          themePreferences: {
            theme: "light",
          }
        },
        select: {
          privacySettings: true,
          notificationPreferences: true,
          themePreferences: true,
        }
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { privacySettings, notificationPreferences, themePreferences } = await request.json()

    const settings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        privacySettings,
        notificationPreferences,
        themePreferences,
      },
      create: {
        userId: session.user.id,
        privacySettings,
        notificationPreferences,
        themePreferences,
      },
      select: {
        privacySettings: true,
        notificationPreferences: true,
        themePreferences: true,
      }
    })

    return NextResponse.json(settings)

  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

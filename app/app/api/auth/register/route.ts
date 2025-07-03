
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/encryption"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, gender } = await request.json()

    if (!email || !password || !name || !gender) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender,
      },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        createdAt: true,
      }
    })

    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
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
      }
    })

    return NextResponse.json({
      message: "User created successfully",
      user
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

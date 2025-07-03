
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'john@doe.com' }
    })

    if (existingUser) {
      console.log('✅ Demo user already exists')
      return
    }

    // Create demo user
    const hashedPassword = await hashPassword('johndoe123')
    
    const demoUser = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        password: hashedPassword,
        name: 'John Doe',
        gender: 'male',
        emailVerified: new Date(),
        twoFactorEnabled: false,
      }
    })

    console.log('✅ Created demo user:', demoUser.email)

    // Create default settings for demo user
    await prisma.userSettings.create({
      data: {
        userId: demoUser.id,
        privacySettings: {
          dataEncryption: true,
          shareAnalytics: false,
        },
        notificationPreferences: {
          emailNotifications: false,
          pushNotifications: false,
        },
        themePreferences: {
          theme: 'light',
        }
      }
    })

    console.log('✅ Created default settings for demo user')

    // Create sample journal entries
    const sampleEntries = [
      {
        title: "Welcome to Naggery",
        content: "<h2>Getting Started</h2><p>This is your first journal entry! Naggery is designed to be your private space for reflection and mental wellbeing.</p><p>You can write about your thoughts, experiences, and feelings here. Everything is encrypted and secure.</p>",
        tags: ["welcome", "getting-started"]
      },
      {
        title: "Daily Reflection",
        content: "<h2>Today's Thoughts</h2><p>Had a productive day today. Been thinking about the importance of mental health and taking time for self-reflection.</p><p>This journal helps me organize my thoughts and track my emotional journey.</p>",
        tags: ["daily", "reflection", "mental-health"]
      },
      {
        title: "Goals and Aspirations",
        content: "<h2>Looking Forward</h2><p>Setting some personal goals for self-improvement:</p><ul><li>Practice mindfulness daily</li><li>Write in journal regularly</li><li>Focus on positive thinking</li></ul><p>It's important to have clear objectives for personal growth.</p>",
        tags: ["goals", "self-improvement", "mindfulness"]
      }
    ]

    for (const entry of sampleEntries) {
      await prisma.journalEntry.create({
        data: {
          userId: demoUser.id,
          title: entry.title,
          content: entry.content,
          tags: entry.tags,
          encrypted: false, // Keep demo entries unencrypted for easier viewing
        }
      })
    }

    console.log('✅ Created sample journal entries')

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\nDemo Account Details:')
    console.log('📧 Email: john@doe.com')
    console.log('🔑 Password: johndoe123')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

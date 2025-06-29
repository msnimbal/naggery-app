
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create demo user
    const hashedPassword = await bcrypt.hash('johndoe123', 12)
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {},
      create: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: hashedPassword
      }
    })

    console.log('Demo user created:', demoUser.email)

    // Create sample entries for demo user
    const sampleEntries = [
      {
        type: 'TEXT' as const,
        title: 'First Entry',
        content: 'This is my first entry in Naggery. Testing out the text functionality.',
        mood: 'NEUTRAL' as const,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        type: 'TEXT' as const,
        title: 'Good Day',
        content: 'Had a really good day today. Everything went smoothly.',
        mood: 'HAPPY' as const,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        type: 'TEXT' as const,
        title: 'Frustrating Situation',
        content: 'Dealing with some frustrating circumstances today. Need to document this.',
        mood: 'FRUSTRATED' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        type: 'TEXT' as const,
        title: 'Reflection',
        content: 'Taking some time to reflect on recent events and patterns.',
        mood: 'CALM' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]

    for (const entry of sampleEntries) {
      await prisma.entry.create({
        data: {
          ...entry,
          userId: demoUser.id
        }
      })
    }

    console.log('Sample entries created for demo user')
  } catch (error) {
    console.error('Seeding error:', error)
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

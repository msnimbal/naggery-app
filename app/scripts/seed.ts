
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create demo user with all security features enabled
    const hashedPassword = await bcrypt.hash('johndoe123', 12)
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {
        // Update existing demo user with new security fields
        phone: '+1234567890',
        gender: 'MALE',
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        emailVerified: new Date(),
        phoneVerified: new Date(),
        twoFaEnabled: false, // Initially disabled for easy testing
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null
      },
      create: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: hashedPassword,
        phone: '+1234567890',
        gender: 'MALE',
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        emailVerified: new Date(),
        phoneVerified: new Date(),
        twoFaEnabled: false, // Initially disabled for easy testing
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null
      }
    })

    console.log('✅ Demo user created/updated:', demoUser.email)
    console.log('   - Email verified: ✅')
    console.log('   - Phone verified: ✅')
    console.log('   - Account active: ✅')
    console.log('   - 2FA: Disabled (can be enabled in security settings)')

    // Clean up any existing verification requests for the demo user
    await prisma.verificationRequest.deleteMany({
      where: { userId: demoUser.id }
    })

    // Clean up any existing backup codes for the demo user
    await prisma.backupCode.deleteMany({
      where: { userId: demoUser.id }
    })

    console.log('✅ Cleaned up existing verification data')

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

    console.log('✅ Sample entries created')
    console.log('')
    console.log('🎉 Database seeding completed successfully!')
    console.log('')
    console.log('Demo Account Credentials:')
    console.log('Email: john@doe.com')
    console.log('Password: johndoe123')
    console.log('Phone: +1234567890')
    console.log('Gender: Male')
    console.log('')
    console.log('Security Status:')
    console.log('- Email Verified: ✅')
    console.log('- Phone Verified: ✅')
    console.log('- Terms Accepted: ✅')
    console.log('- 2FA Enabled: ❌ (can be enabled in /security)')
    console.log('- Account Active: ✅')
  } catch (error) {
    console.error('❌ Seeding error:', error)
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

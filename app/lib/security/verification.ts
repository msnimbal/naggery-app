
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { VerificationType } from '@/lib/types'

export class VerificationService {
  private static readonly CODE_LENGTH = 6
  private static readonly TOKEN_LENGTH = 32
  private static readonly EMAIL_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
  private static readonly SMS_EXPIRY = 10 * 60 * 1000 // 10 minutes
  private static readonly MAX_ATTEMPTS = 5

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  static async createVerificationRequest(
    userId: string,
    type: VerificationType,
    email?: string,
    phone?: string
  ) {
    const token = this.generateSecureToken()
    const code = this.generateVerificationCode()
    const expiry = type === 'EMAIL_VERIFICATION' || type === 'EMAIL_CHANGE' 
      ? this.EMAIL_EXPIRY 
      : this.SMS_EXPIRY

    // Clean up old verification requests for this user and type
    await prisma.verificationRequest.deleteMany({
      where: {
        userId,
        type,
        expires: {
          lt: new Date()
        }
      }
    })

    // Create new verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId,
        type,
        token,
        code: type === 'SMS_VERIFICATION' ? code : undefined,
        expires: new Date(Date.now() + expiry)
      }
    })

    return {
      token,
      code: type === 'SMS_VERIFICATION' ? code : undefined,
      expires: verificationRequest.expires
    }
  }

  static async verifyCode(token: string, code: string): Promise<boolean> {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { token }
    })

    if (!verificationRequest) {
      return false
    }

    // Check if expired
    if (verificationRequest.expires < new Date()) {
      return false
    }

    // Check if already verified
    if (verificationRequest.verified) {
      return false
    }

    // Check max attempts
    if (verificationRequest.attempts >= this.MAX_ATTEMPTS) {
      return false
    }

    // Increment attempts
    await prisma.verificationRequest.update({
      where: { id: verificationRequest.id },
      data: { attempts: verificationRequest.attempts + 1 }
    })

    // Verify code
    if (verificationRequest.code === code) {
      // Mark as verified
      await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: { verified: true }
      })
      return true
    }

    return false
  }

  static async verifyEmailToken(token: string): Promise<boolean> {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { token }
    })

    if (!verificationRequest) {
      return false
    }

    // Check if expired
    if (verificationRequest.expires < new Date()) {
      return false
    }

    // Check if already verified
    if (verificationRequest.verified) {
      return false
    }

    // For email verification, just clicking the link verifies it
    if (verificationRequest.type === 'EMAIL_VERIFICATION' || verificationRequest.type === 'EMAIL_CHANGE') {
      await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: { verified: true }
      })
      return true
    }

    return false
  }

  static async getVerificationRequest(token: string) {
    return prisma.verificationRequest.findUnique({
      where: { token },
      include: { user: true }
    })
  }

  static async cleanupExpiredRequests() {
    await prisma.verificationRequest.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
  }
}

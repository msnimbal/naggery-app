
import { authenticator } from 'otplib'
import * as qrcode from 'qrcode'
import crypto from 'crypto'

export class TwoFactorAuth {
  static generateSecret(): string {
    return authenticator.generateSecret()
  }

  static async generateQRCode(secret: string, email: string, serviceName: string = 'Naggery'): Promise<string> {
    const otpauth = authenticator.keyuri(email, serviceName, secret)
    return qrcode.toDataURL(otpauth)
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch (error) {
      console.error('2FA verification error:', error)
      return false
    }
  }

  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric backup codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(code)
    }
    return codes
  }

  static validateBackupCode(code: string): boolean {
    // Backup codes should be 8 characters, alphanumeric
    const regex = /^[A-F0-9]{8}$/
    return regex.test(code.toUpperCase())
  }
}

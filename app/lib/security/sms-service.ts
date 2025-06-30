
// SMS service for verification codes
// Note: This is a mock implementation for development
// In production, you would integrate with a real SMS service

export class SMSService {
  private static readonly FROM_NUMBER = process.env.SMS_FROM_NUMBER || '+1234567890'
  private static readonly APP_NAME = 'Naggery'

  static async sendVerificationSMS(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    const message = `Your ${this.APP_NAME} verification code is: ${code}. This code will expire in 10 minutes. Do not share this code with anyone.`
    
    // In development, just log the SMS content
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== SMS VERIFICATION ===')
      console.log(`To: ${phoneNumber}`)
      console.log(`From: ${this.FROM_NUMBER}`)
      console.log(`Message: ${message}`)
      console.log(`Code: ${code}`)
      console.log('========================\n')
      return true
    }
    
    // TODO: Implement actual SMS sending with a service like:
    // - Twilio (has free trial)
    // - AWS SNS
    // - MessageBird
    // - Vonage (formerly Nexmo)
    
    try {
      // Mock implementation - always succeeds in development
      return true
    } catch (error) {
      console.error('SMS sending failed:', error)
      return false
    }
  }

  static async sendSecurityAlertSMS(
    phoneNumber: string,
    alertType: string
  ): Promise<boolean> {
    const messages = {
      'login': `Security alert: New login to your ${this.APP_NAME} account. If this wasn't you, please secure your account immediately.`,
      'password_change': `Your ${this.APP_NAME} password was changed. If this wasn't you, contact support immediately.`,
      'email_change': `Your ${this.APP_NAME} email was changed. If this wasn't you, contact support immediately.`,
      '2fa_disabled': `Two-factor authentication was disabled on your ${this.APP_NAME} account. If this wasn't you, contact support immediately.`
    }
    
    const message = messages[alertType as keyof typeof messages] || 
      `Security alert for your ${this.APP_NAME} account. Please check your account security.`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== SMS SECURITY ALERT ===')
      console.log(`To: ${phoneNumber}`)
      console.log(`Alert Type: ${alertType}`)
      console.log(`Message: ${message}`)
      console.log('==========================\n')
      return true
    }
    
    try {
      // Mock implementation - always succeeds in development
      return true
    } catch (error) {
      console.error('SMS alert sending failed:', error)
      return false
    }
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber)
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // Add + if missing and assume US number
    if (!cleaned.startsWith('+')) {
      return `+1${cleaned}`
    }
    
    return cleaned
  }

  static maskPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return ''
    
    // Show only last 4 digits: +1***-***-1234
    if (phoneNumber.length > 4) {
      const lastFour = phoneNumber.slice(-4)
      const countryCode = phoneNumber.startsWith('+') ? phoneNumber.slice(0, 2) : '+1'
      return `${countryCode}***-***-${lastFour}`
    }
    
    return phoneNumber
  }
}

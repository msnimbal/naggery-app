
// Email service for verification emails
// Note: This is a mock implementation for development
// In production, you would integrate with a real email service

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@naggery.app'
  private static readonly APP_NAME = 'Naggery'
  private static readonly BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  static async sendVerificationEmail(
    email: string,
    token: string,
    userName: string = 'User'
  ): Promise<boolean> {
    const verificationUrl = `${this.BASE_URL}/verify-email?token=${token}`
    
    const template = this.getEmailVerificationTemplate(userName, verificationUrl)
    
    // In development, just log the email content
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== EMAIL VERIFICATION ===')
      console.log(`To: ${email}`)
      console.log(`Subject: ${template.subject}`)
      console.log(`Verification URL: ${verificationUrl}`)
      console.log(`Token: ${token}`)
      console.log('===========================\n')
      return true
    }
    
    // TODO: Implement actual email sending with a service like:
    // - Resend (free tier)
    // - SendGrid (free tier)
    // - Amazon SES
    // - Nodemailer with SMTP
    
    try {
      // Mock implementation - always succeeds in development
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  static async sendEmailChangeVerification(
    email: string,
    token: string,
    userName: string = 'User'
  ): Promise<boolean> {
    const verificationUrl = `${this.BASE_URL}/verify-email-change?token=${token}`
    
    const template = this.getEmailChangeTemplate(userName, verificationUrl, email)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== EMAIL CHANGE VERIFICATION ===')
      console.log(`To: ${email}`)
      console.log(`Subject: ${template.subject}`)
      console.log(`Verification URL: ${verificationUrl}`)
      console.log('==================================\n')
      return true
    }
    
    return true
  }

  static async sendPasswordResetEmail(
    email: string,
    token: string,
    userName: string = 'User'
  ): Promise<boolean> {
    const resetUrl = `${this.BASE_URL}/reset-password?token=${token}`
    
    const template = this.getPasswordResetTemplate(userName, resetUrl)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== PASSWORD RESET ===')
      console.log(`To: ${email}`)
      console.log(`Subject: ${template.subject}`)
      console.log(`Reset URL: ${resetUrl}`)
      console.log('======================\n')
      return true
    }
    
    return true
  }

  private static getEmailVerificationTemplate(
    userName: string,
    verificationUrl: string
  ): EmailTemplate {
    const subject = `Verify your ${this.APP_NAME} account`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${this.APP_NAME}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${this.APP_NAME}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${userName},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for signing up for ${this.APP_NAME}. To complete your registration and verify your email address, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2025 ${this.APP_NAME}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      Welcome to ${this.APP_NAME}!
      
      Hi ${userName},
      
      Thank you for signing up for ${this.APP_NAME}. To complete your registration and verify your email address, please visit:
      
      ${verificationUrl}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't create this account, you can safely ignore this email.
      
      © 2025 ${this.APP_NAME}. All rights reserved.
    `
    
    return { subject, html, text }
  }

  private static getEmailChangeTemplate(
    userName: string,
    verificationUrl: string,
    newEmail: string
  ): EmailTemplate {
    const subject = `Verify your new email address for ${this.APP_NAME}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${this.APP_NAME}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your New Email Address</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${userName},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              You requested to change your email address to <strong>${newEmail}</strong>. To complete this change, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Verify New Email
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't request this email change, please ignore this email and contact support immediately.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2025 ${this.APP_NAME}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      Verify Your New Email Address
      
      Hi ${userName},
      
      You requested to change your email address to ${newEmail}. To complete this change, please visit:
      
      ${verificationUrl}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't request this email change, please ignore this email and contact support immediately.
      
      © 2025 ${this.APP_NAME}. All rights reserved.
    `
    
    return { subject, html, text }
  }

  private static getPasswordResetTemplate(
    userName: string,
    resetUrl: string
  ): EmailTemplate {
    const subject = `Reset your ${this.APP_NAME} password`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${this.APP_NAME}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${userName},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset the password for your ${this.APP_NAME} account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2025 ${this.APP_NAME}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      Reset Your Password
      
      Hi ${userName},
      
      We received a request to reset the password for your ${this.APP_NAME} account. Visit this link to reset your password:
      
      ${resetUrl}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      
      © 2025 ${this.APP_NAME}. All rights reserved.
    `
    
    return { subject, html, text }
  }
}

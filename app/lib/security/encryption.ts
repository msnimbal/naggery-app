
import crypto from 'crypto'
import CryptoJS from 'crypto-js'

export class SecurityUtils {
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
  private static readonly ALGORITHM = 'aes-256-gcm'

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':')
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === hashToVerify
  }

  static encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString()
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  static decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  static generateSecureToken(length: number = 64): string {
    return crypto.randomBytes(length).toString('base64url')
  }

  static createSecureHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidPhone(phone: string): boolean {
    // Basic international phone validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '')
  }

  static formatPhone(phone: string): string {
    const cleaned = this.sanitizePhone(phone)
    if (!cleaned.startsWith('+')) {
      return `+1${cleaned}` // Default to US if no country code
    }
    return cleaned
  }

  static isPasswordStrong(password: string): {
    isStrong: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isStrong: errors.length === 0,
      errors
    }
  }

  // API Key Management Methods
  static encryptApiKey(apiKey: string): string {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key cannot be empty')
    }
    return this.encryptData(apiKey.trim())
  }

  static decryptApiKey(encryptedApiKey: string): string {
    if (!encryptedApiKey || encryptedApiKey.trim() === '') {
      throw new Error('Encrypted API key cannot be empty')
    }
    return this.decryptData(encryptedApiKey.trim())
  }

  static validateApiKeyFormat(apiKey: string, provider: 'OPENAI' | 'CLAUDE'): {
    isValid: boolean
    error?: string
  } {
    if (!apiKey || apiKey.trim() === '') {
      return { isValid: false, error: 'API key cannot be empty' }
    }

    const key = apiKey.trim()

    switch (provider) {
      case 'OPENAI':
        // OpenAI keys typically start with 'sk-' and are 51+ characters
        if (!key.startsWith('sk-')) {
          return { isValid: false, error: 'OpenAI API keys must start with "sk-"' }
        }
        if (key.length < 20) {
          return { isValid: false, error: 'OpenAI API key appears to be too short' }
        }
        break
      
      case 'CLAUDE':
        // Claude/Anthropic keys typically start with 'sk-ant-' 
        if (!key.startsWith('sk-ant-')) {
          return { isValid: false, error: 'Claude API keys must start with "sk-ant-"' }
        }
        if (key.length < 20) {
          return { isValid: false, error: 'Claude API key appears to be too short' }
        }
        break
      
      default:
        return { isValid: false, error: 'Unsupported API provider' }
    }

    return { isValid: true }
  }

  static maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '****'
    }
    
    const start = apiKey.substring(0, 4)
    const end = apiKey.substring(apiKey.length - 4)
    const masked = '*'.repeat(Math.max(4, apiKey.length - 8))
    
    return `${start}${masked}${end}`
  }
}

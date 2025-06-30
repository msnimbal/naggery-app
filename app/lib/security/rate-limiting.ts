
import NodeCache from 'node-cache'

interface RateLimitOptions {
  windowMs: number
  maxAttempts: number
  message?: string
}

interface RateLimitInfo {
  count: number
  resetTime: number
}

export class RateLimiter {
  private cache: NodeCache
  private defaultOptions: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    message: 'Too many attempts, please try again later'
  }

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.defaultOptions.windowMs / 1000,
      checkperiod: 60 // Check for expired keys every 60 seconds
    })
  }

  async checkRateLimit(
    identifier: string,
    options: Partial<RateLimitOptions> = {}
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    message?: string
  }> {
    const opts = { ...this.defaultOptions, ...options }
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - opts.windowMs

    let rateLimitInfo: RateLimitInfo = this.cache.get(key) || {
      count: 0,
      resetTime: now + opts.windowMs
    }

    // Reset if window has passed
    if (now > rateLimitInfo.resetTime) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + opts.windowMs
      }
    }

    // Increment count
    rateLimitInfo.count++

    // Update cache
    const ttl = Math.ceil((rateLimitInfo.resetTime - now) / 1000)
    this.cache.set(key, rateLimitInfo, ttl)

    const allowed = rateLimitInfo.count <= opts.maxAttempts
    const remaining = Math.max(0, opts.maxAttempts - rateLimitInfo.count)

    return {
      allowed,
      remaining,
      resetTime: rateLimitInfo.resetTime,
      message: allowed ? undefined : opts.message
    }
  }

  async incrementAttempt(identifier: string): Promise<void> {
    await this.checkRateLimit(identifier)
  }

  async resetRateLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`
    this.cache.del(key)
  }

  // Specific rate limiters for different actions
  static async checkLoginAttempts(identifier: string) {
    const limiter = new RateLimiter()
    return limiter.checkRateLimit(`login:${identifier}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      message: 'Too many login attempts. Please try again in 15 minutes.'
    })
  }

  static async checkVerificationAttempts(identifier: string) {
    const limiter = new RateLimiter()
    return limiter.checkRateLimit(`verification:${identifier}`, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxAttempts: 3,
      message: 'Too many verification attempts. Please wait 5 minutes.'
    })
  }

  static async check2FAAttempts(identifier: string) {
    const limiter = new RateLimiter()
    return limiter.checkRateLimit(`2fa:${identifier}`, {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 5,
      message: 'Too many 2FA attempts. Please wait 10 minutes.'
    })
  }

  static async checkSMSAttempts(identifier: string) {
    const limiter = new RateLimiter()
    return limiter.checkRateLimit(`sms:${identifier}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 3,
      message: 'Too many SMS requests. Please wait 1 hour.'
    })
  }
}

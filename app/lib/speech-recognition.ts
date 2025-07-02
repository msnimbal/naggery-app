
'use client'

import { SpeechRecognitionResult, SpeechRecognitionConfig } from '@/lib/types'

export class SpeechRecognitionService {
  private recognition: any = null
  private isListening: boolean = false
  private onResultCallback?: (result: SpeechRecognitionResult) => void
  private onErrorCallback?: (error: string) => void
  private onEndCallback?: () => void

  constructor() {
    if (typeof window !== 'undefined') {
      // Check for Web Speech API support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    // Default configuration
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    this.recognition.maxAlternatives = 1

    // Event handlers
    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence || 0

        if (this.onResultCallback) {
          this.onResultCallback({
            transcript,
            confidence,
            isFinal: result.isFinal
          })
        }
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      this.isListening = false
      
      let errorMessage = 'Speech recognition failed'
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone access denied or not available.'
          break
        case 'not-allowed':
          errorMessage = 'Speech recognition permission denied.'
          break
        case 'network':
          errorMessage = 'Network connection required for speech recognition.'
          break
        case 'language-not-supported':
          errorMessage = 'Selected language not supported.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEndCallback) {
        this.onEndCallback()
      }
    }

    this.recognition.onstart = () => {
      this.isListening = true
    }
  }

  public configure(config: SpeechRecognitionConfig) {
    if (!this.recognition) return

    if (config.language) {
      this.recognition.lang = config.language
    }
    if (config.continuous !== undefined) {
      this.recognition.continuous = config.continuous
    }
    if (config.interimResults !== undefined) {
      this.recognition.interimResults = config.interimResults
    }
    if (config.maxAlternatives !== undefined) {
      this.recognition.maxAlternatives = config.maxAlternatives
    }
  }

  public startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech recognition not supported in this browser'))
        return
      }

      if (this.isListening) {
        reject(new Error('Already listening'))
        return
      }

      try {
        this.recognition.start()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  public abortListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort()
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    return !!SpeechRecognition
  }

  public getIsListening(): boolean {
    return this.isListening
  }

  public getSupportedLanguages(): string[] {
    // Common supported languages for Web Speech API
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
      'pt-BR', 'pt-PT', 'ru-RU', 'ja-JP', 'ko-KR',
      'zh-CN', 'zh-TW', 'ar-SA', 'hi-IN', 'nl-NL'
    ]
  }

  public onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  public onEnd(callback: () => void): void {
    this.onEndCallback = callback
  }

  public cleanup(): void {
    this.stopListening()
    this.onResultCallback = undefined
    this.onErrorCallback = undefined
    this.onEndCallback = undefined
  }

  // Utility method to get browser compatibility info
  public getBrowserSupport(): {
    isSupported: boolean
    browser: string
    needsHttps: boolean
  } {
    if (typeof window === 'undefined') {
      return { isSupported: false, browser: 'server', needsHttps: false }
    }

    const userAgent = navigator.userAgent.toLowerCase()
    let browser = 'unknown'
    let needsHttps = true

    if (userAgent.includes('chrome')) {
      browser = 'chrome'
    } else if (userAgent.includes('firefox')) {
      browser = 'firefox'
      needsHttps = false // Firefox doesn't require HTTPS for localhost
    } else if (userAgent.includes('safari')) {
      browser = 'safari'
    } else if (userAgent.includes('edge')) {
      browser = 'edge'
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const isSupported = !!SpeechRecognition

    return {
      isSupported,
      browser,
      needsHttps: needsHttps && location.protocol !== 'https:' && location.hostname !== 'localhost'
    }
  }
}

// Export a singleton instance
export const speechRecognitionService = new SpeechRecognitionService()

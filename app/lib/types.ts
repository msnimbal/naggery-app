
export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  gender?: Gender
  termsAccepted: boolean
  termsAcceptedAt?: Date
  emailVerified?: Date
  phoneVerified?: Date
  twoFaEnabled: boolean
  isActive: boolean
  loginAttempts: number
  lockedUntil?: Date
  createdAt: Date
  updatedAt: Date
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say'
}

export interface Entry {
  id: string
  userId: string
  type: 'TEXT' | 'VOICE'
  title?: string
  content?: string
  voiceUrl?: string
  transcription?: string
  aiNotes?: string
  processingStatus: ProcessingStatus
  aiProvider?: string
  mood: Mood
  createdAt: Date
  updatedAt: Date
}

export type Mood = 'HAPPY' | 'NEUTRAL' | 'ANGRY' | 'SAD' | 'CONFUSED' | 'FRUSTRATED' | 'ANXIOUS' | 'CALM'

export interface VoiceRecording {
  blob: Blob
  url: string
  duration: number
}

export interface AnalyticsData {
  moodFrequency: { mood: Mood; count: number }[]
  entriesOverTime: { date: string; count: number }[]
  entryTypeRatio: { type: string; count: number }[]
  totalEntries: number
  averageEntriesPerWeek: number
}

export interface ExportOptions {
  format: 'PDF' | 'TXT' | 'JSON'
  dateRange: {
    start: Date
    end: Date
  }
  includeMood: boolean
  includeTimestamps: boolean
}

export const MOOD_LABELS: Record<Mood, string> = {
  HAPPY: 'Happy',
  NEUTRAL: 'Neutral',
  ANGRY: 'Angry',
  SAD: 'Sad',
  CONFUSED: 'Confused',
  FRUSTRATED: 'Frustrated',
  ANXIOUS: 'Anxious',
  CALM: 'Calm'
}

export const MOOD_EMOJIS: Record<Mood, string> = {
  HAPPY: '😊',
  NEUTRAL: '😐',
  ANGRY: '😠',
  SAD: '😢',
  CONFUSED: '🤔',
  FRUSTRATED: '😤',
  ANXIOUS: '😰',
  CALM: '😌'
}

export const MOOD_COLORS: Record<Mood, string> = {
  HAPPY: '#10B981',
  NEUTRAL: '#6B7280',
  ANGRY: '#EF4444',
  SAD: '#3B82F6',
  CONFUSED: '#F59E0B',
  FRUSTRATED: '#F97316',
  ANXIOUS: '#8B5CF6',
  CALM: '#06B6D4'
}

// Security-related types
export interface VerificationRequest {
  id: string
  userId: string
  type: 'EMAIL_VERIFICATION' | 'SMS_VERIFICATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'TWO_FA_SETUP'
  token: string
  code?: string
  attempts: number
  verified: boolean
  expires: Date
  createdAt: Date
}

export interface BackupCode {
  id: string
  userId: string
  code: string
  used: boolean
  usedAt?: Date
  createdAt: Date
}

export interface SecuritySettings {
  emailVerified: boolean
  phoneVerified: boolean
  twoFaEnabled: boolean
  backupCodesGenerated: boolean
  verificationStep: 'email' | 'phone' | '2fa' | 'complete'
}

export interface VerificationStep {
  step: number
  title: string
  description: string
  completed: boolean
  required: boolean
}

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export type VerificationType = 'EMAIL_VERIFICATION' | 'SMS_VERIFICATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'TWO_FA_SETUP'

// AI and Speech Recognition Types
export type ProcessingStatus = 'NONE' | 'TRANSCRIBING' | 'GENERATING' | 'COMPLETED' | 'FAILED'

export type ApiProvider = 'OPENAI' | 'CLAUDE'

export interface ApiKey {
  id: string
  userId: string
  provider: ApiProvider
  keyName: string
  encryptedKey: string
  isActive: boolean
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface VoiceTranscription {
  text: string
  confidence: number
  duration: number
  processingTime: number
}

export interface AiNotesGeneration {
  originalText: string
  generatedNotes: string
  categories: string[]
  keyPoints: string[]
  emotionalContext?: string
  provider: ApiProvider
  processingTime: number
}

export interface AiProcessingRequest {
  text: string
  context?: string
  options?: {
    includeCategories?: boolean
    includeEmotionalAnalysis?: boolean
    maxBulletPoints?: number
    tone?: 'professional' | 'casual' | 'legal'
  }
}

export interface AiProcessingResponse {
  success: boolean
  notes?: string
  categories?: string[]
  keyPoints?: string[]
  emotionalContext?: string
  error?: string
  provider?: ApiProvider
}

export interface SpeechRecognitionConfig {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

export interface VoiceRecordingEnhanced {
  blob: Blob
  url: string
  duration: number
  transcription?: VoiceTranscription
  aiNotes?: AiNotesGeneration
}

export interface ApiKeyValidation {
  isValid: boolean
  provider: ApiProvider
  keyName?: string
  error?: string
}

export interface UserPreferences {
  autoTranscribe: boolean
  autoGenerateNotes: boolean
  preferredAiProvider: ApiProvider
  speechLanguage: string
  aiProcessingTone: 'professional' | 'casual' | 'legal'
}

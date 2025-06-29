
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Entry {
  id: string
  userId: string
  type: 'TEXT' | 'VOICE'
  title?: string
  content?: string
  voiceUrl?: string
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

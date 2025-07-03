
export interface User {
  id: string
  email: string
  name?: string | null
  gender: string
  emailVerified?: Date | null
  twoFactorEnabled: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface JournalEntry {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  encrypted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VoiceRecording {
  id: string
  userId: string
  title?: string | null
  audioFileUrl: string
  transcription?: string | null
  duration?: number | null
  encrypted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  privacySettings: Record<string, any>
  notificationPreferences: Record<string, any>
  themePreferences: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalEntries: number
  totalRecordings: number
  recentEntries: JournalEntry[]
  recentRecordings: VoiceRecording[]
}

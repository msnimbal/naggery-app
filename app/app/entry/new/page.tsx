
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { VoiceRecorder } from '@/components/voice/voice-recorder'
import { MoodSelector } from '@/components/mood/mood-selector'
import { Mood } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function NewEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const initialType = searchParams.get('type') as 'text' | 'voice' || 'text'
  
  const [type, setType] = useState<'TEXT' | 'VOICE'>(initialType === 'voice' ? 'VOICE' : 'TEXT')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood>('NEUTRAL')
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVoiceRecordingComplete = (blob: Blob) => {
    setVoiceBlob(blob)
    toast({
      title: 'Voice recorded',
      description: 'Your voice note has been recorded successfully'
    })
  }

  const uploadVoiceNote = async (blob: Blob): Promise<string> => {
    const formData = new FormData()
    formData.append('audio', blob, 'voice-note.webm')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload voice note')
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async () => {
    if (!mood) {
      toast({
        title: 'Error',
        description: 'Please select your mood',
        variant: 'destructive'
      })
      return
    }

    if (type === 'TEXT' && !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your text entry',
        variant: 'destructive'
      })
      return
    }

    if (type === 'VOICE' && !voiceBlob) {
      toast({
        title: 'Error',
        description: 'Please record a voice note',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      let voiceUrl = undefined

      if (type === 'VOICE' && voiceBlob) {
        voiceUrl = await uploadVoiceNote(voiceBlob)
      }

      const entryData = {
        type,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        voiceUrl,
        mood
      }

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })

      if (!response.ok) {
        throw new Error('Failed to create entry')
      }

      const entry = await response.json()

      toast({
        title: 'Success',
        description: 'Entry created successfully'
      })

      router.push(`/entries/${entry.id}`)
    } catch (error) {
      console.error('Failed to create entry:', error)
      toast({
        title: 'Error',
        description: 'Failed to create entry. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader 
        title="New Entry" 
        showBack
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="border-gray-600 text-gray-300"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Entry Type Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-50">Entry Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={type === 'TEXT' ? 'default' : 'outline'}
                onClick={() => setType('TEXT')}
                className={type === 'TEXT' ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-600 text-gray-300'}
                disabled={isSubmitting}
              >
                📝 Text Entry
              </Button>
              <Button
                variant={type === 'VOICE' ? 'default' : 'outline'}
                onClick={() => setType('VOICE')}
                className={type === 'VOICE' ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-600 text-gray-300'}
                disabled={isSubmitting}
              >
                🎙️ Voice Note
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mood Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <MoodSelector
              selectedMood={mood}
              onMoodSelect={setMood}
            />
          </CardContent>
        </Card>

        {/* Title Field */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-200 mb-3 block">
              Title (Optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this entry..."
              className="bg-gray-700 border-gray-600 text-gray-50"
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Content Field for Text Entries */}
        {type === 'TEXT' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-gray-200 mb-3 block">
                Content
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your experience, thoughts, or observations..."
                className="bg-gray-700 border-gray-600 text-gray-50 min-h-[200px]"
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>
        )}

        {/* Voice Recorder for Voice Entries */}
        {type === 'VOICE' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-gray-200 mb-4 block">
                Voice Recording
              </label>
              <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
            </CardContent>
          </Card>
        )}

        {/* Additional Notes for Voice Entries */}
        {type === 'VOICE' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-gray-200 mb-3 block">
                Additional Notes (Optional)
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add any additional written notes or context..."
                className="bg-gray-700 border-gray-600 text-gray-50 min-h-[120px]"
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-200">
              🔒 Your entries are private and secure. Only you can access your personal documentation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

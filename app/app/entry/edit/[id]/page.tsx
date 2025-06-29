
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { MoodSelector } from '@/components/mood/mood-selector'
import { Entry, Mood } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function EditEntryPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [entry, setEntry] = useState<Entry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood>('NEUTRAL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/entries/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setEntry(data)
          setTitle(data.title || '')
          setContent(data.content || '')
          setMood(data.mood)
        } else {
          toast({
            title: 'Error',
            description: 'Entry not found',
            variant: 'destructive'
          })
          router.push('/entries')
        }
      } catch (error) {
        console.error('Failed to fetch entry:', error)
        toast({
          title: 'Error',
          description: 'Failed to load entry',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEntry()
    }
  }, [params.id, router, toast])

  const handleSubmit = async () => {
    if (!entry) return

    if (!mood) {
      toast({
        title: 'Error',
        description: 'Please select your mood',
        variant: 'destructive'
      })
      return
    }

    if (entry.type === 'TEXT' && !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your text entry',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const entryData = {
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        mood
      }

      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })

      if (!response.ok) {
        throw new Error('Failed to update entry')
      }

      toast({
        title: 'Success',
        description: 'Entry updated successfully'
      })

      router.push(`/entries/${entry.id}`)
    } catch (error) {
      console.error('Failed to update entry:', error)
      toast({
        title: 'Error',
        description: 'Failed to update entry. Please try again.',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <PageHeader title="Loading..." showBack />
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center py-8 text-gray-400">
            Loading entry...
          </div>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-900">
        <PageHeader title="Entry Not Found" showBack />
        <div className="max-w-2xl mx-auto p-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-200 mb-2">Entry not found</h3>
              <p className="text-gray-400">This entry may have been deleted or doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader 
        title="Edit Entry" 
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
        {/* Entry Type Display */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {entry.type === 'VOICE' ? '🎙️' : '📝'}
              </span>
              <div>
                <h3 className="font-medium text-gray-200">
                  {entry.type === 'VOICE' ? 'Voice Note' : 'Text Entry'}
                </h3>
                <p className="text-sm text-gray-400">
                  Entry type cannot be changed
                </p>
              </div>
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

        {/* Voice Note Display (Non-editable) */}
        {entry.type === 'VOICE' && entry.voiceUrl && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-gray-200 mb-3 block">
                Voice Recording
              </label>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Voice recordings cannot be edited. You can only modify the title, additional notes, and mood.
                </p>
                <audio controls className="w-full">
                  <source src={entry.voiceUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Field */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-200 mb-3 block">
              {entry.type === 'VOICE' ? 'Additional Notes (Optional)' : 'Content'}
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                entry.type === 'VOICE' 
                  ? "Add any additional written notes or context..."
                  : "Describe your experience, thoughts, or observations..."
              }
              className="bg-gray-700 border-gray-600 text-gray-50 min-h-[200px]"
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

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

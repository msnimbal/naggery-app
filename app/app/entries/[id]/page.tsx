
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, Trash2, Play, Pause, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { MOOD_EMOJIS, MOOD_LABELS, Entry } from '@/lib/types'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export default function EntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/entries/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setEntry(data)
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

  const handleDelete = async () => {
    if (!entry || !confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Entry deleted successfully'
        })
        router.push('/entries')
      } else {
        throw new Error('Failed to delete entry')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive'
      })
    }
  }

  const playVoiceNote = () => {
    if (!entry?.voiceUrl) return

    if (audio) {
      audio.pause()
      setAudio(null)
    }

    const newAudio = new Audio(entry.voiceUrl)
    newAudio.onended = () => {
      setIsPlaying(false)
      setAudio(null)
    }
    newAudio.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to play voice note',
        variant: 'destructive'
      })
      setIsPlaying(false)
      setAudio(null)
    }

    newAudio.play()
    setIsPlaying(true)
    setAudio(newAudio)
  }

  const pauseVoiceNote = () => {
    if (audio) {
      audio.pause()
      setIsPlaying(false)
      setAudio(null)
    }
  }

  const downloadVoiceNote = () => {
    if (!entry?.voiceUrl) return

    const link = document.createElement('a')
    link.href = entry.voiceUrl
    link.download = `voice-note-${entry.id}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        title="Entry Details" 
        showBack
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/entry/edit/${entry.id}`)}
              className="border-gray-600 text-gray-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Entry Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {entry.type === 'VOICE' ? '🎙️' : '📝'}
                </span>
                <span className="text-3xl">
                  {MOOD_EMOJIS[entry.mood]}
                </span>
              </div>
              
              <div className="flex-1">
                {entry.title && (
                  <h2 className="text-xl font-semibold text-gray-50 mb-2">
                    {entry.title}
                  </h2>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>
                    {entry.createdAt ? format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy') : ''}
                  </span>
                  <span>
                    {entry.createdAt ? format(new Date(entry.createdAt), 'h:mm a') : ''}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                    {MOOD_LABELS[entry.mood]}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entry Content */}
        {entry.type === 'TEXT' && entry.content && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Content</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voice Note Player */}
        {entry.type === 'VOICE' && entry.voiceUrl && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Voice Note</h3>
              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <div className="flex justify-center gap-4 mb-4">
                  <Button
                    onClick={isPlaying ? pauseVoiceNote : playVoiceNote}
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 mr-2" />
                    ) : (
                      <Play className="h-5 w-5 mr-2" />
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <Button
                    onClick={downloadVoiceNote}
                    variant="outline"
                    size="lg"
                    className="border-gray-600 text-gray-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download
                  </Button>
                </div>
                
                {isPlaying && (
                  <p className="text-sm text-blue-400 animate-pulse">
                    Playing voice note...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Text Content for Voice Entries */}
        {entry.type === 'VOICE' && entry.content && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Additional Notes</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

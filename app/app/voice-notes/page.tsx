
'use client'

import { useState, useEffect, useRef } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { VoiceRecorder } from "@/components/voice/voice-recorder"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  Play, 
  Pause, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Mic, 
  FileAudio,
  Search,
  Clock
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceRecording {
  id: string
  title?: string | null
  audioFileUrl: string
  transcription?: string | null
  duration?: number | null
  createdAt: string
  updatedAt: string
}

export default function VoiceNotesPage() {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/voice-notes')
      if (response.ok) {
        const data = await response.json()
        setRecordings(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch voice recordings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordingComplete = async (audioBlob: Blob, duration: number, title?: string) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('duration', duration.toString())
      if (title) {
        formData.append('title', title)
      }

      const response = await fetch('/api/voice-notes', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newRecording = await response.json()
        setRecordings([newRecording, ...recordings])
        
        toast({
          title: "Recording Saved",
          description: "Your voice note has been saved and transcribed",
        })
      } else {
        throw new Error('Failed to save recording')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recording",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const playRecording = (recording: VoiceRecording) => {
    // Stop any currently playing audio
    Object.values(audioRefs.current).forEach(audio => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    const audio = audioRefs.current[recording.id]
    if (audio) {
      audio.play()
      setPlayingId(recording.id)
    }
  }

  const pauseRecording = (recordingId: string) => {
    const audio = audioRefs.current[recordingId]
    if (audio) {
      audio.pause()
      setPlayingId(null)
    }
  }

  const handleAudioEnded = (recordingId: string) => {
    setPlayingId(null)
  }

  const deleteRecording = async (recordingId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return

    try {
      const response = await fetch(`/api/voice-notes/${recordingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setRecordings(recordings.filter(r => r.id !== recordingId))
        toast({
          title: "Recording Deleted",
          description: "The voice note has been deleted",
        })
      } else {
        throw new Error('Failed to delete recording')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recording",
        variant: "destructive",
      })
    }
  }

  const startEditing = (recording: VoiceRecording) => {
    setEditingId(recording.id)
    setEditTitle(recording.title || "")
  }

  const saveTitle = async (recordingId: string) => {
    try {
      const response = await fetch(`/api/voice-notes/${recordingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim() || null
        }),
      })

      if (response.ok) {
        const updatedRecording = await response.json()
        setRecordings(recordings.map(r => 
          r.id === recordingId ? updatedRecording : r
        ))
        setEditingId(null)
        setEditTitle("")
        
        toast({
          title: "Title Updated",
          description: "Recording title has been updated",
        })
      } else {
        throw new Error('Failed to update title')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      })
    }
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecordings = recordings.filter(recording => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    const titleMatch = recording.title?.toLowerCase().includes(searchLower)
    const transcriptionMatch = recording.transcription?.toLowerCase().includes(searchLower)
    
    return titleMatch || transcriptionMatch
  })

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Voice Notes</h1>
          <p className="text-muted-foreground">Record and manage your audio reflections</p>
        </div>

        {/* Voice Recorder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isUploading={isUploading}
          />
        </motion.div>

        {/* Search */}
        {recordings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recordings and transcriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        )}

        {/* Recordings List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRecordings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileAudio className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {recordings.length === 0 
                    ? "No voice notes yet. Record your first one above!" 
                    : "No recordings match your search."}
                </p>
              </motion.div>
            ) : (
              filteredRecordings.map((recording, index) => (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingId === recording.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Enter title..."
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => saveTitle(recording.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CardTitle className="flex items-center">
                                <Mic className="mr-2 h-4 w-4 text-primary" />
                                {recording.title || "Voice Note"}
                              </CardTitle>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(recording)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <CardDescription className="flex items-center mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(recording.createdAt)} • {formatDuration(recording.duration ?? null)}
                          </CardDescription>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => 
                              playingId === recording.id 
                                ? pauseRecording(recording.id)
                                : playRecording(recording)
                            }
                            size="sm"
                            variant="outline"
                          >
                            {playingId === recording.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => deleteRecording(recording.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {recording.transcription && (
                      <CardContent>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Transcription:
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {recording.transcription}
                          </p>
                        </div>
                      </CardContent>
                    )}

                    {/* Hidden Audio Element */}
                    <audio
                      ref={el => {
                        if (el) audioRefs.current[recording.id] = el
                      }}
                      src={recording.audioFileUrl}
                      onEnded={() => handleAudioEnded(recording.id)}
                    />
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedLayout>
  )
}

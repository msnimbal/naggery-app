
'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Mic, Square, Play, Pause, Upload, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, title?: string) => void
  isUploading?: boolean
}

export function VoiceRecorder({ onRecordingComplete, isUploading = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [hasRecorded, setHasRecorded] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setHasRecorded(true)

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      })

    } catch (error) {
      console.error('Error starting recording:', error)
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      toast({
        title: "Recording Stopped",
        description: `Recorded ${formatTime(recordingTime)}`,
      })
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const uploadRecording = () => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob, recordingTime, title.trim() || undefined)
      
      // Reset state
      setAudioBlob(null)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(null)
      setTitle("")
      setRecordingTime(0)
      setHasRecorded(false)
    }
  }

  const discardRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setTitle("")
    setRecordingTime(0)
    setHasRecorded(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2 h-5 w-5" />
          Voice Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            {!isRecording && !hasRecorded && (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full"
                disabled={isUploading}
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}

            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                >
                  <Square className="h-6 w-6" />
                </Button>
              </motion.div>
            )}

            {hasRecorded && !isRecording && (
              <div className="flex space-x-2">
                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  size="lg"
                  variant="outline"
                  className="h-12 w-12 rounded-full"
                  disabled={isUploading}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-foreground">
              {formatTime(recordingTime)}
            </div>
            {isRecording && (
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-sm text-destructive mt-1"
              >
                Recording...
              </motion.div>
            )}
          </div>
        </div>

        {/* Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        )}

        {/* Title Input */}
        {hasRecorded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Input
              placeholder="Give your recording a title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />

            <div className="flex space-x-2">
              <Button
                onClick={uploadRecording}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save Recording
                  </>
                )}
              </Button>
              <Button
                onClick={discardRecording}
                variant="outline"
                disabled={isUploading}
              >
                Discard
              </Button>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        {!isRecording && !hasRecorded && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Click the microphone to start recording</p>
            <p className="mt-1">Make sure your microphone is enabled</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

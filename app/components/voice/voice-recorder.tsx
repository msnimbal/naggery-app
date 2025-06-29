
'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoiceRecorder as VoiceRecorderLib } from '@/lib/voice-recorder'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  className?: string
}

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const recorderRef = useRef<VoiceRecorderLib | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const initRecorder = async () => {
      const recorder = new VoiceRecorderLib()
      
      if (!recorder.isSupported()) {
        setHasPermission(false)
        return
      }

      const initialized = await recorder.initialize()
      if (initialized) {
        recorderRef.current = recorder
        setHasPermission(true)
      } else {
        setHasPermission(false)
      }
    }

    initRecorder()

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cleanup()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    if (!recorderRef.current) return

    try {
      await recorderRef.current.startRecording()
      setIsRecording(true)
      setRecordingTime(0)
      setRecordedBlob(null)
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = async () => {
    if (!recorderRef.current) return

    try {
      const blob = await recorderRef.current.stopRecording()
      setIsRecording(false)
      setRecordedBlob(blob)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const playRecording = () => {
    if (!recordedBlob) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(URL.createObjectURL(recordedBlob))
    audioRef.current = audio

    audio.onended = () => {
      setIsPlaying(false)
    }

    audio.play()
    setIsPlaying(true)
  }

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const saveRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob)
      setRecordedBlob(null)
      setRecordingTime(0)
    }
  }

  const discardRecording = () => {
    setRecordedBlob(null)
    setRecordingTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (hasPermission === false) {
    return (
      <div className={cn('text-center p-8 text-gray-400', className)}>
        <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">
          Microphone access is required for voice recordings.
          <br />
          Please enable microphone permissions and refresh the page.
        </p>
      </div>
    )
  }

  if (hasPermission === null) {
    return (
      <div className={cn('text-center p-8 text-gray-400', className)}>
        <div className="animate-pulse">
          <Mic className="h-12 w-12 mx-auto mb-4" />
          <p className="text-sm">Initializing microphone...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-gray-800 rounded-lg p-6', className)}>
      <div className="text-center mb-6">
        <div className={cn(
          'inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all',
          isRecording 
            ? 'bg-red-500/20 text-red-400 recording-pulse' 
            : 'bg-blue-500/20 text-blue-400'
        )}>
          {isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </div>
        
        <p className="text-lg font-mono text-gray-200 mb-2">
          {formatTime(recordingTime)}
        </p>
        
        {isRecording && (
          <p className="text-sm text-red-400 animate-pulse">Recording...</p>
        )}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {!isRecording && !recordedBlob && (
          <Button
            onClick={startRecording}
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop Recording
          </Button>
        )}

        {recordedBlob && (
          <div className="flex gap-2">
            <Button
              onClick={isPlaying ? pausePlayback : playRecording}
              variant="outline"
              size="lg"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 mr-2" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              onClick={saveRecording}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Download className="h-5 w-5 mr-2" />
              Save
            </Button>
            
            <Button
              onClick={discardRecording}
              variant="destructive"
              size="lg"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Discard
            </Button>
          </div>
        )}
      </div>

      {recordedBlob && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Recording complete! You can play it back or save it to your entry.
          </p>
        </div>
      )}
    </div>
  )
}

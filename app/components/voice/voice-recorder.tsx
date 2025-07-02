
'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Download, Trash2, Settings, Volume2, Sparkles, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VoiceRecorder as VoiceRecorderLib } from '@/lib/voice-recorder'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  className?: string
}

type ApiProvider = 'OPENAI' | 'CLAUDE'

// Mock speech recognition service
const speechRecognitionService = {
  getBrowserSupport: () => ({
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  }),
  getIsListening: () => false
}

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  // Additional state variables for speech recognition and AI features
  const [transcription, setTranscription] = useState('')
  const [aiNotes, setAiNotes] = useState('')
  const [speechRecognitionEnabled, setSpeechRecognitionEnabled] = useState(false)
  const [aiProcessingEnabled, setAiProcessingEnabled] = useState(true)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>('OPENAI')
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  
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

  const generateAiNotes = async (text: string) => {
    if (!text.trim()) return
    
    setIsGeneratingNotes(true)
    try {
      // Mock AI note generation - in a real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockNotes = `AI-Generated Notes:\n\n• Key points from transcription\n• Summary of main topics\n• Action items identified\n\nOriginal text: "${text.substring(0, 100)}..."`
      setAiNotes(mockNotes)
    } catch (error) {
      console.error('Failed to generate AI notes:', error)
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  const hasRecordedContent = recordedBlob || transcription.trim() || aiNotes.trim()
  const speechSupport = speechRecognitionService.getBrowserSupport()

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
    <div className={cn('space-y-6', className)}>
      {/* Settings Panel */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Recording Options
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <Label htmlFor="speech-recognition" className="text-sm text-gray-300">
                Live Transcription
              </Label>
              {!speechSupport.isSupported && (
                <Badge variant="secondary" className="text-xs">
                  Not Available
                </Badge>
              )}
            </div>
            <Switch
              id="speech-recognition"
              checked={speechRecognitionEnabled}
              onCheckedChange={setSpeechRecognitionEnabled}
              disabled={!speechSupport.isSupported}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <Label htmlFor="ai-processing" className="text-sm text-gray-300">
                AI Note Generation
              </Label>
            </div>
            <Switch
              id="ai-processing"
              checked={aiProcessingEnabled}
              onCheckedChange={setAiProcessingEnabled}
            />
          </div>

          {showAdvancedOptions && (
            <div className="space-y-3 pt-2 border-t border-gray-700">
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">AI Provider</Label>
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => setSelectedProvider(value as ApiProvider)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPENAI">OpenAI GPT-4</SelectItem>
                    <SelectItem value="CLAUDE">Claude 3.5 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!speechSupport.isSupported && (
                <div className="text-xs text-amber-400 bg-amber-400/10 p-2 rounded">
                  ⚠️ Speech recognition not supported in this browser. Audio will be recorded for manual transcription.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
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
              <div className="space-y-1">
                <p className="text-sm text-red-400 animate-pulse">Recording...</p>
                {speechRecognitionEnabled && speechSupport.isSupported && (
                  <p className="text-xs text-blue-400">Live transcription active</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mb-6">
            {!isRecording && !hasRecordedContent && (
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

            {hasRecordedContent && !isRecording && (
              <div className="flex gap-2">
                {recordedBlob && (
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
                )}
                
                <Button
                  onClick={saveRecording}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isGeneratingNotes}
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
        </CardContent>
      </Card>

      {/* Live Transcription Display */}
      {(isRecording || transcription) && speechRecognitionEnabled && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Live Transcription
              {isRecording && speechRecognitionService.getIsListening() && (
                <Badge variant="secondary" className="text-xs animate-pulse">
                  Listening
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 min-h-[100px]">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {transcription}
                {currentTranscript && (
                  <span className="text-blue-400 opacity-70">{currentTranscript}</span>
                )}
                {!transcription && !currentTranscript && isRecording && (
                  <span className="text-gray-500 italic">Start speaking to see transcription...</span>
                )}
              </p>
            </div>
            {transcription && !isRecording && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateAiNotes(transcription)}
                  disabled={isGeneratingNotes}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isGeneratingNotes ? 'Generating...' : 'Generate AI Notes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Notes Display */}
      {aiNotes && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              AI-Generated Notes
              <Badge variant="secondary" className="text-xs">
                {selectedProvider}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                {aiNotes}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {(isGeneratingNotes) && (
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-200 font-medium">
                  Generating AI Notes...
                </p>
                <p className="text-xs text-blue-300">
                  Converting your transcription into structured notes using {selectedProvider}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
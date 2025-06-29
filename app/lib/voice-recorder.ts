
'use client'

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to initialize voice recorder:', error)
      return false
    }
  }

  startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not initialized'))
        return
      }

      this.audioChunks = []
      this.mediaRecorder.start(1000) // Collect data every 1000ms
      
      this.mediaRecorder.onstart = () => {
        resolve()
      }
      
      this.mediaRecorder.onerror = (event: any) => {
        reject(event.error || new Error('Recording failed'))
      }
    })
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not initialized'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    this.mediaRecorder = null
    this.stream = null
    this.audioChunks = []
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  isSupported(): boolean {
    try {
      return !!(typeof navigator !== 'undefined' && 
               navigator.mediaDevices && 
               typeof navigator.mediaDevices.getUserMedia === 'function' && 
               typeof window !== 'undefined' && 
               typeof window.MediaRecorder !== 'undefined')
    } catch {
      return false
    }
  }
}

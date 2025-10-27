// Speech-to-Text Service using Web Speech API
// Supports multiple languages and provides real-time transcription

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export class SpeechToTextService {
  private recognition: any | null = null
  private isListening = false
  private transcript = ""
  private interimTranscript = ""

  constructor(language = "en-US") {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      throw new Error("Speech Recognition API not supported in this browser")
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.language = language
  }

  start(
    onResult: (transcript: string, interim: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
  ): void {
    if (!this.recognition) return

    this.transcript = ""
    this.interimTranscript = ""
    this.isListening = true

    this.recognition.onstart = () => {
      this.isListening = true
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          this.transcript += transcript + " "
        } else {
          this.interimTranscript += transcript
        }
      }

      onResult(this.transcript, this.interimTranscript)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd()
    }

    this.recognition.start()
  }

  stop(): string {
    if (!this.recognition) return ""
    this.recognition.stop()
    this.isListening = false
    return this.transcript.trim()
  }

  abort(): void {
    if (!this.recognition) return
    this.recognition.abort()
    this.isListening = false
  }

  getIsListening(): boolean {
    return this.isListening
  }

  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.language = language
    }
  }
}

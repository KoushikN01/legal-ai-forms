"use client"

import { useState, useRef, useEffect } from "react"
import { SpeechToTextService } from "@/lib/speech-to-text"

interface RecorderProps {
  formId: string
  onComplete: (transcript: string) => void
  onBack: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function Recorder({ formId, onComplete, onBack }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [transcriptionMode, setTranscriptionMode] = useState<"browser" | "server">("browser")
  const speechServiceRef = useRef<SpeechToTextService | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (transcriptionMode === "browser") {
      try {
        speechServiceRef.current = new SpeechToTextService(selectedLanguage)
      } catch (err) {
        setError("Speech Recognition not supported in your browser")
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (speechServiceRef.current) {
        speechServiceRef.current.abort()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [selectedLanguage, transcriptionMode])

  const startRecording = async () => {
    setError("")
    setTranscript("")
    setInterimTranscript("")
    setRecordingTime(0)
    setIsRecording(true)

    if (transcriptionMode === "browser") {
      if (!speechServiceRef.current) {
        setError("Speech Recognition service not available")
        return
      }

      speechServiceRef.current.start(
        (finalTranscript, interim) => {
          setTranscript(finalTranscript)
          setInterimTranscript(interim)
        },
        (error) => {
          setError(`Error: ${error}`)
          setIsRecording(false)
        },
        () => {
          setIsRecording(false)
          if (timerRef.current) clearInterval(timerRef.current)
        },
      )
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          await transcribeAudio(audioBlob)
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start()
      } catch (err) {
        setError("Microphone access denied")
        setIsRecording(false)
        return
      }
    }

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)

    if (transcriptionMode === "browser" && speechServiceRef.current) {
      const finalTranscript = speechServiceRef.current.stop()
      setTranscript(finalTranscript)
    } else if (transcriptionMode === "server" && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsProcessing(true)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "recording.wav")

      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Transcription failed")
      }

      const data = await response.json()
      setTranscript(data.transcript || data.text || "")
    } catch (err) {
      setError("Failed to transcribe audio. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (transcript) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Transcription Complete</h2>
          <div className="bg-background rounded-lg p-6 mb-6 border border-border">
            <p className="text-foreground leading-relaxed">{transcript}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => onComplete(transcript)}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
            >
              Continue to Review
            </button>
            <button
              onClick={() => {
                setTranscript("")
                setRecordingTime(0)
              }}
              className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium"
            >
              Record Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Record Your Answers</h2>
          <p className="text-muted-foreground">Speak clearly in your preferred language</p>
        </div>

        <div className="mb-6 flex justify-center gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Transcription Mode:</label>
            <select
              value={transcriptionMode}
              onChange={(e) => setTranscriptionMode(e.target.value as "browser" | "server")}
              disabled={isRecording}
              className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
            >
              <option value="browser">Browser (Real-time)</option>
              <option value="server">Server (OpenAI Whisper)</option>
            </select>
          </div>

          {transcriptionMode === "browser" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi</option>
                <option value="ta-IN">Tamil</option>
                <option value="te-IN">Telugu</option>
                <option value="mr-IN">Marathi</option>
                <option value="bn-IN">Bengali</option>
                <option value="gu-IN">Gujarati</option>
                <option value="kn-IN">Kannada</option>
                <option value="ml-IN">Malayalam</option>
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-8">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isRecording ? "bg-red-500/20 animate-pulse" : "bg-primary/10"
            }`}
          >
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || !!error}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="4" width="3" height="12" />
                  <rect x="11" y="4" width="3" height="12" />
                </svg>
              ) : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              )}
            </button>
          </div>

          {isRecording && (
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-primary mb-2">{formatTime(recordingTime)}</p>
              <p className="text-sm text-muted-foreground">Recording in progress...</p>
              {interimTranscript && transcriptionMode === "browser" && (
                <p className="text-sm text-muted-foreground italic mt-2">{interimTranscript}</p>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Processing your audio with OpenAI Whisper...</p>
            </div>
          )}

          {!isRecording && !isProcessing && !error && (
            <p className="text-center text-muted-foreground">Click the microphone to start recording</p>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-8 px-6 py-2 text-muted-foreground hover:text-foreground transition"
        >
          Back
        </button>
      </div>
    </div>
  )
}

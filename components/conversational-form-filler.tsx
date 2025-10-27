"use client"

import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
} from "lucide-react"
import { getTextToSpeechService } from "@/lib/text-to-speech"
import { getTranslation } from "@/lib/translations"

interface Field {
  id: string
  label: string
  help: string
  type?: string
  required?: boolean
}

interface ConversationalFormFillerProps {
  formId: string
  fields: Field[]
  onComplete: (formData: Record<string, string>) => void
  onBack: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ConversationalFormFiller({
  formId,
  fields,
  onComplete,
  onBack,
}: ConversationalFormFillerProps) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState("")
  const [showChatbot, setShowChatbot] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [isSpeaking, setIsSpeaking] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const ttsService = useRef(getTextToSpeechService())

  const currentField = fields[currentFieldIndex]
  const progress = ((currentFieldIndex + 1) / fields.length) * 100

  useEffect(() => {
    // Initialize Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = selectedLanguage
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      ttsService.current.stop()
    }
  }, [selectedLanguage])

  useEffect(() => {
    // Auto-speak the question when moving to a new field
    const timer = setTimeout(() => {
      speakQuestion()
    }, 500)

    return () => {
      clearTimeout(timer)
      ttsService.current.stop()
    }
  }, [currentFieldIndex, selectedLanguage])

  const startRecording = async () => {
    setError("")
    setTranscript("")
    setIsRecording(true)

    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLanguage

        recognitionRef.current.onresult = async (event: any) => {
          const spokenText = event.results[0][0].transcript
          setTranscript(spokenText)
          setIsProcessing(true)

          try {
            let translatedValue = spokenText // Default to spoken text

            try {
              // Try to use backend for translation
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

              const response = await fetch(`${API_BASE_URL}/translate-and-fill`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: spokenText,
                  field_name: currentField.label,
                  field_help: currentField.help,
                  source_language: selectedLanguage,
                }),
                signal: controller.signal,
              })

              clearTimeout(timeoutId)

              if (response.ok) {
                const data = await response.json()
                translatedValue = data.translated_value || spokenText
                console.log("[v0] Successfully translated using backend")
              } else {
                console.log("[v0] Backend translation failed, using original text")
              }
            } catch (fetchError) {
              // Backend unavailable - use the spoken text directly
              console.log("[v0] Backend unavailable, using spoken text directly:", spokenText)
            }

            // Save the value (either translated or original)
            setFormData((prev) => ({ ...prev, [currentField.id]: translatedValue }))

            // Auto-advance to next field after 1.5 seconds
            setTimeout(() => {
              if (currentFieldIndex < fields.length - 1) {
                setCurrentFieldIndex((prev) => prev + 1)
                setTranscript("")
              }
            }, 1500)
          } catch (err) {
            console.error("[v0] Error processing response:", err)
            setError("Failed to process your response. Please try again.")
          } finally {
            setIsProcessing(false)
            setIsRecording(false)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("[v0] Speech recognition error:", event.error)
          setError(`Error: ${event.error}`)
          setIsRecording(false)
        }

        recognitionRef.current.start()
      } else {
        setError("Speech recognition not supported in your browser")
        setIsRecording(false)
      }
    } catch (err) {
      console.error("[v0] Failed to start recording:", err)
      setError("Failed to start recording")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const speakQuestion = () => {
    if (isSpeaking) {
      ttsService.current.stop()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    const questionText = `${currentField.label}. ${currentField.help}`
    ttsService.current.speak(questionText, selectedLanguage, () => {
      setIsSpeaking(false)
    })
  }

  const handleNext = () => {
    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex((prev) => prev + 1)
      setTranscript("")
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex((prev) => prev - 1)
      setTranscript("")
    }
  }

  const handleManualInput = (value: string) => {
    setFormData((prev) => ({ ...prev, [currentField.id]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                {getTranslation(selectedLanguage, "stepOf", { current: currentFieldIndex + 1, total: fields.length })}
              </span>
            </div>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {getTranslation(selectedLanguage, "complete", { percent: Math.round(progress) })}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-8 border border-gray-100 animate-slide-up">
          {/* Language Selector */}
          <div className="mb-8 flex justify-end">
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="appearance-none px-6 py-3 pr-10 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-blue-300 disabled:opacity-50"
              >
                <option value="en-US">🇬🇧 English</option>
                <option value="hi-IN">🇮🇳 हिंदी (Hindi)</option>
                <option value="ta-IN">🇮🇳 தமிழ் (Tamil)</option>
                <option value="te-IN">🇮🇳 తెలుగు (Telugu)</option>
                <option value="kn-IN">🇮🇳 ಕನ್ನಡ (Kannada)</option>
                <option value="mr-IN">🇮🇳 मराठी (Marathi)</option>
                <option value="bn-IN">🇮🇳 বাংলা (Bengali)</option>
                <option value="gu-IN">🇮🇳 ગુજરાતી (Gujarati)</option>
                <option value="ml-IN">🇮🇳 മലയാളം (Malayalam)</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-10">
            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {currentField.type || "Text"} Field
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">{currentField.label}</h2>
              <button
                onClick={speakQuestion}
                className={`p-3 rounded-full transition-all ${
                  isSpeaking ? "bg-blue-600 text-white animate-pulse" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
                title={getTranslation(selectedLanguage, "speakQuestion")}
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{currentField.help}</p>
          </div>

          {/* Recording Interface */}
          <div className="flex flex-col items-center gap-8 mb-10">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                isRecording
                  ? "bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/50 animate-pulse"
                  : "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <MicOff className="w-14 h-14" /> : <Mic className="w-14 h-14" />}
              {isRecording && <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />}
            </button>

            {isRecording && (
              <div className="flex items-center gap-3 bg-red-50 px-6 py-3 rounded-full border border-red-200">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-red-700">{getTranslation(selectedLanguage, "listening")}</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full border border-blue-200">
                <div className="animate-spin rounded-full h-5 w-5 border-3 border-blue-600 border-t-transparent" />
                <p className="text-sm font-medium text-blue-700">{getTranslation(selectedLanguage, "processing")}</p>
              </div>
            )}

            {transcript && !isProcessing && (
              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      {getTranslation(selectedLanguage, "successfullyRecorded")}
                    </p>
                    <p className="text-base text-green-800 font-medium">{transcript}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="w-full bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      {getTranslation(selectedLanguage, "error")}
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Option */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {getTranslation(selectedLanguage, "orTypeAnswer")}
            </label>
            <input
              type="text"
              value={formData[currentField.id] || ""}
              onChange={(e) => handleManualInput(e.target.value)}
              placeholder={getTranslation(selectedLanguage, "enterField", { field: currentField.label.toLowerCase() })}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentFieldIndex === 0}
              className="flex items-center justify-center gap-2 flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
              {getTranslation(selectedLanguage, "previous")}
            </button>
            <button
              onClick={handleNext}
              disabled={!formData[currentField.id]}
              className="flex items-center justify-center gap-2 flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {currentFieldIndex === fields.length - 1
                ? getTranslation(selectedLanguage, "completeForm")
                : getTranslation(selectedLanguage, "nextQuestion")}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Help Button */}
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center transform hover:scale-110 z-50"
        >
          <MessageCircle className="w-7 h-7" />
        </button>

        {/* Chatbot Modal */}
        {showChatbot && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Legal Assistant</h3>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                <p className="text-sm font-semibold text-blue-900 mb-2">About {currentField.label}:</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{currentField.help}</p>
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Tip:</strong> This information is required for legal documentation. Please provide
                    accurate details to avoid delays in processing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full text-center text-gray-600 hover:text-gray-900 transition-colors font-medium py-3"
        >
          ← {getTranslation(selectedLanguage, "backToForms")}
        </button>
      </div>
    </div>
  )
}

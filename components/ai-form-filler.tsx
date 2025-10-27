"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Volume2, VolumeX, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface AIFormFillerProps {
  formId: string
  onComplete: (formData: Record<string, string>) => void
  onBack: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function AIFormFiller({ formId, onComplete, onBack }: AIFormFillerProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResult, setAiResult] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  const recognitionRef = useRef<any>(null)
  const ttsService = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "hi-IN" // Default to Hindi, can be changed
    }

    // Initialize Text-to-Speech
    ttsService.current = {
      speak: (text: string, lang: string = "hi-IN", onEnd?: () => void) => {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = lang
          utterance.onend = onEnd
          speechSynthesis.speak(utterance)
        }
      },
      stop: () => {
        if ("speechSynthesis" in window) {
          speechSynthesis.cancel()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      ttsService.current?.stop()
    }
  }, [])

  const startRecording = async () => {
    setError("")
    setTranscript("")
    setIsRecording(true)

    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = async (event: any) => {
          const spokenText = event.results[0][0].transcript
          setTranscript(spokenText)
          setIsProcessing(true)

          try {
            // Process the speech with AI
            const response = await fetch(`${API_BASE_URL}/smart-form-detection`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token") || "test_token"}`
              },
              body: JSON.stringify({
                speech_text: spokenText,
                language: "auto"
              })
            })

            if (response.ok) {
              const result = await response.json()
              setAiResult(result)
              
              if (result.extracted_data) {
                setFormData(prev => ({ ...prev, ...result.extracted_data }))
              }

              if (result.suggested_questions && result.suggested_questions.length > 0) {
                setCurrentQuestion(result.suggested_questions[0])
                speakQuestion(result.suggested_questions[0])
              } else {
                // Form is complete
                onComplete(formData)
              }
            } else {
              setError("Failed to process your speech. Please try again.")
            }
          } catch (err) {
            console.error("Error processing speech:", err)
            setError("Failed to process your speech. Please try again.")
          } finally {
            setIsProcessing(false)
            setIsRecording(false)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setError(`Error: ${event.error}`)
          setIsRecording(false)
        }

        recognitionRef.current.start()
      } else {
        setError("Speech recognition not supported in your browser")
        setIsRecording(false)
      }
    } catch (err) {
      console.error("Failed to start recording:", err)
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

  const speakQuestion = (question: string) => {
    if (isSpeaking) {
      ttsService.current?.stop()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    ttsService.current?.speak(question, "hi-IN", () => {
      setIsSpeaking(false)
    })
  }

  const answerQuestion = async (answer: string) => {
    if (!aiResult) return

    setIsProcessing(true)
    try {
      // Process the answer and get next question
      const response = await fetch(`${API_BASE_URL}/answer-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || "test_token"}`
        },
        body: JSON.stringify({
          session_id: aiResult.session_id || "temp_session",
          answer: answer,
          language: aiResult.detected_language || "hi"
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.status === "success") {
          setFormData(prev => ({
            ...prev,
            [aiResult.current_field]: result.extracted_value
          }))

          if (result.next_question) {
            setCurrentQuestion(result.next_question.question)
            speakQuestion(result.next_question.question)
            setProgress(result.progress.percentage)
          } else {
            // Form is complete
            onComplete(formData)
          }
        } else {
          setError(result.message || "Failed to process your answer")
        }
      } else {
        setError("Failed to process your answer")
      }
    } catch (err) {
      console.error("Error processing answer:", err)
      setError("Failed to process your answer")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualInput = (value: string) => {
    if (value.trim()) {
      answerQuestion(value)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Form Filling
          </h1>
          <p className="text-xl text-gray-600">
            Speak naturally in any language. AI will understand and fill your form automatically.
          </p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Form Progress</span>
                <span className="text-sm text-gray-500">{progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            {/* AI Result Display */}
            {aiResult && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">AI Analysis Complete</h3>
                    <p className="text-sm text-gray-600">
                      Detected: {aiResult.form_type?.replace('_', ' ').toUpperCase()} | 
                      Language: {aiResult.detected_language?.toUpperCase()} | 
                      Confidence: {Math.round((aiResult.confidence || 0) * 100)}%
                    </p>
                  </div>
                </div>

                {aiResult.extracted_data && Object.keys(aiResult.extracted_data).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📋 Extracted Information:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(aiResult.extracted_data).map(([field, value]) => (
                        <div key={field} className="bg-white rounded-lg p-3 border border-purple-200">
                          <span className="text-sm font-medium text-gray-700">{field.replace('_', ' ')}:</span>
                          <span className="text-sm text-gray-900 ml-2">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current Question */}
            {currentQuestion && (
              <div className="p-6 bg-blue-50 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🤖 AI Question:</h3>
                <p className="text-gray-700 mb-4">{currentQuestion}</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => speakQuestion(currentQuestion)}
                    disabled={isSpeaking}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isSpeaking ? "Stop Speaking" : "Speak Question"}
                  </button>
                </div>
              </div>
            )}

            {/* Voice Recording Section */}
            <div className="p-8">
              {!isRecording && !isProcessing ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {aiResult ? "Answer the Question" : "Speak Your Legal Request"}
                  </h2>
                  
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    {aiResult 
                      ? "Click the microphone and answer the question above."
                      : "Tell me what you need help with. For example: 'मेरा नाम राम है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं'"
                    }
                  </p>

                  <button
                    onClick={startRecording}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
                  >
                    <Mic className="w-6 h-6" />
                    {aiResult ? "Answer Now" : "Start Speaking"}
                  </button>
                </div>
              ) : isRecording ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <MicOff className="w-12 h-12 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Listening...</h2>
                  <p className="text-gray-600 mb-8">Speak clearly into your microphone</p>
                  
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
                  >
                    <MicOff className="w-6 h-6" />
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">AI is Processing...</h2>
                  <p className="text-gray-600 mb-8">Please wait while AI analyzes your speech</p>
                </div>
              )}

              {/* Manual Input Option */}
              {currentQuestion && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Or Type Your Answer:</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualInput(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleManualInput(input.value)
                        input.value = ''
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Transcript Display */}
              {transcript && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">You said:</h4>
                  <p className="text-gray-700">{transcript}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Forms
              </button>
              
              {formData && Object.keys(formData).length > 0 && (
                <button
                  onClick={() => onComplete(formData)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Brain, CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface AIFormFillerProps {
  onComplete: (formData: any, formType?: string) => void
}

export default function AIFormFillerVoiceFix({ onComplete }: AIFormFillerProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResult, setAiResult] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [step, setStep] = useState<"initial" | "questions" | "complete">("initial")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const recognitionRef = useRef<any>(null)
  const ttsService = useRef<any>(null)

  useEffect(() => {
    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US" // Default to English, but will auto-detect
    }

    // Initialize Text-to-Speech
    ttsService.current = {
      speak: (text: string, lang: string = "en-US", onEnd?: () => void) => {
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
  }, [])

  const startRecording = async () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported")
      return
    }

    setIsRecording(true)
    setError("")
    setTranscript("")

    try {
      recognitionRef.current.onresult = async (event: any) => {
        const spokenText = event.results[0][0].transcript
        console.log(`[DEBUG] Voice input received: "${spokenText}"`)
        setTranscript(spokenText)
        setIsProcessing(true)

        try {
          // If we're in questions step, process the answer
          if (step === "questions") {
            console.log(`[DEBUG] Processing answer in questions step`)
            await answerQuestion(spokenText)
            return
          }

          // Process the speech with AI
          console.log(`[DEBUG] Processing initial speech for form detection`)
          const response = await fetch(`${API_BASE_URL}/smart-form-detection`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJleHAiOjE3NjEzNzc5OTcsImlhdCI6MTc2MTI5MTU5N30.nTW3Pr_zaRF8mv9T-pkdeKp7HddYh9BU1enlFuJ3pqQ"}`
            },
            body: JSON.stringify({
              speech_text: spokenText,
              language: "auto"
            })
          })

          if (response.ok) {
            const result = await response.json()
            console.log(`[DEBUG] AI result received:`, result)
            console.log(`[DEBUG] Detected language from AI: ${result.detected_language}`)
            console.log(`[DEBUG] Missing fields: ${result.missing_required_fields}`)
            setAiResult(result)
            
            if (result.extracted_data) {
              setFormData(result.extracted_data)
            }

            // Check if there are missing required fields
            if (result.missing_required_fields && result.missing_required_fields.length > 0) {
              console.log(`[DEBUG] Missing fields: ${result.missing_required_fields.join(", ")}`)
              setStep("questions")
              
              // Ask first question - use backend suggested questions if available
              const firstField = result.missing_required_fields[0]
              console.log(`[DEBUG] First field: ${firstField}`)
              console.log(`[DEBUG] Detected language for question: ${result.detected_language}`)
              console.log(`[DEBUG] Backend suggested questions: ${result.suggested_questions}`)
              
              let question
              if (result.suggested_questions && result.suggested_questions.length > 0) {
                // Use backend generated questions (in correct language)
                question = result.suggested_questions[0]
                console.log(`[DEBUG] Using backend question: ${question}`)
              } else {
                // Fallback to frontend generation
                question = generateQuestion(firstField, result.detected_language)
                console.log(`[DEBUG] Using frontend generated question: ${question}`)
              }
              
              setCurrentQuestion(question)
              speakQuestion(question, result.detected_language)
              
              // Update AI result with current field index
              setAiResult(prev => ({
                ...prev,
                current_field_index: 0,
                current_field: firstField
              }))
              
              setProgress(Math.round((1 / result.missing_required_fields.length) * 100))
            } else {
              // All fields are complete
              setStep("complete")
              setProgress(100)
              onComplete(formData, aiResult?.form_type)
            }
          } else {
            setError("Failed to process your speech")
          }
        } catch (err) {
          console.error("Error processing speech:", err)
          setError("Failed to process your speech")
        } finally {
          setIsProcessing(false)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsRecording(false)
        setIsProcessing(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current.start()
    } catch (err) {
      console.error("Error starting speech recognition:", err)
      setError("Failed to start speech recognition")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const speakQuestion = (question: string, detectedLanguage: string = "en") => {
    if (isSpeaking) {
      ttsService.current?.stop()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    
    // Map detected language to TTS language codes
    const langMap: { [key: string]: string } = {
      "hi": "hi-IN",
      "en": "en-US",
      "te": "te-IN",
      "ta": "ta-IN",
      "bn": "bn-IN",
      "gu": "gu-IN",
      "kn": "kn-IN",
      "ml": "ml-IN",
      "pa": "pa-IN",
      "mr": "mr-IN"
    }
    
    const ttsLanguage = langMap[detectedLanguage] || "en-US"
    console.log(`[DEBUG] Speaking question in language: ${ttsLanguage}`)
    
    // Use browser's speech synthesis with proper language
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(question)
      utterance.lang = ttsLanguage
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      speechSynthesis.speak(utterance)
    } else {
      setIsSpeaking(false)
    }
  }

  const answerQuestion = async (answer: string) => {
    if (!aiResult) {
      console.error("[DEBUG] No AI result available")
      return
    }

    console.log(`[DEBUG] Answering question with: "${answer}"`)
    setIsProcessing(true)
    try {
      // Get the current missing fields
      const missingFields = aiResult.missing_required_fields || []
      const currentFieldIndex = aiResult.current_field_index || 0
      
      console.log(`[DEBUG] Current field index: ${currentFieldIndex}`)
      console.log(`[DEBUG] Missing fields: ${missingFields.join(", ")}`)
      console.log(`[DEBUG] Current field: ${missingFields[currentFieldIndex]}`)
      
      // Process the answer using AI with proper language handling
      const response = await fetch(`${API_BASE_URL}/translate-and-fill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJleHAiOjE3NjEzNzc5OTcsImlhdCI6MTc2MTI5MTU5N30.nTW3Pr_zaRF8mv9T-pkdeKp7HddYh9BU1enlFuJ3pqQ"}`
        },
        body: JSON.stringify({
          text: answer,
          field_name: missingFields[currentFieldIndex] || "unknown_field",
          field_help: `Please provide your ${missingFields[currentFieldIndex] || "information"}`,
          source_language: aiResult.detected_language || "en"
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`[DEBUG] Translation result:`, result)
        
        if (result.translated_value) {
          console.log(`[DEBUG] Extracted value: ${result.translated_value}`)
          
          // Add the extracted value to form data
          setFormData(prev => ({
            ...prev,
            [missingFields[currentFieldIndex]]: result.translated_value
          }))

          // Check if there are more questions
          const nextFieldIndex = currentFieldIndex + 1
          console.log(`[DEBUG] Next field index: ${nextFieldIndex}`)
          console.log(`[DEBUG] Total missing fields: ${missingFields.length}`)
          
          if (nextFieldIndex < missingFields.length) {
            // Ask next question in the same language as user's initial speech
            const nextField = missingFields[nextFieldIndex]
            console.log(`[DEBUG] Next field: ${nextField}`)
            console.log(`[DEBUG] Backend suggested questions: ${aiResult.suggested_questions}`)
            
            let question
            if (aiResult.suggested_questions && aiResult.suggested_questions.length > nextFieldIndex) {
              // Use backend generated questions (in correct language)
              question = aiResult.suggested_questions[nextFieldIndex]
              console.log(`[DEBUG] Using backend question: ${question}`)
            } else {
              // Fallback to frontend generation
              question = generateQuestion(nextField, aiResult.detected_language)
              console.log(`[DEBUG] Using frontend generated question: ${question}`)
            }
            
            setCurrentQuestion(question)
            speakQuestion(question, aiResult.detected_language)
            
            // Update AI result with current field index
            setAiResult(prev => ({
              ...prev,
              current_field_index: nextFieldIndex,
              current_field: nextField
            }))
            
            // Update progress
            setProgress(Math.round(((nextFieldIndex + 1) / missingFields.length) * 100))
          } else {
            // Form is complete
            console.log(`[DEBUG] Form complete! All fields filled.`)
            setStep("complete")
            setProgress(100)
            onComplete(formData, aiResult?.form_type)
          }
        } else {
          console.error("[DEBUG] No translated value received")
          setError("Failed to extract information from your answer")
        }
      } else {
        console.error(`[DEBUG] API error: ${response.status}`)
        setError("Failed to process your answer")
      }
    } catch (err) {
      console.error("Error processing answer:", err)
      setError("Failed to process your answer")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateQuestion = (fieldName: string, language: string) => {
    console.log(`[DEBUG] Generating question for field: ${fieldName}, language: ${language}`)
    
    // Map language codes to question languages
    const langMap: { [key: string]: string } = {
      "hi": "hi",
      "en": "en", 
      "te": "te",
      "ta": "ta",
      "bn": "bn",
      "gu": "gu",
      "kn": "kn",
      "ml": "ml",
      "pa": "pa",
      "mr": "mr"
    }
    
    const lang = langMap[language] || "en"
    console.log(`[DEBUG] Mapped language: ${lang}`)
    
    const questions: { [key: string]: { [key: string]: string } } = {
      "plaintiff_name": {
        "hi": "आपका नाम क्या है?",
        "te": "మీ పేరు ఏమిటి?",
        "en": "What is your name?",
        "ta": "உங்கள் பெயர் என்ன?",
        "bn": "আপনার নাম কি?",
        "gu": "તમારું નામ શું છે?",
        "kn": "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
        "ml": "നിങ്ങളുടെ പേര് എന്താണ്?",
        "pa": "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?",
        "mr": "तुमचे नाव काय आहे?"
      },
      "plaintiff_address": {
        "hi": "आपका पता क्या है?",
        "te": "మీ చిరునామా ఏమిటి?",
        "en": "What is your address?",
        "ta": "உங்கள் முகவரி என்ன?",
        "bn": "আপনার ঠিকানা কি?",
        "gu": "તમારું સરનામું શું છે?",
        "kn": "ನಿಮ್ಮ ವಿಳಾಸ ಏನು?",
        "ml": "നിങ്ങളുടെ വിലാസം എന്താണ്?",
        "pa": "ਤੁਹਾਡਾ ਪਤਾ ਕੀ ਹੈ?",
        "mr": "तुमचा पत्ता काय आहे?"
      },
      "defendant_name": {
        "hi": "प्रतिवादी का नाम क्या है?",
        "te": "ప్రతివాది పేరు ఏమిటి?",
        "en": "What is the defendant's name?",
        "ta": "பிரதிவாதியின் பெயர் என்ன?",
        "bn": "প্রতিবাদীর নাম কি?",
        "gu": "પ્રતિવાદીનું નામ શું છે?",
        "kn": "ಪ್ರತಿವಾದಿಯ ಹೆಸರು ಏನು?",
        "ml": "പ്രതിവാദിയുടെ പേര് എന്താണ്?",
        "pa": "ਪ੍ਰਤੀਵਾਦੀ ਦਾ ਨਾਮ ਕੀ ਹੈ?",
        "mr": "प्रतिवादीचे नाव काय आहे?"
      },
      "defendant_address": {
        "hi": "प्रतिवादी का पता क्या है?",
        "te": "ప్రతివాది చిరునామా ఏమిటి?",
        "en": "What is the defendant's address?",
        "ta": "பிரதிவாதியின் முகவரி என்ன?",
        "bn": "প্রতিবাদীর ঠিকানা কি?",
        "gu": "પ્રતિવાદીનું સરનામું શું છે?",
        "kn": "ಪ್ರತಿವಾದಿಯ ವಿಳಾಸ ಏನು?",
        "ml": "പ്രതിവാദിയുടെ വിലാസം എന്താണ്?",
        "pa": "ਪ੍ਰਤੀਵਾਦੀ ਦਾ ਪਤਾ ਕੀ ਹੈ?",
        "mr": "प्रतिवादीचा पत्ता काय आहे?"
      },
      "property_description": {
        "hi": "संपत्ति का विवरण क्या है?",
        "te": "ఆస్తి వివరణ ఏమిటి?",
        "en": "What is the property description?",
        "ta": "சொத்தின் விளக்கம் என்ன?",
        "bn": "সম্পত্তির বিবরণ কি?",
        "gu": "મિલકતનું વર્ણન શું છે?",
        "kn": "ಆಸ್ತಿಯ ವಿವರಣೆ ಏನು?",
        "ml": "ആസ്തിയുടെ വിവരണം എന്താണ്?",
        "pa": "ਜਾਇਦਾਦ ਦਾ ਵੇਰਵਾ ਕੀ ਹੈ?",
        "mr": "मालमत्तेचे वर्णन काय आहे?"
      }
    }
    
    return questions[fieldName]?.[lang] || `Please provide your ${fieldName.replace('_', ' ')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Legal Assistant
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Speak naturally in any language. AI will understand your legal needs, detect the right form, 
            and fill it automatically. No manual form selection required!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
            
            {/* AI Result Display */}
            {aiResult && step !== "initial" && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 border-b border-purple-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">AI Analysis Complete</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {aiResult.form_type?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                        {aiResult.detected_language?.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {Math.round((aiResult.confidence || 0) * 100)}% Confidence
                      </span>
                    </div>
                  </div>
                </div>

                {aiResult.extracted_data && Object.keys(aiResult.extracted_data).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Information Extracted
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(aiResult.extracted_data).map(([field, value]) => (
                        <div key={field} className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                          <span className="text-sm font-medium text-gray-700">{field.replace('_', ' ')}:</span>
                          <span className="text-gray-900 ml-2 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {transcript && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">You said:</h4>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <p className="text-gray-800">{transcript}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {step === "questions" && (
              <div className="bg-white p-6 border-b border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Current Question */}
            {step === "questions" && currentQuestion && (
              <div className="bg-white p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Question:</h3>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <p className="text-lg text-gray-800">{currentQuestion}</p>
                </div>
              </div>
            )}

            {/* Voice Controls */}
            <div className="p-8">
              {step === "initial" && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Speaking</h2>
                  <p className="text-gray-600 mb-8">
                    Tell us about your legal needs. For example: "I want to change my name" or "I have a property dispute"
                  </p>
                </div>
              )}

              {step === "questions" && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Answer the Question</h2>
                  <p className="text-gray-600 mb-8">
                    Speak your answer clearly. The AI will understand and ask the next question.
                  </p>
                </div>
              )}

              {step === "complete" && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Form Complete!</h2>
                  <p className="text-gray-600 mb-8">
                    All required information has been collected. Your form is ready for submission.
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Voice Button */}
              <div className="flex justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing || isSpeaking}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                    <span className="text-lg font-semibold">
                      {isProcessing ? "Processing..." : step === "initial" ? "Start Speaking" : "Answer Question"}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <MicOff className="w-6 h-6" />
                    <span className="text-lg font-semibold">Stop Recording</span>
                  </button>
                )}
              </div>

              {/* Status */}
              {isRecording && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                </div>
              )}

              {isSpeaking && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Speaking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

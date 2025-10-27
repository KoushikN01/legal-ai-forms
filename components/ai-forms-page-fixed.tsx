"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Volume2, VolumeX, CheckCircle, AlertCircle, Loader2, Brain, Globe, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function AIFormsPageFixed() {
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResult, setAiResult] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState<"initial" | "processing" | "questions" | "complete" | "review">("initial")
  const [userLanguage, setUserLanguage] = useState<string>("en")
  const [showReview, setShowReview] = useState(false)

  const recognitionRef = useRef<any>(null)
  const ttsService = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "hi-IN" // Default to Hindi
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
    setStep("processing")

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
                "Authorization": `Bearer ${localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJleHAiOjE3NjEzNzc5OTcsImlhdCI6MTc2MTI5MTU5N30.nTW3Pr_zaRF8mv9T-pkdeKp7HddYh9BU1enlFuJ3pqQ"}`
              },
              body: JSON.stringify({
                speech_text: spokenText,
                language: "auto"
              })
            })

            if (response.ok) {
              const result = await response.json()
              setAiResult(result)
              setUserLanguage(result.detected_language || "en")
              
              if (result.extracted_data) {
                setFormData(prev => ({ ...prev, ...result.extracted_data }))
              }

              if (result.missing_required_fields && result.missing_required_fields.length > 0) {
                // Use localized questions if available, otherwise use English
                const question = result.suggested_questions_localized && result.suggested_questions_localized.length > 0 
                  ? result.suggested_questions_localized[0] 
                  : result.suggested_questions[0]
                setCurrentQuestion(question)
                setStep("questions")
                speakQuestion(question, result.detected_language)
                
                // Initialize current field index and store detected language
                setAiResult(prev => ({
                  ...prev,
                  detected_language: result.detected_language,
                  current_field_index: 0,
                  current_field: result.missing_required_fields[0]
                }))
                
                // Set progress
                const totalFields = Object.keys(result.extracted_data || {}).length + result.missing_required_fields.length
                const filledFields = Object.keys(result.extracted_data || {}).length
                setProgress(Math.round((filledFields / totalFields) * 100))
              } else {
                // Form is complete
                setStep("complete")
                setProgress(100)
                setShowReview(true)
              }
            } else {
              setError("Failed to process your speech. Please try again.")
              setStep("initial")
            }
          } catch (err) {
            console.error("Error processing speech:", err)
            setError("Failed to process your speech. Please try again.")
            setStep("initial")
          } finally {
            setIsProcessing(false)
            setIsRecording(false)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setError(`Error: ${event.error}`)
          setIsRecording(false)
          setStep("initial")
        }

        recognitionRef.current.start()
      } else {
        setError("Speech recognition not supported in your browser")
        setIsRecording(false)
        setStep("initial")
      }
    } catch (err) {
      console.error("Failed to start recording:", err)
      setError("Failed to start recording")
      setIsRecording(false)
      setStep("initial")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const speakQuestion = (question: string, language: string = "en") => {
    if (isSpeaking) {
      ttsService.current?.stop()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    
    // Map language codes to TTS language codes
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
    
    const ttsLanguage = langMap[language] || "en-US"
    
    ttsService.current?.speak(question, ttsLanguage, () => {
      setIsSpeaking(false)
    })
  }

  const answerQuestion = async (answer: string) => {
    if (!aiResult) return

    setIsProcessing(true)
    try {
      // Get the current missing fields
      const missingFields = aiResult.missing_required_fields || []
      const currentFieldIndex = aiResult.current_field_index || 0
      
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
          source_language: userLanguage
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.translated_value) {
          // Add the extracted value to form data
          setFormData(prev => ({
            ...prev,
            [missingFields[currentFieldIndex]]: result.translated_value
          }))

          // Check if there are more questions
          const nextFieldIndex = currentFieldIndex + 1
          if (nextFieldIndex < missingFields.length) {
            // Ask next question in the same language as user's initial speech
            const nextField = missingFields[nextFieldIndex]
            const question = generateQuestion(nextField, userLanguage)
            setCurrentQuestion(question)
            speakQuestion(question, userLanguage)
            
            // Update AI result with current field index
            setAiResult(prev => ({
              ...prev,
              current_field_index: nextFieldIndex,
              current_field: nextField
            }))
            
            // Update progress
            const totalFields = Object.keys(formData).length + missingFields.length
            const filledFields = Object.keys(formData).length + 1
            setProgress(Math.round((filledFields / totalFields) * 100))
          } else {
            // Form is complete
            setStep("complete")
            setProgress(100)
            setShowReview(true)
          }
        } else {
          setError("Failed to extract information from your answer")
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

  const generateQuestion = (fieldName: string, language: string) => {
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
    
    const questionLang = langMap[language] || "en"
    
    const questions: { [key: string]: { [key: string]: string } } = {
      "applicant_full_name": {
        "hi": "आपका पूरा नाम क्या है?",
        "te": "మీ పూర్తి పేరు ఏమిటి?",
        "en": "What is your full name?",
        "ta": "உங்கள் முழு பெயர் என்ன?",
        "bn": "আপনার পুরো নাম কি?",
        "gu": "તમારું પૂર્ણ નામ શું છે?",
        "kn": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು?",
        "ml": "നിങ്ങളുടെ പൂർണ്ണ പേര് എന്താണ്?",
        "pa": "ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ ਕੀ ਹੈ?",
        "mr": "तुमचे पूर्ण नाव काय आहे?"
      },
      "applicant_age": {
        "hi": "आपकी उम्र क्या है?",
        "te": "మీ వయస్సు ఎంత?",
        "en": "What is your age?",
        "ta": "உங்கள் வயது என்ன?",
        "bn": "আপনার বয়স কত?",
        "gu": "તમારી ઉંમર કેટલી છે?",
        "kn": "ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?",
        "ml": "നിങ്ങളുടെ പ്രായം എത്ര?",
        "pa": "ਤੁਹਾਡੀ ਉਮਰ ਕਿੰਨੀ ਹੈ?",
        "mr": "तुमचे वय किती आहे?"
      },
      "current_address": {
        "hi": "आपका वर्तमान पता क्या है?",
        "te": "మీ ప్రస్తుత చిరునామా ఏమిటి?",
        "en": "What is your current address?",
        "ta": "உங்கள் தற்போதைய முகவரி என்ன?",
        "bn": "আপনার বর্তমান ঠিকানা কি?",
        "gu": "તમારું વર્તમાન સરનામું શું છે?",
        "kn": "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಿಳಾಸ ಏನು?",
        "ml": "നിങ്ങളുടെ നിലവിലെ വിലാസം എന്താണ്?",
        "pa": "ਤੁਹਾਡਾ ਮੌਜੂਦਾ ਪਤਾ ਕੀ ਹੈ?",
        "mr": "तुमचा सध्याचा पत्ता काय आहे?"
      },
      "previous_name": {
        "hi": "आपका पिछला नाम क्या था?",
        "te": "మీ మునుపటి పేరు ఏమిటి?",
        "en": "What was your previous name?",
        "ta": "உங்கள் முந்தைய பெயர் என்ன?",
        "bn": "আপনার আগের নাম কি ছিল?",
        "gu": "તમારું પહેલાનું નામ શું હતું?",
        "kn": "ನಿಮ್ಮ ಹಿಂದಿನ ಹೆಸರು ಏನು?",
        "ml": "നിങ്ങളുടെ മുൻ പേര് എന്തായിരുന്നു?",
        "pa": "ਤੁਹਾਡਾ ਪਿਛਲਾ ਨਾਮ ਕੀ ਸੀ?",
        "mr": "तुमचे मागील नाव काय होते?"
      },
      "new_name": {
        "hi": "आप क्या नया नाम चाहते हैं?",
        "te": "మీరు ఏమి కొత్త పేరు కావాలనుకుంటున్నారు?",
        "en": "What new name do you want?",
        "ta": "நீங்கள் என்ன புதிய பெயர் விரும்புகிறீர்கள்?",
        "bn": "আপনি কি নতুন নাম চান?",
        "gu": "તમે શું નવું નામ ઇચ્છો છો?",
        "kn": "ನೀವು ಯಾವ ಹೊಸ ಹೆಸರನ್ನು ಬಯಸುತ್ತೀರಿ?",
        "ml": "നിങ്ങൾ എന്ത് പുതിയ പേര് ആഗ്രഹിക്കുന്നു?",
        "pa": "ਤੁਸੀਂ ਕੀ ਨਵਾਂ ਨਾਮ ਚਾਹੁੰਦੇ ਹੋ?",
        "mr": "तुम्हाला काय नवीन नाव हवे आहे?"
      },
      "applicant_father_name": {
        "hi": "आपके पिता का नाम क्या है?",
        "te": "మీ తండ్రి పేరు ఏమిటి?",
        "en": "What is your father's name?",
        "ta": "உங்கள் தந்தையின் பெயர் என்ன?",
        "bn": "আপনার বাবার নাম কি?",
        "gu": "તમારા પિતાનું નામ શું છે?",
        "kn": "ನಿಮ್ಮ ತಂದೆಯ ಹೆಸರು ಏನು?",
        "ml": "നിങ്ങളുടെ പിതാവിന്റെ പേര് എന്താണ്?",
        "pa": "ਤੁਹਾਡੇ ਪਿਤਾ ਦਾ ਨਾਮ ਕੀ ਹੈ?",
        "mr": "तुमच्या वडिलांचे नाव काय आहे?"
      },
      "reason": {
        "hi": "नाम बदलने का कारण क्या है?",
        "te": "పేరు మార్చడానికి కారణం ఏమిటి?",
        "en": "What is the reason for name change?",
        "ta": "பெயர் மாற்றத்திற்கான காரணம் என்ன?",
        "bn": "নাম পরিবর্তনের কারণ কি?",
        "gu": "નામ બદલવાનું કારણ શું છે?",
        "kn": "ಹೆಸರು ಬದಲಾಯಿಸಲು ಕಾರಣ ಏನು?",
        "ml": "പേര് മാറ്റാനുള്ള കാരണം എന്താണ്?",
        "pa": "ਨਾਮ ਬਦਲਣ ਦਾ ਕਾਰਨ ਕੀ ਹੈ?",
        "mr": "नाव बदलण्याचे कारण काय आहे?"
      },
      "date_of_declaration": {
        "hi": "आज की तारीख क्या है?",
        "te": "ఈరోజు తేదీ ఏమిటి?",
        "en": "What is today's date?",
        "ta": "இன்றைய தேதி என்ன?",
        "bn": "আজকের তারিখ কি?",
        "gu": "આજની તારીખ શું છે?",
        "kn": "ಇಂದಿನ ದಿನಾಂಕ ಏನು?",
        "ml": "ഇന്നത്തെ തീയതി എന്താണ്?",
        "pa": "ਅੱਜ ਦੀ ਤਾਰੀਖ ਕੀ ਹੈ?",
        "mr": "आजची तारीख काय आहे?"
      },
      "place": {
        "hi": "आप कहाँ रहते हैं?",
        "te": "మీరు ఎక్కడ ఉన్నారు?",
        "en": "Where are you located?",
        "ta": "நீங்கள் எங்கே இருக்கிறீர்கள்?",
        "bn": "আপনি কোথায় আছেন?",
        "gu": "તમે ક્યાં છો?",
        "kn": "ನೀವು ಎಲ್ಲಿದ್ದೀರಿ?",
        "ml": "നിങ്ങൾ എവിടെയാണ്?",
        "pa": "ਤੁਸੀਂ ਕਿੱਥੇ ਹੋ?",
        "mr": "तुम्ही कुठे आहात?"
      },
      "id_proof_type": {
        "hi": "आपका पहचान पत्र कौन सा है?",
        "te": "మీ గుర్తింపు పత్రం ఏది?",
        "en": "What is your ID proof type?",
        "ta": "உங்கள் அடையாள ஆவணம் எது?",
        "bn": "আপনার পরিচয়পত্র কি?",
        "gu": "તમારું ઓળખ પત્ર શું છે?",
        "kn": "ನಿಮ್ಮ ಗುರುತಿನ ಪತ್ರ ಯಾವುದು?",
        "ml": "നിങ്ങളുടെ തിരിച്ചറിയൽ രേഖ എന്താണ്?",
        "pa": "ਤੁਹਾਡਾ ਪਛਾਣ ਪੱਤਰ ਕੀ ਹੈ?",
        "mr": "तुमचे ओळख पत्र काय आहे?"
      },
      "id_proof_number": {
        "hi": "आपके पहचान पत्र की संख्या क्या है?",
        "te": "మీ గుర్తింపు పత్రం సంఖ్య ఏమిటి?",
        "en": "What is your ID proof number?",
        "ta": "உங்கள் அடையாள ஆவண எண் என்ன?",
        "bn": "আপনার পরিচয়পত্রের নম্বর কি?",
        "gu": "તમારા ઓળખ પત્રનો નંબર શું છે?",
        "kn": "ನಿಮ್ಮ ಗುರುತಿನ ಪತ್ರದ ಸಂಖ್ಯೆ ಏನು?",
        "ml": "നിങ്ങളുടെ തിരിച്ചറിയൽ രേഖയുടെ നമ്പർ എന്താണ്?",
        "pa": "ਤੁਹਾਡੇ ਪਛਾਣ ਪੱਤਰ ਦਾ ਨੰਬਰ ਕੀ ਹੈ?",
        "mr": "तुमच्या ओळख पत्राचा नंबर काय आहे?"
      }
    }

    const fieldQuestions = questions[fieldName] || questions["applicant_full_name"]
    return fieldQuestions[questionLang] || fieldQuestions["en"]
  }

  const handleManualInput = (value: string) => {
    if (value.trim()) {
      answerQuestion(value)
    }
  }

  const submitForm = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      setError("No form data to submit")
      return
    }

    setIsProcessing(true)
    try {
      // Submit the form
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJleHAiOjE3NjEzNzc5OTcsImlhdCI6MTc2MTI5MTU5N30.nTW3Pr_zaRF8mv9T-pkdeKp7HddYh9BU1enlFuJ3pqQ"}`
        },
        body: JSON.stringify({
          form_id: aiResult?.form_type || "name_change",
          filled_data: formData,
          user_id: user?.id || user?.user_id || "ai_user_" + Date.now()
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Form submitted successfully:", result)
        alert("Form submitted successfully!")
        // Reset the form
        setStep("initial")
        setFormData({})
        setAiResult(null)
        setShowReview(false)
        setProgress(0)
      } else {
        setError("Failed to submit form")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Failed to submit form")
    } finally {
      setIsProcessing(false)
    }
  }

  const goBackToAI = () => {
    setShowReview(false)
    setStep("questions")
  }

  const goBackToInitial = () => {
    setStep("initial")
    setFormData({})
    setAiResult(null)
    setShowReview(false)
    setProgress(0)
    setCurrentQuestion("")
  }

  if (showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">AI Form Review</h1>
                    <p className="text-purple-100">Review the information AI extracted from your speech</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Extracted Information</h2>
                
                {Object.keys(formData).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(formData).map(([field, value]) => (
                      <div key={field} className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No information extracted yet</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={goBackToAI}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to AI Fill
                  </button>
                  
                  <button
                    onClick={submitForm}
                    disabled={isProcessing || Object.keys(formData).length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isProcessing ? "Submitting..." : "Submit Form"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

          {/* Language Support Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi"].map((lang) => (
              <span key={lang} className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-purple-200">
                {lang}
              </span>
            ))}
          </div>
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
                      <Globe className="w-5 h-5 text-purple-600" />
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
              </div>
            )}

            {/* Current Question */}
            {currentQuestion && step === "questions" && (
              <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  AI Question
                </h3>
                <p className="text-lg text-gray-700 mb-6">{currentQuestion}</p>
                
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => speakQuestion(currentQuestion, userLanguage)}
                    disabled={isSpeaking}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg"
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    {isSpeaking ? "Stop Speaking" : "Speak Question"}
                  </button>
                  
                  <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg"
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    {isRecording ? "Stop Recording" : "Answer by Voice"}
                  </button>
                </div>
              </div>
            )}

            {/* Main Interaction Area */}
            <div className="p-12">
              {step === "initial" && (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Tell Me What You Need
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Speak your legal request in any language. For example:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
                    <div className="bg-gray-50 rounded-xl p-4 text-left">
                      <p className="text-sm text-gray-600 mb-2">Hindi:</p>
                      <p className="text-gray-800">"मेरा नाम राम है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं"</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-left">
                      <p className="text-sm text-gray-600 mb-2">English:</p>
                      <p className="text-gray-800">"I want to file a property dispute case. My name is John Doe..."</p>
                    </div>
                  </div>

                  <button
                    onClick={startRecording}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-4 mx-auto"
                  >
                    <Mic className="w-6 h-6" />
                    Start Speaking
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="text-center">
                  <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-2xl">
                    <MicOff className="w-16 h-16 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Listening...</h2>
                  <p className="text-lg text-gray-600 mb-8">Speak clearly into your microphone</p>
                  
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-4 mx-auto"
                  >
                    <MicOff className="w-6 h-6" />
                    Stop Recording
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">AI is Processing...</h2>
                  <p className="text-lg text-gray-600 mb-8">Please wait while AI analyzes your speech</p>
                </div>
              )}

              {/* Manual Input Option */}
              {currentQuestion && step === "questions" && (
                <div className="mt-8 p-8 bg-gray-50 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Or Type Your Answer:</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
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
                      className="px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-700 text-lg">{error}</span>
                </div>
              )}

              {/* Transcript Display */}
              {transcript && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">You said:</h4>
                  <p className="text-gray-700 text-lg">{transcript}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                onClick={goBackToInitial}
                className="px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
              >
                ← Back to Forms
              </button>
              
              {formData && Object.keys(formData).length > 0 && step === "complete" && (
                <button
                  onClick={() => setShowReview(true)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-3 font-semibold shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Review & Submit Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

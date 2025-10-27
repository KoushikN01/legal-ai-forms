"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import { Scale, Shield, Zap } from "lucide-react"

type AuthMode = "login" | "signup"

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [isSliding, setIsSliding] = useState(false)

  const handleModeSwitch = (newMode: AuthMode) => {
    setIsSliding(true)
    setTimeout(() => {
      setMode(newMode)
      setIsSliding(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="hidden lg:flex flex-col justify-center text-white space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">LegalVoice</h1>
            <p className="text-xl text-blue-100">Voice-Powered Legal Forms Made Simple</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Legal Forms in Minutes</h3>
                <p className="text-blue-100">Fill complex legal forms using just your voice in any Indian language</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Translation</h3>
                <p className="text-blue-100">Speak in your language, get forms filled in English automatically</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Verified</h3>
                <p className="text-blue-100">Track your submissions and get verified legal documents</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Tab switcher */}
              <div className="flex bg-gray-100 p-2" suppressHydrationWarning>
                <button
                  onClick={() => handleModeSwitch("login")}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    mode === "login" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                  suppressHydrationWarning
                >
                  Login
                </button>
                <button
                  onClick={() => handleModeSwitch("signup")}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    mode === "signup" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                  suppressHydrationWarning
                >
                  Sign Up
                </button>
              </div>

              {/* Form container with slide animation */}
              <div className="p-8">
                <div
                  className={`transition-all duration-300 ${
                    isSliding ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
                  }`}
                >
                  {mode === "login" ? (
                    <LoginForm onSwitchToSignup={() => handleModeSwitch("signup")} />
                  ) : (
                    <SignupForm onSwitchToLogin={() => handleModeSwitch("login")} />
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-white/80 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AadharModalProps {
  onClose: () => void
}

export default function AadharModal({ onClose }: AadharModalProps) {
  const [step, setStep] = useState<"aadhar" | "otp">("aadhar")
  const [aadharId, setAadharId] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { loginWithAadhar } = useAuth()
  const router = useRouter()

  const handleAadharSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (aadharId.length !== 12) {
      setError("Aadhar ID must be 12 digits")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Call Aadhar API to send OTP
      setStep("otp")
    } catch (err) {
      setError("Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      return
    }

    setIsLoading(true)
    try {
      await loginWithAadhar(aadharId, otp)
      router.push("/")
      onClose()
    } catch (err) {
      setError("Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Aadhar Login</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === "aadhar" ? (
          <form onSubmit={handleAadharSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Enter your 12-digit Aadhar ID to receive an OTP</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Aadhar ID</label>
              <input
                type="text"
                value={aadharId}
                onChange={(e) => setAadharId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="XXXX XXXX XXXX"
                maxLength={12}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground mt-1">{aadharId.length}/12 digits</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || aadharId.length !== 12}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the 6-digit OTP sent to your registered mobile number
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg tracking-widest text-center"
              />
              <p className="text-xs text-muted-foreground mt-1">{otp.length}/6 digits</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => setStep("aadhar")}
              className="w-full text-blue-600 hover:text-blue-700 font-semibold py-2 text-sm"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

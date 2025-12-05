"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export const dynamic = 'force-dynamic'

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid or missing reset token")
    }
  }, [searchParams])

  // Check password match in real-time
  useEffect(() => {
    if (confirmPassword && newPassword) {
      setPasswordsMatch(newPassword === confirmPassword)
    } else {
      setPasswordsMatch(false)
    }
  }, [newPassword, confirmPassword])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/auth/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: token, 
          new_password: newPassword 
        }),
      })

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...")
        setTimeout(() => router.push("/auth"), 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to reset password")
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Your Password</h1>
            <p className="text-muted-foreground">Enter your new password to secure your account</p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6" suppressHydrationWarning>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 pr-12 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  minLength={6}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    confirmPassword && newPassword
                      ? passwordsMatch
                        ? "border-green-300 focus:ring-green-500"
                        : "border-red-300 focus:ring-red-500"
                      : "border-orange-200 focus:ring-orange-500"
                  }`}
                  required
                  minLength={6}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword && (
                <div className={`text-sm mt-1 ${
                  passwordsMatch ? "text-green-600" : "text-red-600"
                }`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <a 
                href="/auth" 
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign in here
              </a>
            </p>
          </div>

          <div className="mt-8 p-4 bg-orange-50 rounded-lg">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">🔒 Security Tips</h3>
            <ul className="text-xs text-orange-700 space-y-1">
              <li>• Use a strong password with letters, numbers, and symbols</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider using a password manager</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

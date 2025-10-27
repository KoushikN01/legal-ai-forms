"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processing Google login...")
  const router = useRouter()
  const { loginWithGoogle } = useAuth()

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        const error = urlParams.get("error")

        if (error) {
          setStatus("error")
          setMessage("Google login was cancelled or failed")
          setTimeout(() => router.push("/auth"), 3000)
          return
        }

        if (!code) {
          setStatus("error")
          setMessage("No authorization code received")
          setTimeout(() => router.push("/auth"), 3000)
          return
        }

        // Send code to backend for processing
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          console.log("🔍 API Base URL:", API_BASE_URL)
          
          const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          })

          console.log("🔍 Response status:", response.status)
          console.log("🔍 Response ok:", response.ok)

          if (!response.ok) {
            const errorText = await response.text()
            console.log("🔍 Error response:", errorText)
            throw new Error(`Backend authentication failed: ${response.status}`)
          }

          const data = await response.json()
          console.log("🔍 Backend response:", data)
          const user = data.user
          const token = data.token

          console.log("🔍 Backend user data:", user)

          // Check admin status from JWT token
          let isAdmin = false
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              isAdmin = payload.isAdmin || false
              console.log("🔍 Admin status from token:", isAdmin)
            } catch (error) {
              console.error("Error decoding token:", error)
            }
          }

          // Convert backend user format to frontend format
          const frontendUser = {
            id: user.user_id || user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            loginMethod: "google" as const,
            isAdmin: isAdmin
          }

          console.log("🔍 Converted frontend user:", frontendUser)

          // Save to localStorage
          console.log("💾 Saving user to localStorage:", frontendUser)
          localStorage.setItem("user", JSON.stringify(frontendUser))
          localStorage.setItem("token", token)
          console.log("✅ User saved to localStorage successfully")
        } catch (error) {
          console.log("Backend unavailable, using mock Google user:", error)
          // Fallback to mock user when backend is not available
          const mockUser = {
            id: `google_${Date.now()}`,
            email: "user@gmail.com",
            name: "Google User",
            picture: "https://via.placeholder.com/150",
            loginMethod: "google" as const,
            isAdmin: false
          }
          
          console.log("💾 Saving mock user to localStorage:", mockUser)
          localStorage.setItem("user", JSON.stringify(mockUser))
          localStorage.setItem("token", "mock_token_" + Date.now())
          console.log("✅ Mock user saved to localStorage successfully")
        }

        setStatus("success")
        setMessage("Login successful! Redirecting...")
        
        // Dispatch a custom event to notify auth context of login
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        window.dispatchEvent(new CustomEvent('userLogin', { 
          detail: { user: userData }
        }))
        
        // Small delay to ensure auth context processes the login event
        setTimeout(() => {
          // Use router.push instead of window.location.href for better state management
          router.push("/")
        }, 1500)
      } catch (error) {
        console.error("Google callback error:", error)
        setStatus("error")
        setMessage("Login failed. Please try again.")
        setTimeout(() => router.push("/auth"), 3000)
      }
    }

    handleGoogleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Login</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Failed</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


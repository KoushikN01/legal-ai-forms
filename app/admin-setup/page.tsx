"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const setupAdmin = async () => {
    if (!user) {
      setMessage("Please log in first")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage("No authentication token found")
        return
      }

      const response = await fetch("http://localhost:8000/admin/setup", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Update token in localStorage
        localStorage.setItem('token', data.token)
        setMessage("✅ Admin privileges granted! You can now access the admin dashboard.")
        
        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      } else {
        setMessage(`❌ Error: ${data.detail || 'Failed to grant admin privileges'}`)
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In First</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to set up admin privileges.</p>
          <button
            onClick={() => router.push("/auth")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Grant admin privileges to your account</p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
            <p className="text-sm text-blue-800">
              <strong>Name:</strong> {user.name}<br/>
              <strong>Email:</strong> {user.email}
            </p>
          </div>

          <button
            onClick={setupAdmin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Grant Admin Privileges"}
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes("✅") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

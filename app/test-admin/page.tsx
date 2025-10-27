"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function TestAdminPage() {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testAdminEndpoint = async () => {
    setLoading(true)
    setTestResult("")

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTestResult("❌ No token found")
        return
      }

      // Test admin submissions endpoint
      const response = await fetch("http://localhost:8000/admin/submissions", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Admin endpoint working! Found ${data.count} submissions`)
      } else if (response.status === 401) {
        setTestResult("❌ 401 Unauthorized - Need admin privileges")
      } else if (response.status === 403) {
        setTestResult("❌ 403 Forbidden - Admin privileges required")
      } else {
        setTestResult(`❌ Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testTokenDecode = () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTestResult("❌ No token found")
        return
      }

      const payload = JSON.parse(atob(token.split('.')[1]))
      setTestResult(`✅ Token decoded successfully:
- User ID: ${payload.user_id}
- Email: ${payload.email}
- Admin: ${payload.isAdmin}
- Expires: ${new Date(payload.exp * 1000).toLocaleString()}`)
    } catch (error) {
      setTestResult(`❌ Error decoding token: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Test Page</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User Info</h2>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {user?.name || "Not logged in"}</p>
                <p><strong>Email:</strong> {user?.email || "Not logged in"}</p>
                <p><strong>Admin:</strong> {user?.isAdmin ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Login Method:</strong> {user?.loginMethod || "Not logged in"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={testTokenDecode}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
              >
                Decode JWT Token
              </button>

              <button
                onClick={testAdminEndpoint}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Testing..." : "Test Admin Endpoint"}
              </button>

              <button
                onClick={() => window.location.href = "/admin-setup"}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition"
              >
                Go to Admin Setup
              </button>

              <button
                onClick={() => window.location.href = "/admin"}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition"
              >
                Go to Admin Dashboard
              </button>
            </div>

            {testResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Test Result:</h3>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

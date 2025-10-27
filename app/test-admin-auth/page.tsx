"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export default function TestAdminAuthPage() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testToken = () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        addResult("❌ No token found in localStorage")
        return
      }

      addResult("✅ Token found in localStorage")
      
      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]))
      addResult(`✅ Token decoded successfully:`)
      addResult(`   - User ID: ${payload.user_id}`)
      addResult(`   - Email: ${payload.email}`)
      addResult(`   - Admin: ${payload.isAdmin}`)
      addResult(`   - Expires: ${new Date(payload.exp * 1000).toLocaleString()}`)
      
      if (payload.isAdmin) {
        addResult("✅ User has admin privileges in token")
      } else {
        addResult("❌ User does NOT have admin privileges in token")
      }
    } catch (error) {
      addResult(`❌ Error decoding token: ${error}`)
    }
  }

  const testAdminEndpoint = async () => {
    setLoading(true)
    addResult("🔄 Testing admin endpoint...")
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        addResult("❌ No token found")
        return
      }

      const response = await fetch("http://localhost:8000/admin/submissions", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      addResult(`📡 Response status: ${response.status}`)
      addResult(`📡 Response ok: ${response.ok}`)

      if (response.ok) {
        const data = await response.json()
        addResult(`✅ Admin endpoint working! Found ${data.count} submissions`)
        addResult(`📊 Submissions data: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        addResult(`❌ Error response: ${errorText}`)
        
        if (response.status === 401) {
          addResult("❌ 401 Unauthorized - Token invalid or expired")
        } else if (response.status === 403) {
          addResult("❌ 403 Forbidden - Admin privileges required")
        }
      }
    } catch (error) {
      addResult(`❌ Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdminSetup = async () => {
    setLoading(true)
    addResult("🔄 Testing admin setup endpoint...")
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        addResult("❌ No token found")
        return
      }

      const response = await fetch("http://localhost:8000/admin/setup", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      addResult(`📡 Setup response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addResult(`✅ Admin setup successful!`)
        addResult(`📊 Setup data: ${JSON.stringify(data, null, 2)}`)
        
        // Update token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token)
          addResult("✅ Token updated in localStorage")
        }
      } else {
        const errorText = await response.text()
        addResult(`❌ Setup error: ${errorText}`)
      }
    } catch (error) {
      addResult(`❌ Setup network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testBackendHealth = async () => {
    setLoading(true)
    addResult("🔄 Testing backend health...")
    
    try {
      const response = await fetch("http://localhost:8000/health")
      
      if (response.ok) {
        const data = await response.json()
        addResult(`✅ Backend is healthy: ${JSON.stringify(data)}`)
      } else {
        addResult(`❌ Backend health check failed: ${response.status}`)
      }
    } catch (error) {
      addResult(`❌ Backend not reachable: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Authentication Test</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User Info</h2>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {user?.name || "Not logged in"}</p>
                <p><strong>Email:</strong> {user?.email || "Not logged in"}</p>
                <p><strong>Admin:</strong> {user?.isAdmin ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Login Method:</strong> {user?.loginMethod || "Not logged in"}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = "/admin-setup"}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  Go to Admin Setup
                </button>
                <button
                  onClick={() => window.location.href = "/admin"}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition text-sm"
                >
                  Go to Admin Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={testBackendHealth}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Test Backend Health
              </button>
              
              <button
                onClick={testToken}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Decode JWT Token
              </button>
              
              <button
                onClick={testAdminSetup}
                disabled={loading}
                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                Test Admin Setup
              </button>
              
              <button
                onClick={testAdminEndpoint}
                disabled={loading}
                className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                Test Admin Endpoint
              </button>
              
              <button
                onClick={clearResults}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
              >
                Clear Results
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Test Results:</h3>
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-800 font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

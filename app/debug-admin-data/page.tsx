"use client"

import { useState, useEffect } from "react"

export default function DebugAdminDataPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const analyzeLocalStorage = () => {
    setLoading(true)
    const info: any = {
      localStorageKeys: [],
      userSubmissions: [],
      userTickets: [],
      userFeedbacks: [],
      userChatMessages: [],
      currentUser: null,
      registeredUsers: []
    }

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        info.localStorageKeys.push(key)
        
        // Analyze different types of data
        if (key.startsWith("userSubmissions_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "[]")
            info.userSubmissions.push({
              key,
              userId: key.replace("userSubmissions_", ""),
              count: data.length,
              submissions: data
            })
          } catch (error) {
            console.error(`Error parsing ${key}:`, error)
          }
        }
        
        if (key.startsWith("userTickets_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "[]")
            info.userTickets.push({
              key,
              userId: key.replace("userTickets_", ""),
              count: data.length,
              tickets: data
            })
          } catch (error) {
            console.error(`Error parsing ${key}:`, error)
          }
        }
        
        if (key.startsWith("userFeedbacks_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "[]")
            info.userFeedbacks.push({
              key,
              userId: key.replace("userFeedbacks_", ""),
              count: data.length,
              feedbacks: data
            })
          } catch (error) {
            console.error(`Error parsing ${key}:`, error)
          }
        }
        
        if (key.startsWith("userChatMessages_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "[]")
            info.userChatMessages.push({
              key,
              userId: key.replace("userChatMessages_", ""),
              count: data.length,
              messages: data
            })
          } catch (error) {
            console.error(`Error parsing ${key}:`, error)
          }
        }
        
        if (key === "user") {
          try {
            info.currentUser = JSON.parse(localStorage.getItem(key) || "{}")
          } catch (error) {
            console.error(`Error parsing user:`, error)
          }
        }
        
        if (key === "registeredUsers") {
          try {
            info.registeredUsers = JSON.parse(localStorage.getItem(key) || "[]")
          } catch (error) {
            console.error(`Error parsing registeredUsers:`, error)
          }
        }
      }
    }

    setDebugInfo(info)
    setLoading(false)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all localStorage data?")) {
      localStorage.clear()
      setDebugInfo({})
      alert("All data cleared!")
    }
  }

  const createTestData = () => {
    // Create test submission data
    const testSubmission = {
      tracking_id: "TRK20250123-TEST123",
      form_id: "name_change",
      form_data: {
        applicant_full_name: "John Doe",
        applicant_age: 30,
        new_name: "John Smith"
      },
      status: "submitted",
      created_at: new Date().toISOString()
    }

    // Save to localStorage
    const userId = "test_user_123"
    localStorage.setItem(`userSubmissions_${userId}`, JSON.stringify([testSubmission]))
    
    // Create test user
    const testUser = {
      id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
      isAdmin: false
    }
    localStorage.setItem("user", JSON.stringify(testUser))
    
    alert("Test data created! Refresh the page to see it.")
    analyzeLocalStorage()
  }

  useEffect(() => {
    analyzeLocalStorage()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Data Debug</h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={analyzeLocalStorage}
              disabled={loading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze localStorage"}
            </button>
            <button
              onClick={createTestData}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Create Test Data
            </button>
            <button
              onClick={clearAllData}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
            >
              Clear All Data
            </button>
            <button
              onClick={() => window.location.href = "/admin"}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
            >
              Go to Admin Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current User */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Current User</h3>
              <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                {JSON.stringify(debugInfo.currentUser, null, 2)}
              </pre>
            </div>

            {/* Registered Users */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Registered Users ({debugInfo.registeredUsers?.length || 0})</h3>
              <pre className="text-sm text-green-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {JSON.stringify(debugInfo.registeredUsers, null, 2)}
              </pre>
            </div>

            {/* User Submissions */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">User Submissions ({debugInfo.userSubmissions?.length || 0})</h3>
              {debugInfo.userSubmissions?.map((item, index) => (
                <div key={index} className="mb-3 p-2 bg-white rounded border">
                  <p className="text-sm font-semibold">User: {item.userId}</p>
                  <p className="text-sm">Count: {item.count}</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {JSON.stringify(item.submissions, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            {/* User Tickets */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">User Tickets ({debugInfo.userTickets?.length || 0})</h3>
              {debugInfo.userTickets?.map((item, index) => (
                <div key={index} className="mb-3 p-2 bg-white rounded border">
                  <p className="text-sm font-semibold">User: {item.userId}</p>
                  <p className="text-sm">Count: {item.count}</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {JSON.stringify(item.tickets, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            {/* User Feedbacks */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">User Feedbacks ({debugInfo.userFeedbacks?.length || 0})</h3>
              {debugInfo.userFeedbacks?.map((item, index) => (
                <div key={index} className="mb-3 p-2 bg-white rounded border">
                  <p className="text-sm font-semibold">User: {item.userId}</p>
                  <p className="text-sm">Count: {item.count}</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {JSON.stringify(item.feedbacks, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-pink-900 mb-3">Chat Messages ({debugInfo.userChatMessages?.length || 0})</h3>
              {debugInfo.userChatMessages?.map((item, index) => (
                <div key={index} className="mb-3 p-2 bg-white rounded border">
                  <p className="text-sm font-semibold">User: {item.userId}</p>
                  <p className="text-sm">Count: {item.count}</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {JSON.stringify(item.messages, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* All localStorage Keys */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">All localStorage Keys ({debugInfo.localStorageKeys?.length || 0})</h3>
            <div className="flex flex-wrap gap-2">
              {debugInfo.localStorageKeys?.map((key, index) => (
                <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
                  {key}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

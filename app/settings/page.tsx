"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Globe, Bell, User, Moon, Sun, Save, ArrowLeft } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in by checking localStorage token
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
      return
    }
    loadUserSettings()
  }, [router])

  const loadUserSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const settings = data.settings || {}
        setLanguage(settings.language || "en")
        setNotifications(settings.notifications !== false)
        setDarkMode(settings.dark_mode === true)
        setEmailNotifications(settings.email_notifications !== false)
        setSmsNotifications(settings.sms_notifications === true)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      // Fallback to localStorage
      const savedLanguage = localStorage.getItem("language") || "en"
      const savedNotifications = localStorage.getItem("notifications") !== "false"
      const savedDarkMode = localStorage.getItem("darkMode") === "true"
      setLanguage(savedLanguage)
      setNotifications(savedNotifications)
      setDarkMode(savedDarkMode)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/user/settings`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language,
          notifications,
          dark_mode: darkMode,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications
        })
      })
      
      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || "Failed to save settings"}`)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/user/settings`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language: newLanguage,
          notifications,
          dark_mode: darkMode,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications
        })
      })
      
      if (response.ok) {
        console.log("Language setting saved successfully")
        // Don't reload the page, just update the state
      } else {
        console.error("Failed to save language setting")
      }
    } catch (error) {
      console.error("Error saving language setting:", error)
    }
  }

  const handleNotificationsToggle = () => {
    const newValue = !notifications
    setNotifications(newValue)
    localStorage.setItem("notifications", String(newValue))
    saveSettings()
  }

  const handleDarkModeToggle = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem("darkMode", String(newValue))
    document.documentElement.classList.toggle("dark", newValue)
    saveSettings()
  }

  const handleEmailNotificationsToggle = () => {
    const newValue = !emailNotifications
    setEmailNotifications(newValue)
    saveSettings()
  }

  const handleSmsNotificationsToggle = () => {
    const newValue = !smsNotifications
    setSmsNotifications(newValue)
    saveSettings()
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/forms")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Forms
            </button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-8">Settings</h1>

          <div className="space-y-6">
            {/* Language Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Language</h2>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">General Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive general app notifications</p>
                  </div>
                  <button
                    onClick={handleNotificationsToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notifications ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={handleEmailNotificationsToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      emailNotifications ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        emailNotifications ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">SMS Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <button
                    onClick={handleSmsNotificationsToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      smsNotifications ? "bg-orange-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        smsNotifications ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Dark Mode */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    {darkMode ? (
                      <Moon className="w-6 h-6 text-purple-600" />
                    ) : (
                      <Sun className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Dark Mode</h2>
                    <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                  </div>
                </div>
                <button
                  onClick={handleDarkModeToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    darkMode ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      darkMode ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Save className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Save Settings</h2>
                  <p className="text-sm text-muted-foreground">Save all your preferences</p>
                </div>
              </div>
              <button
                onClick={saveSettings}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save All Settings"}
              </button>
            </div>

            {/* Account */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Account</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

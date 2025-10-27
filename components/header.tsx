"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { User, MessageSquare, HelpCircle, Shield, Settings } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()
  const [userPhoto, setUserPhoto] = useState<string>("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll)
      
      // Cleanup function to remove event listener
      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Load user profile photo
  useEffect(() => {
    const loadUserPhoto = async () => {
      if (!user) return
      
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const photo = data.profile?.photo || data.photo || ""
          setUserPhoto(photo)
        }
      } catch (error) {
        console.error("Error loading user photo:", error)
      }
    }

    loadUserPhoto()
  }, [user])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100"
          : "bg-gradient-to-b from-blue-50 to-white border-b border-blue-100"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href={user?.isAdmin ? "/admin" : "/"}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <span className="text-white font-bold text-xl">⚖️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LegalVoice
            </h1>
            <p className="text-xs text-blue-600 font-medium">
              {user?.isAdmin ? "Admin Dashboard" : "Voice-Powered Legal Forms"}
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {user.isAdmin ? (
                <>
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-red-600 transition font-medium flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/chat"
                    className="text-sm text-gray-600 hover:text-red-600 transition font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    User Chats
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/forms" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
                    Forms
                  </Link>
                  <Link href="/ai-forms" className="text-sm text-gray-600 hover:text-purple-600 transition font-medium flex items-center gap-1">
                    <span className="text-purple-600">🤖</span>
                    AI Forms
                  </Link>
                  <Link
                    href="/chat"
                    className="text-sm text-gray-600 hover:text-blue-600 transition font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Link>
                  <Link
                    href="/help"
                    className="text-sm text-gray-600 hover:text-blue-600 transition font-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm text-gray-600 hover:text-blue-600 transition font-medium flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
                How It Works
              </a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
                Contact
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href={user.isAdmin ? "/admin" : "/profile"}
                className="hidden sm:flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
              >
                <div
                  className={`w-8 h-8 ${user.isAdmin ? "bg-red-100" : "bg-blue-100"} rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm`}
                >
                  {userPhoto ? (
                    <img 
                      src={userPhoto} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = user.isAdmin 
                            ? '<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
                            : '<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>'
                        }
                      }}
                    />
                  ) : user.isAdmin ? (
                    <Shield className="w-4 h-4 text-red-600" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {user.name} {user.isAdmin && <span className="text-xs text-red-600 font-bold">ADMIN</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:shadow-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

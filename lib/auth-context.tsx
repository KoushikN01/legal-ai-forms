"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { AbortSignal } from "abort-controller"
import { jwtService } from "./jwt-service"

interface User {
  id: string
  email: string
  name: string
  phone?: string
  aadharId?: string
  loginMethod: "google" | "aadhar" | "email"
  isAdmin?: boolean
  createdAt?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithAadhar: (aadharId: string, otp: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
const ADMIN_PASSWORD = "Rahul@123"

// Helper function to get real JWT token from backend
async function getRealJWTToken(userData: any): Promise<string | null> {
  try {
    // Try to login with the user's credentials to get a real JWT token
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password || "default_password" // Use a default password for development
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.token
    }
    
    // If signin fails, try to create a new user and get token
    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: "default_password",
        name: userData.name,
        phone: userData.phone || ""
      })
    })
    
    if (signupResponse.ok) {
      const data = await signupResponse.json()
      return data.token
    }
    
    return null
  } catch (error) {
    console.error("Error getting real JWT token:", error)
    return null
  }
}

// Helper function to refresh token
async function refreshToken(userData: any): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.token
    }
    
    return null
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")
      
      console.log("[Auth] Checking auth on page load:", { storedUser: !!storedUser, storedToken: !!storedToken })
      
      // For development, prioritize user data over token validation
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          
          // Check if token is valid for API calls
          if (storedToken) {
            // Check if it's a development token that needs to be replaced
            if (storedToken.startsWith('admin_token_') || storedToken.startsWith('mock_token_')) {
              console.log("[Auth] Development token detected, attempting to get real JWT token")
              // Try to get a real JWT token from the backend
              getRealJWTToken(userData).then((realToken) => {
                if (realToken) {
                  localStorage.setItem("token", realToken)
                  console.log("✅ Real JWT token obtained and stored")
                }
                setUser(userData)
              }).catch(() => {
                console.log("[Auth] Could not get real JWT token, using development token")
                setUser(userData)
              })
              return
            }
            
            // For real JWT tokens, validate them
            try {
              const payload = JSON.parse(atob(storedToken.split('.')[1]))
              if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                console.log("[Auth] Token expired, attempting to refresh")
                // Token is expired, try to refresh
                refreshToken(userData).then((newToken) => {
                  if (newToken) {
                    localStorage.setItem("token", newToken)
                    console.log("✅ Token refreshed")
                  }
                  setUser(userData)
                }).catch(() => {
                  console.log("[Auth] Could not refresh token")
                  setUser(userData)
                })
                return
              }
            } catch (tokenError) {
              console.log("[Auth] Token parsing failed, using user data:", tokenError)
            }
          }
          
          setUser(userData)
          console.log("✅ User authenticated from localStorage:", userData)
          return
        } catch (error) {
          console.error("Error parsing stored user:", error)
          // Clear invalid data
          localStorage.removeItem("user")
          localStorage.removeItem("token")
        }
      }
      
      // If no user data, check token validity
      if (storedToken && jwtService.isStoredTokenValid()) {
        const userInfo = jwtService.getUserFromToken(storedToken)
        if (userInfo && storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            console.log("✅ User authenticated from token:", userData)
          } catch (error) {
            console.error("Error parsing stored user:", error)
            // Clear invalid data
            localStorage.removeItem("user")
            localStorage.removeItem("token")
          }
        }
      } else if (storedToken && !jwtService.isStoredTokenValid()) {
        // Token expired, but keep user data for development
        console.log("⚠️ Token expired, but keeping user data for development")
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            console.log("✅ User authenticated despite expired token:", userData)
          } catch (error) {
            console.error("Error parsing stored user:", error)
            localStorage.removeItem("user")
            localStorage.removeItem("token")
          }
        }
      }
    }
    
    // Check on mount
    checkAuth()
    setIsLoading(false) // Set loading to false after auth check
    
    // Listen for custom login events
    const handleUserLogin = (event: CustomEvent) => {
      console.log("🔔 User login event received:", event.detail)
      // Immediately set the user from the event
      if (event.detail && event.detail.user) {
        setUser(event.detail.user)
        console.log("✅ User set from login event:", event.detail.user)
      }
      // Also check auth to ensure consistency
      checkAuth()
    }
    
    window.addEventListener('userLogin', handleUserLogin as EventListener)
    
    return () => {
      window.removeEventListener('userLogin', handleUserLogin as EventListener)
    }
  }, [])

  // Function to recover user data from backup
const recoverUserData = (userData: User) => {
  try {
    // Import the migration service
    import('./data-migration').then(({ DataMigrationService }) => {
      // Try to recover using email-based backup
      const recovered = DataMigrationService.recoverUserDataByEmail(userData.email, userData.id)
      
      if (recovered) {
        console.log("[Auth] User data recovered from email backup")
        return
      }
      
      // Try to find existing data by email
      const existingData = DataMigrationService.findUserDataByEmail(userData.email)
      if (existingData) {
        console.log("[Auth] Found existing data for email, migrating...")
        DataMigrationService.migrateUserData(existingData.userId, userData.id)
        console.log("[Auth] User data migrated successfully")
      }
    }).catch(error => {
      console.error("[Auth] Error importing migration service:", error)
    })
  } catch (error) {
    console.error("[Auth] Error recovering user data:", error)
  }
}

const saveUserToRegistry = (userData: User) => {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const existingUserIndex = registeredUsers.findIndex((u: User) => u.email === userData.email)

    if (existingUserIndex >= 0) {
      // Update existing user's last login
      registeredUsers[existingUserIndex] = {
        ...registeredUsers[existingUserIndex],
        ...userData,
        lastLogin: new Date().toISOString(),
      }
    } else {
      // Add new user
      registeredUsers.push({
        ...userData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      })
    }

    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Always try backend authentication first
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Invalid credentials")
      }

      const data = await response.json()
      console.log("Backend response:", data) // Debug log
      
      // Check if user has admin privileges from token
      let isAdmin = false
      if (data.token) {
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]))
          isAdmin = payload.isAdmin || false
        } catch (error) {
          console.error("Error decoding token:", error)
        }
      }
      
      // Handle both response formats (with and without nested user object)
      const userInfo = data.user || data
      const userData: User = {
        id: userInfo.user_id || userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        phone: userInfo.phone,
        loginMethod: "email",
        isAdmin: isAdmin,
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", data.token)
      jwtService.storeToken(data.token)
      saveUserToRegistry(userData)
      
      // Try to recover user data from backup
      recoverUserData(userData)
    } catch (error) {
      // No fallback to mock login - require proper authentication
      console.error("Authentication failed:", error)
      throw new Error("Invalid email or password. Please check your credentials or sign up for a new account.")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, phone: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone }),
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      const data = await response.json()
      console.log("Signup response:", data) // Debug log
      
      // Handle both response formats (with and without nested user object)
      const userInfo = data.user || data
      const userData: User = {
        id: userInfo.user_id || userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        phone: userInfo.phone,
        loginMethod: "email",
        isAdmin: false, // Regular users cannot be admin
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", data.token)
      jwtService.storeToken(data.token)
      saveUserToRegistry(userData)
    } catch (error) {
      console.log("[v0] Backend unavailable, using mock signup")
      const mockUser: User = {
        id: "user_" + Date.now(),
        email,
        name,
        phone,
        loginMethod: "email",
        isAdmin: false, // Regular users cannot be admin
      }
      setUser(mockUser)
      const mockToken = `mock_token_${Date.now()}`
      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("token", mockToken)
      jwtService.storeToken(mockToken)
      saveUserToRegistry(mockUser)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // Get Google Client ID from environment or use default
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "304400970425-mu9caic4ceku6augatr3ubsuf81bfduk.apps.googleusercontent.com"
      
      console.log("🔍 Debug - Google Client ID:", clientId)
      console.log("🔍 Debug - Environment variables:", {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      })

      // Always use real Google OAuth flow
      console.log("🔍 Using Google OAuth with Client ID:", clientId)

      // Real Google OAuth implementation
      const redirectUri = `${window.location.origin}/auth/google/callback`
      const scope = "email profile"
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
      
      console.log("🔍 Debug - Redirect URI:", redirectUri)
      console.log("🔍 Debug - Auth URL:", authUrl)

      window.location.href = authUrl
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithAadhar = async (aadharId: string, otp: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/aadhar-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhar_number: aadharId, otp }),
      })

      if (!response.ok) {
        throw new Error("Invalid OTP")
      }

      const data = await response.json()
      const userData: User = {
        id: "user_" + Date.now(),
        email: `aadhar_${aadharId}@user.com`,
        name: "Aadhar User",
        aadharId,
        loginMethod: "aadhar",
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", data.token)
      jwtService.storeToken(data.token)
      saveUserToRegistry(userData)
      
      // Try to recover user data from backup
      recoverUserData(userData)
    } catch (error) {
      console.log("[v0] Backend unavailable, using mock Aadhar login")
      const mockUser: User = {
        id: "user_" + Date.now(),
        email: `aadhar_${aadharId}@user.com`,
        name: "Aadhar User",
        aadharId,
        loginMethod: "aadhar",
      }
      setUser(mockUser)
      const mockToken = `mock_token_${Date.now()}`
      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("token", mockToken)
      jwtService.storeToken(mockToken)
      saveUserToRegistry(mockUser)
      
      // Try to recover user data from backup
      recoverUserData(mockUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Get current user before clearing
    const currentUser = user
    
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    jwtService.removeStoredToken()
    
    // Use migration service to handle data backup and cleanup
    if (currentUser?.id && currentUser?.email) {
      import('./data-migration').then(({ DataMigrationService }) => {
        // Create backup using email as key
        DataMigrationService.createBackup(currentUser.id, currentUser.email)
        
        // Clean up user-specific data
        DataMigrationService.cleanupUserData(currentUser.id)
        
        console.log("[Auth] User data backed up and cleaned up successfully")
      }).catch(error => {
        console.error("[Auth] Error during logout data handling:", error)
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, loginWithAadhar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

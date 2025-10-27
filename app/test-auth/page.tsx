"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function TestAuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, signup, user, logout } = useAuth()

  const handleLogin = async () => {
    setIsLoading(true)
    setResult("")
    try {
      await login(email, password)
      setResult("Login successful!")
    } catch (error) {
      setResult(`Login failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    setIsLoading(true)
    setResult("")
    try {
      await signup(email, password, name, phone)
      setResult("Signup successful!")
    } catch (error) {
      setResult(`Signup failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setResult("Logged out successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h1 className="text-2xl font-bold text-center mb-8">Authentication Test</h1>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">Logged In</h3>
                <p className="text-green-700">Email: {user.email}</p>
                <p className="text-green-700">Name: {user.name}</p>
                <p className="text-green-700">ID: {user.id}</p>
                <p className="text-green-700">Login Method: {user.loginMethod}</p>
                {user.isAdmin && <p className="text-green-700 font-semibold">Admin User</p>}
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Login Form */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Login</h2>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </div>

              {/* Signup Form */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Signup</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSignup}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? "Signing up..." : "Signup"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-sm">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


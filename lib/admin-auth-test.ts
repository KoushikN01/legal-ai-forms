// Admin Authentication Test
// Tests admin authentication flow and token validation

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
const ADMIN_PASSWORD = "Rahul@123"

export class AdminAuthTest {
  static async testBackendConnection() {
    try {
      console.log("[AdminAuthTest] Testing backend connection...")
      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()
      console.log("[AdminAuthTest] Backend health check:", data)
      return response.ok
    } catch (error) {
      console.log("[AdminAuthTest] Backend connection failed:", error)
      return false
    }
  }

  static async testAdminLogin() {
    try {
      console.log("[AdminAuthTest] Testing admin login...")
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      })
      
      console.log("[AdminAuthTest] Login response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("[AdminAuthTest] Login successful:", data)
        return { success: true, token: data.token, user: data.user }
      } else {
        const errorText = await response.text()
        console.log("[AdminAuthTest] Login failed:", errorText)
        return { success: false, error: errorText }
      }
    } catch (error) {
      console.log("[AdminAuthTest] Login error:", error)
      return { success: false, error: error.message }
    }
  }

  static async testAdminToken(token: string) {
    try {
      console.log("[AdminAuthTest] Testing admin token...")
      const response = await fetch(`${API_BASE_URL}/admin/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log("[AdminAuthTest] Admin request status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("[AdminAuthTest] Admin request successful:", data)
        return { success: true, data }
      } else {
        const errorText = await response.text()
        console.log("[AdminAuthTest] Admin request failed:", errorText)
        return { success: false, error: errorText }
      }
    } catch (error) {
      console.log("[AdminAuthTest] Admin request error:", error)
      return { success: false, error: error.message }
    }
  }

  static async runFullTest() {
    console.log("[AdminAuthTest] Starting full admin authentication test...")
    
    // Test 1: Backend connection
    const backendOk = await this.testBackendConnection()
    if (!backendOk) {
      console.log("[AdminAuthTest] Backend not available, skipping tests")
      return { success: false, error: "Backend not available" }
    }
    
    // Test 2: Admin login
    const loginResult = await this.testAdminLogin()
    if (!loginResult.success) {
      console.log("[AdminAuthTest] Admin login failed")
      return loginResult
    }
    
    // Test 3: Admin token validation
    if (loginResult.token) {
      const tokenResult = await this.testAdminToken(loginResult.token)
      return { ...tokenResult, token: loginResult.token, user: loginResult.user }
    }
    
    return { success: false, error: "No token received" }
  }
}

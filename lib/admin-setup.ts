// Admin Setup Utility
// Helps set up admin user and authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
const ADMIN_PASSWORD = "Rahul@123"

export class AdminSetup {
  static async createAdminUser() {
    try {
      console.log("[AdminSetup] Creating admin user...")
      
      // First try to signup the admin user
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          name: "Admin",
          phone: "0000000000"
        }),
      })
      
      if (signupResponse.ok) {
        console.log("[AdminSetup] Admin user created successfully")
        return { success: true, message: "Admin user created" }
      } else {
        const errorText = await signupResponse.text()
        console.log("[AdminSetup] Signup failed:", errorText)
        
        // If user already exists, that's okay
        if (signupResponse.status === 400 && errorText.includes("already exists")) {
          console.log("[AdminSetup] Admin user already exists")
          return { success: true, message: "Admin user already exists" }
        }
        
        return { success: false, error: errorText }
      }
    } catch (error) {
      console.log("[AdminSetup] Error creating admin user:", error)
      return { success: false, error: error.message }
    }
  }

  static async setupAdminPrivileges() {
    try {
      console.log("[AdminSetup] Setting up admin privileges...")
      
      // First login to get a token
      const loginResponse = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      })
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text()
        console.log("[AdminSetup] Login failed:", errorText)
        return { success: false, error: errorText }
      }
      
      const loginData = await loginResponse.json()
      const token = loginData.token
      
      if (!token) {
        console.log("[AdminSetup] No token received")
        return { success: false, error: "No token received" }
      }
      
      // Now try to setup admin privileges
      const setupResponse = await fetch(`${API_BASE_URL}/admin/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({}),
      })
      
      if (setupResponse.ok) {
        const setupData = await setupResponse.json()
        console.log("[AdminSetup] Admin privileges setup successful:", setupData)
        return { success: true, token: setupData.token || token, data: setupData }
      } else {
        const errorText = await setupResponse.text()
        console.log("[AdminSetup] Admin setup failed:", errorText)
        return { success: false, error: errorText }
      }
    } catch (error) {
      console.log("[AdminSetup] Error setting up admin privileges:", error)
      return { success: false, error: error.message }
    }
  }

  static async runFullSetup() {
    console.log("[AdminSetup] Running full admin setup...")
    
    // Step 1: Create admin user
    const userResult = await this.createAdminUser()
    if (!userResult.success) {
      console.log("[AdminSetup] Failed to create admin user")
      return userResult
    }
    
    // Step 2: Setup admin privileges
    const privilegesResult = await this.setupAdminPrivileges()
    if (!privilegesResult.success) {
      console.log("[AdminSetup] Failed to setup admin privileges")
      return privilegesResult
    }
    
    console.log("[AdminSetup] Full admin setup completed successfully")
    return { success: true, token: privilegesResult.token, message: "Admin setup completed" }
  }
}

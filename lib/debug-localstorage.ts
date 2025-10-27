// Debug utility to check localStorage contents
export class LocalStorageDebugger {
  static generateUniqueId(prefix: string = 'item'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  static logAllData() {
    console.log("=== LOCALSTORAGE DEBUG ===")
    
    // Check for chat messages
    const globalChat = localStorage.getItem('chatMessages')
    console.log("Global chat messages:", globalChat ? JSON.parse(globalChat).length : 0)
    
    // Check for help tickets
    const globalTickets = localStorage.getItem('helpTickets')
    console.log("Global help tickets:", globalTickets ? JSON.parse(globalTickets).length : 0)
    
    // Check for feedbacks
    const globalFeedbacks = localStorage.getItem('userFeedbacks')
    console.log("Global feedbacks:", globalFeedbacks ? JSON.parse(globalFeedbacks).length : 0)
    
    // Check user-specific data
    let userChatCount = 0
    let userTicketCount = 0
    let userFeedbackCount = 0
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        if (key.startsWith('userChatMessages_')) {
          const data = localStorage.getItem(key)
          if (data) {
            userChatCount += JSON.parse(data).length
          }
        }
        if (key.startsWith('userTickets_')) {
          const data = localStorage.getItem(key)
          if (data) {
            userTicketCount += JSON.parse(data).length
          }
        }
        if (key.startsWith('userFeedbacks_')) {
          const data = localStorage.getItem(key)
          if (data) {
            userFeedbackCount += JSON.parse(data).length
          }
        }
      }
    }
    
    console.log("User-specific chat messages:", userChatCount)
    console.log("User-specific tickets:", userTicketCount)
    console.log("User-specific feedbacks:", userFeedbackCount)
    
    // List all keys
    console.log("All localStorage keys:")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        console.log(`- ${key}`)
      }
    }
    
    console.log("=== END DEBUG ===")
  }
  
  static createTestData() {
    // Create some test chat messages with unique IDs
    const testMessages = [
      {
        id: this.generateUniqueId('test_msg'),
        sender: "user",
        userId: "test_user_1",
        userName: "Test User",
        userEmail: "test@example.com",
        text: "Hello admin, I need help with my form submission",
        timestamp: new Date().toISOString()
      },
      {
        id: this.generateUniqueId('test_msg'), 
        sender: "user",
        userId: "test_user_2",
        userName: "Another User",
        userEmail: "another@example.com",
        text: "Can you please review my application?",
        timestamp: new Date().toISOString()
      }
    ]
    
    localStorage.setItem('chatMessages', JSON.stringify(testMessages))
    
    // Create some test help tickets with unique IDs
    const testTickets = [
      {
        id: this.generateUniqueId('test_ticket'),
        userId: "test_user_1",
        userName: "Test User",
        userEmail: "test@example.com",
        subject: "Form submission issue",
        description: "I'm having trouble submitting my form",
        priority: "high",
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    localStorage.setItem('helpTickets', JSON.stringify(testTickets))
    
    // Also create user-specific data to test aggregation
    localStorage.setItem('userChatMessages_test_user_1', JSON.stringify([
      {
        id: this.generateUniqueId('user_msg'),
        sender: "user",
        userId: "test_user_1",
        userName: "Test User",
        userEmail: "test@example.com",
        text: "This is a user-specific message",
        timestamp: new Date().toISOString()
      }
    ]))
    
    localStorage.setItem('userTickets_test_user_1', JSON.stringify([
      {
        id: this.generateUniqueId('user_ticket'),
        userId: "test_user_1",
        userName: "Test User",
        userEmail: "test@example.com",
        subject: "User-specific ticket",
        description: "This is a user-specific help ticket",
        priority: "medium",
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]))
    
    console.log("Test data created!")
  }
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { FileText, Download, X } from "lucide-react"
import AdminNavigation from "@/components/admin-navigation"
import { LocalStorageDebugger } from "@/lib/debug-localstorage"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedChatUser, setSelectedChatUser] = useState(null)
  const [replyMessage, setReplyMessage] = useState("")
  // End of added state
  const [statusUpdate, setStatusUpdate] = useState("")
  const [newStatus, setNewStatus] = useState("submitted")
  const [activeTab, setActiveTab] = useState<"submissions" | "tickets" | "messages" | "users" | "feedbacks" | "data-management">("submissions")
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState(null)
  const [filterFormId, setFilterFormId] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [chatFilterUser, setChatFilterUser] = useState("")
  const [chatFilterDateFrom, setChatFilterDateFrom] = useState("")
  const [chatFilterDateTo, setChatFilterDateTo] = useState("")
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [isCreatingTestData, setIsCreatingTestData] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Auto-refresh data every 10 seconds for better real-time experience
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log("[Admin] Auto-refreshing data...")
      setIsRefreshing(true)
      fetchData().finally(() => setIsRefreshing(false))
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    // Check authentication on page load
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      console.log("[Admin] Auth check - Token:", token ? 'Present' : 'Missing')
      console.log("[Admin] Auth check - Stored user:", storedUser ? 'Present' : 'Missing')
      console.log("[Admin] Auth check - Context user:", user ? 'Present' : 'Missing')
      
      // If no token, redirect to auth
      if (!token) {
        console.log("[Admin] No token found, redirecting to auth")
        router.push("/auth")
        return false
      }
      
      // If no user context but have stored user, use stored user
      let currentUser = user
      if (!currentUser && storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
          console.log("[Admin] Using stored user:", currentUser)
        } catch (error) {
          console.error("[Admin] Error parsing stored user:", error)
        }
      }
      
      // If still no user, redirect to auth
      if (!currentUser) {
        console.log("[Admin] No user found, redirecting to auth")
        router.push("/auth")
        return false
      }
      
      // Check admin privileges
      let hasAdminAccess = false
      
      // Check if user.isAdmin is true
      if (currentUser.isAdmin === true) {
        hasAdminAccess = true
        console.log("[Admin] User has admin access via user.isAdmin")
      }
      
      // Check if token has admin privileges
      if (token && !hasAdminAccess) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log("[Admin] Token payload:", payload)
          if (payload.isAdmin === true) {
            hasAdminAccess = true
            console.log("[Admin] User has admin access via token")
            // Update user object with admin status
            const updatedUser = { ...currentUser, isAdmin: true }
            localStorage.setItem('user', JSON.stringify(updatedUser))
          }
        } catch (error) {
          console.error("Error decoding token:", error)
        }
      }
      
      // Check if user email is admin email (fallback)
      if (!hasAdminAccess && currentUser.email === "rahul5g4g3g@gmail.com") {
        hasAdminAccess = true
        console.log("[Admin] User has admin access via email")
        const updatedUser = { ...currentUser, isAdmin: true }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      // If no admin access, show warning but don't redirect immediately
      if (!hasAdminAccess) {
        console.log("[Admin] No admin access found, but allowing access")
        // Don't redirect immediately, let user see the interface
        // They can still access data management features
      }
      
      return true
    }
    
    // Run auth check
    if (checkAuth()) {
      setIsAuthChecking(false)
      fetchData()
    } else {
      setIsAuthChecking(false)
    }
  }, [user, router])

  const fetchData = async () => {
    try {
      console.log("[Admin] Fetching fresh data...")
      
      // Clear only admin cache, preserve user data
      console.log("[Admin] Clearing admin cache data...")
      localStorage.removeItem("adminSubmissions")
      localStorage.removeItem("helpTickets") 
      localStorage.removeItem("chatMessages")
      localStorage.removeItem("registeredUsers")
      
      // First, test admin authentication
      try {
        const { AdminAuthTest } = await import('@/lib/admin-auth-test')
        const authTest = await AdminAuthTest.runFullTest()
        console.log("[Admin] Authentication test result:", authTest)
        
        if (!authTest.success) {
          console.log("[Admin] Authentication test failed, using fallback data")
          throw new Error("Authentication test failed")
        }
      } catch (authError) {
        console.log("[Admin] Authentication test error:", authError)
      }
      
      // Try to fetch from backend using the new API client
      try {
        const { AdminApiClient } = await import('@/lib/admin-api-client')
        
        const [submissionsRes, ticketsRes, messagesRes, usersRes, feedbacksRes] = await Promise.allSettled([
          AdminApiClient.getSubmissions(),
          AdminApiClient.getTickets(),
          AdminApiClient.getMessages(),
          AdminApiClient.getUsers(),
          AdminApiClient.getFeedbacks()
        ])

        let loadedSubmissions = []
        let loadedTickets = []
        let loadedMessages = []
        let loadedUsers = []
        let loadedFeedbacks = []

        // Handle submissions
        if (submissionsRes.status === "fulfilled") {
          const data = submissionsRes.value
          loadedSubmissions = data.submissions || []
          console.log("[Admin] Loaded submissions from backend:", loadedSubmissions.length)
        } else {
          console.log("[Admin] Backend submissions failed, aggregating from all users...")
          loadedSubmissions = await aggregateAllUserSubmissions()
        }

        // Handle tickets
        if (ticketsRes.status === "fulfilled") {
          const data = ticketsRes.value
          loadedTickets = data.tickets || []
          console.log("[Admin] Backend tickets:", loadedTickets.length)
          console.log("[Admin] Sample ticket:", loadedTickets[0])
          
          // If backend returns empty, try to get from localStorage
          if (loadedTickets.length === 0) {
            console.log("[Admin] Backend tickets empty, aggregating from localStorage...")
            loadedTickets = await aggregateAllHelpTickets()
          }
        } else {
          console.log("[Admin] Backend tickets failed, aggregating from localStorage...")
          loadedTickets = await aggregateAllHelpTickets()
        }

        // Handle messages
        if (messagesRes.status === "fulfilled") {
          const data = messagesRes.value
          loadedMessages = data.messages || []
          console.log("[Admin] Backend messages:", loadedMessages.length)
          console.log("[Admin] Sample message:", loadedMessages[0])
          
          // If backend returns empty, try to get from localStorage
          if (loadedMessages.length === 0) {
            console.log("[Admin] Backend messages empty, aggregating from localStorage...")
            loadedMessages = await aggregateAllChatMessages()
          }
        } else {
          console.log("[Admin] Backend messages failed, aggregating from localStorage...")
          loadedMessages = await aggregateAllChatMessages()
        }

        // Handle users
        if (usersRes.status === "fulfilled") {
          const data = usersRes.value
          loadedUsers = data.users || []
        } else {
          console.log("[Admin] Aggregating all users...")
          loadedUsers = await aggregateAllUsers()
        }

        // Handle feedbacks
        if (feedbacksRes.status === "fulfilled") {
          const data = feedbacksRes.value
          loadedFeedbacks = data.feedbacks || []
          console.log("[Admin] Backend feedbacks:", loadedFeedbacks.length)
          console.log("[Admin] Sample feedback:", loadedFeedbacks[0])
          
          // If backend returns empty, try to get from localStorage
          if (loadedFeedbacks.length === 0) {
            console.log("[Admin] Backend feedbacks empty, checking localStorage...")
            const localFeedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]')
            if (localFeedbacks.length > 0) {
              loadedFeedbacks = localFeedbacks
              console.log("[Admin] Using localStorage feedbacks:", loadedFeedbacks.length)
            }
          }
        } else {
          console.log("[Admin] Backend feedbacks failed, aggregating from localStorage...")
          loadedFeedbacks = await aggregateAllFeedbacks()
        }

        // Transform data to match frontend expectations
        const transformedTickets = loadedTickets.map(ticket => ({
          ...ticket,
          id: ticket._id || ticket.id || ticket.ticket_id,
          createdAt: ticket.created_at || ticket.createdAt,
          updatedAt: ticket.updated_at || ticket.updatedAt,
          userName: ticket.user_name || ticket.userName,
          userEmail: ticket.user_email || ticket.userEmail
        }))
        
        const transformedMessages = loadedMessages.map(message => ({
          ...message,
          id: message._id || message.id || message.message_id,
          userId: message.user_id || message.userId,
          userName: message.user_name || message.userName,
          userEmail: message.user_email || message.userEmail
        }))
        
        const transformedFeedbacks = loadedFeedbacks.map(feedback => ({
          ...feedback,
          id: feedback._id || feedback.id || feedback.feedback_id,
          type: feedback.feedback_type || feedback.type,
          createdAt: feedback.created_at || feedback.createdAt,
          updatedAt: feedback.updated_at || feedback.updatedAt,
          userName: feedback.user_name || feedback.userName,
          userEmail: feedback.user_email || feedback.userEmail
        }))

        setSubmissions(loadedSubmissions)
        setTickets(transformedTickets)
        setMessages(transformedMessages)
        setUsers(loadedUsers)
        setFeedbacks(transformedFeedbacks)
        
        // Debug the loaded data
        console.log("[Admin] Final loaded data:")
        console.log("- Submissions:", loadedSubmissions.length)
        console.log("- Tickets:", transformedTickets.length, transformedTickets)
        console.log("- Messages:", transformedMessages.length, transformedMessages)
        console.log("- Feedbacks:", transformedFeedbacks.length, transformedFeedbacks)
        console.log("- Users:", loadedUsers.length)

        // Save fresh data to localStorage
        localStorage.setItem("adminSubmissions", JSON.stringify(loadedSubmissions))
        localStorage.setItem("helpTickets", JSON.stringify(transformedTickets))
        localStorage.setItem("chatMessages", JSON.stringify(transformedMessages))
        localStorage.setItem("registeredUsers", JSON.stringify(loadedUsers))
        localStorage.setItem("userFeedbacks", JSON.stringify(transformedFeedbacks))

        console.log("[Admin] Fresh data loaded:", {
          submissions: loadedSubmissions.length,
          tickets: transformedTickets.length,
          messages: transformedMessages.length,
          users: loadedUsers.length,
          feedbacks: transformedFeedbacks.length
        })
        
        // Update last refresh time
        setLastRefresh(new Date())

      } catch (backendError) {
        console.log("[Admin] Backend unavailable, aggregating fresh data from localStorage")
        
        // Aggregate fresh data from all users
        const freshSubmissions = await aggregateAllUserSubmissions()
        const freshTickets = await createFreshHelpTickets()
        const freshMessages = await createFreshChatMessages()
        const freshUsers = await aggregateAllUsers()
        const freshFeedbacks = await aggregateAllFeedbacks()

        setSubmissions(freshSubmissions)
        setTickets(freshTickets)
        setMessages(freshMessages)
        setUsers(freshUsers)
        setFeedbacks(freshFeedbacks)

        // Save fresh data
        localStorage.setItem("adminSubmissions", JSON.stringify(freshSubmissions))
        localStorage.setItem("helpTickets", JSON.stringify(freshTickets))
        localStorage.setItem("chatMessages", JSON.stringify(freshMessages))
        localStorage.setItem("registeredUsers", JSON.stringify(freshUsers))
        localStorage.setItem("userFeedbacks", JSON.stringify(freshFeedbacks))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to aggregate all user submissions
  const aggregateAllUserSubmissions = async () => {
    console.log("[Admin] Aggregating submissions from all users...")
    const allSubmissions = []
    
    // Get all localStorage keys that start with "userSubmissions_"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userSubmissions_")) {
        try {
          const userSubmissions = JSON.parse(localStorage.getItem(key) || "[]")
          console.log(`[Admin] Found ${userSubmissions.length} submissions for user ${key}`)
          
          // Extract user ID from the key
          const userId = key.replace("userSubmissions_", "")
          
          // Get user information
          const user = JSON.parse(localStorage.getItem("user") || "{}")
          const userEmail = user.email || "unknown@example.com"
          const userName = user.name || "Unknown User"
          
          // Enhance each submission with user and form information
          const enhancedSubmissions = userSubmissions.map(submission => ({
            ...submission,
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            form_title: getFormTitle(submission.form_id),
            created_at: submission.created_at || submission.submitted_at || new Date().toISOString()
          }))
          
          allSubmissions.push(...enhancedSubmissions)
        } catch (error) {
          console.error(`[Admin] Error parsing submissions for ${key}:`, error)
        }
      }
    }
    
    console.log(`[Admin] Total aggregated submissions: ${allSubmissions.length}`)
    return allSubmissions
  }

  // Helper function to aggregate all chat messages
  const aggregateAllChatMessages = async () => {
    console.log("[Admin] Aggregating chat messages from all users...")
    const allMessages = []
    const messageIds = new Set() // Track unique message IDs
    
    // First, get global chat messages (these are the ones sent to admin)
    const globalMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]')
    console.log(`[Admin] Found ${globalMessages.length} global messages:`, globalMessages)
    
    // Add global messages with deduplication
    globalMessages.forEach(msg => {
      if (!messageIds.has(msg.id)) {
        messageIds.add(msg.id)
        allMessages.push(msg)
      }
    })
    
    // Also get user-specific messages
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userChatMessages_")) {
        try {
          const userMessages = JSON.parse(localStorage.getItem(key) || "[]")
          console.log(`[Admin] Found ${userMessages.length} messages for user ${key}:`, userMessages)
          
          // Add user messages with deduplication
          userMessages.forEach(msg => {
            if (!messageIds.has(msg.id)) {
              messageIds.add(msg.id)
              allMessages.push(msg)
            }
          })
        } catch (error) {
          console.error(`[Admin] Error parsing messages for ${key}:`, error)
        }
      }
    }
    
    console.log(`[Admin] Total aggregated messages (deduplicated): ${allMessages.length}`)
    console.log("[Admin] All messages:", allMessages)
    return allMessages
  }

  // Helper function to aggregate all help tickets
  const aggregateAllHelpTickets = async () => {
    console.log("[Admin] Aggregating help tickets from all users...")
    const allTickets = []
    const ticketIds = new Set() // Track unique ticket IDs
    
    // First, get global help tickets (these are the ones sent to admin)
    const globalTickets = JSON.parse(localStorage.getItem('helpTickets') || '[]')
    console.log(`[Admin] Found ${globalTickets.length} global tickets:`, globalTickets)
    
    // Add global tickets with deduplication
    globalTickets.forEach(ticket => {
      if (!ticketIds.has(ticket.id)) {
        ticketIds.add(ticket.id)
        allTickets.push(ticket)
      }
    })
    
    // Also get user-specific tickets
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userTickets_")) {
        try {
          const userTickets = JSON.parse(localStorage.getItem(key) || "[]")
          console.log(`[Admin] Found ${userTickets.length} tickets for user ${key}:`, userTickets)
          
          // Add user tickets with deduplication
          userTickets.forEach(ticket => {
            if (!ticketIds.has(ticket.id)) {
              ticketIds.add(ticket.id)
              allTickets.push(ticket)
            }
          })
        } catch (error) {
          console.error(`[Admin] Error parsing tickets for ${key}:`, error)
        }
      }
    }
    
    console.log(`[Admin] Total aggregated tickets (deduplicated): ${allTickets.length}`)
    console.log("[Admin] All tickets:", allTickets)
    return allTickets
  }

  // Helper function to aggregate all feedbacks
  const aggregateAllFeedbacks = async () => {
    console.log("[Admin] Aggregating feedbacks from all users...")
    const allFeedbacks = []
    
    // Get all localStorage keys that start with "userFeedbacks_"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userFeedbacks_")) {
        try {
          const userFeedbacks = JSON.parse(localStorage.getItem(key) || "[]")
          console.log(`[Admin] Found ${userFeedbacks.length} feedbacks for user ${key}`)
          allFeedbacks.push(...userFeedbacks)
        } catch (error) {
          console.error(`[Admin] Error parsing feedbacks for ${key}:`, error)
        }
      }
    }
    
    // Also check global feedbacks
    const globalFeedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]')
    allFeedbacks.push(...globalFeedbacks)
    
    console.log(`[Admin] Total aggregated feedbacks: ${allFeedbacks.length}`)
    return allFeedbacks
  }

  // Helper function to get form title from form ID
  const getFormTitle = (formId) => {
    const formTitles = {
      'name_change': 'Name Change Affidavit',
      'property_dispute_simple': 'Property Dispute Plaint',
      'traffic_fine_appeal': 'Traffic Fine Appeal',
      'mutual_divorce_petition': 'Mutual Divorce Petition',
      'affidavit_general': 'General Affidavit',
      'name_change_gazette': 'Name Change Gazette Application'
    }
    return formTitles[formId] || (formId ? formId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Form')
  }

  // Helper function to create fresh help tickets
  const createFreshHelpTickets = async () => {
    console.log("[Admin] Creating fresh help tickets...")
    
    // First, try to get real tickets from localStorage
    const realTickets = []
    
    // Get all user tickets from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userTickets_")) {
        try {
          const userTickets = JSON.parse(localStorage.getItem(key) || "[]")
          console.log(`[Admin] Found ${userTickets.length} tickets from user ${key}`)
          
          // Get user information for this key
          const userId = key.replace("userTickets_", "")
          const user = JSON.parse(localStorage.getItem("user") || "{}")
          
          // Enhance tickets with user information
          const enhancedTickets = userTickets.map(ticket => ({
            ...ticket,
            user_id: userId,
            user_name: ticket.userName || ticket.user_name || user.name || "Unknown User",
            user_email: ticket.userEmail || ticket.user_email || user.email || "unknown@example.com"
          }))
          
          realTickets.push(...enhancedTickets)
        } catch (error) {
          console.error(`[Admin] Error parsing tickets for ${key}:`, error)
        }
      }
    }
    
    // If we have real tickets, use them
    if (realTickets.length > 0) {
      console.log(`[Admin] Using ${realTickets.length} real help tickets`)
      return realTickets
    }
    
    // Otherwise, create some demo tickets with current user info
    const currentUser = localStorage.getItem("user")
    let demoUser = {
      id: "demo_user",
      name: "Demo User",
      email: "demo@example.com"
    }
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        demoUser = {
          id: user.id,
          name: user.name,
          email: user.email
        }
      } catch (error) {
        console.error("[Admin] Error parsing current user:", error)
      }
    }
    
    const tickets = [
      {
        id: "ticket_001",
        userId: demoUser.id,
        userName: demoUser.name,
        userEmail: demoUser.email,
        subject: "Form submission issue",
        description: "I'm having trouble submitting my form. It keeps showing an error.",
        status: "open",
        priority: "medium",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    console.log(`[Admin] Created ${tickets.length} demo help tickets`)
    return tickets
  }

  // Helper function to create fresh chat messages
  const createFreshChatMessages = async () => {
    console.log("[Admin] Creating fresh chat messages...")
    
    // First, try to get real messages from localStorage
    const realMessages = []
    
    // Get all user chat messages from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userChatMessages_")) {
        try {
          const userMessages = JSON.parse(localStorage.getItem(key) || "[]")
          console.log(`[Admin] Found ${userMessages.length} messages from user ${key}`)
          realMessages.push(...userMessages)
        } catch (error) {
          console.error(`[Admin] Error parsing messages for ${key}:`, error)
        }
      }
    }
    
    // If we have real messages, use them
    if (realMessages.length > 0) {
      console.log(`[Admin] Using ${realMessages.length} real chat messages`)
      return realMessages
    }
    
    // Otherwise, create some demo messages with current user info
    const currentUser = localStorage.getItem("user")
    let demoUser = {
      id: "demo_user",
      name: "Demo User",
      email: "demo@example.com"
    }
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        demoUser = {
          id: user.id,
          name: user.name,
          email: user.email
        }
      } catch (error) {
        console.error("[Admin] Error parsing current user:", error)
      }
    }
    
    const messages = [
      {
        id: "msg_001",
        sender: "user",
        userId: demoUser.id,
        userName: demoUser.name,
        userEmail: demoUser.email,
        text: "Hello, I need help with my form submission",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg_002",
        sender: "admin",
        userId: demoUser.id,
        userName: "Admin",
        userEmail: "admin@example.com",
        text: "Hello! I can help you with that. What specific issue are you facing?",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg_003",
        sender: "user",
        userId: demoUser.id,
        userName: demoUser.name,
        userEmail: demoUser.email,
        text: "My form status is still showing as 'processing' for 3 days now",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }
    ]
    
    console.log(`[Admin] Created ${messages.length} demo chat messages`)
    return messages
  }

  // Helper function to aggregate all users
  const aggregateAllUsers = async () => {
    console.log("[Admin] Aggregating all users...")
    const allUsers = []
    const userMap = new Map() // To avoid duplicates
    
    // Get current user from localStorage
    const currentUser = localStorage.getItem("user")
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          loginMethod: user.loginMethod,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isAdmin: user.isAdmin || false
        }
        userMap.set(user.id, userData)
        allUsers.push(userData)
      } catch (error) {
        console.error("[Admin] Error parsing current user:", error)
      }
    }
    
    // Get users from chat messages (real users who have sent messages)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userChatMessages_")) {
        try {
          const userMessages = JSON.parse(localStorage.getItem(key) || "[]")
          if (userMessages.length > 0) {
            const firstMessage = userMessages[0]
            const userId = firstMessage.userId
            const userName = firstMessage.userName
            const userEmail = firstMessage.userEmail
            
            // Only add if not already added
            if (!userMap.has(userId)) {
              const userData = {
                id: userId,
                name: userName,
                email: userEmail,
                phone: "",
                loginMethod: "email",
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                lastLogin: new Date().toISOString(),
                isAdmin: false
              }
              userMap.set(userId, userData)
              allUsers.push(userData)
            }
          }
        } catch (error) {
          console.error(`[Admin] Error parsing user from ${key}:`, error)
        }
      }
    }
    
    // If no real users found, add current user as demo
    if (allUsers.length === 0 && currentUser) {
      try {
        const user = JSON.parse(currentUser)
        allUsers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          loginMethod: user.loginMethod,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isAdmin: user.isAdmin || false
        })
      } catch (error) {
        console.error("[Admin] Error parsing current user:", error)
      }
    }
    
    console.log(`[Admin] Aggregated ${allUsers.length} real users`)
    return allUsers
  }


  // Add refresh function
  const refreshData = () => {
    setLoading(true)
    fetchData()
  }

  // Send message function
  const sendMessage = async () => {
    if (!replyMessage.trim() || !selectedChatUser) return

    try {
      // Send message to backend database
      const response = await fetch('http://localhost:8000/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sender: "admin",
          text: replyMessage,
          user_id: selectedChatUser.id
        })
      })

      if (response.ok) {
        console.log("[Admin] Message sent to backend successfully")
        const result = await response.json()
        console.log("[Admin] Backend response:", result)
        
        const newMessage = {
          id: Date.now().toString(),
          sender: "admin",
          userId: selectedChatUser.id,
          userName: "Admin",
          userEmail: "admin@example.com",
          text: replyMessage,
          timestamp: new Date().toISOString(),
        }

        const updatedMessages = [...messages, newMessage]
        setMessages(updatedMessages)
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
        setReplyMessage("")
      } else {
        console.error("Failed to send message to database:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        // Fallback to localStorage
        const newMessage = {
          id: Date.now().toString(),
          sender: "admin",
          userId: selectedChatUser.id,
          userName: "Admin",
          userEmail: "admin@example.com",
          text: replyMessage,
          timestamp: new Date().toISOString(),
        }

        const updatedMessages = [...messages, newMessage]
        setMessages(updatedMessages)
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
        setReplyMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Fallback to localStorage
      const newMessage = {
        id: Date.now().toString(),
        sender: "admin",
        userId: selectedChatUser.id,
        userName: "Admin",
        userEmail: "admin@example.com",
        text: replyMessage,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, newMessage]
      setMessages(updatedMessages)
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
      setReplyMessage("")
    }
  }

  useEffect(() => {
    if (selectedSubmission) {
      const docs = JSON.parse(localStorage.getItem(`documents_${selectedSubmission.tracking_id}`) || "[]")
      setDocuments(docs)
      setNewStatus(selectedSubmission.status)
    }
  }, [selectedSubmission])

  const handleStatusUpdate = async (trackingId: string, status: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      try {
        const { AdminApiClient } = await import('@/lib/admin-api-client')
        
        const updated = await AdminApiClient.updateSubmissionStatus(trackingId, status, statusUpdate)
        const updatedSubmissions = submissions.map((s) => (s.tracking_id === trackingId ? updated : s))
        setSubmissions(updatedSubmissions)
        localStorage.setItem("adminSubmissions", JSON.stringify(updatedSubmissions))
        setStatusUpdate("")
        setSelectedSubmission(null)
        alert("Status updated successfully!")
        
        // Notify user about status update
        notifyUserStatusUpdate(trackingId, status, statusUpdate)
        return
      } catch (apiError) {
        console.log("[Admin] Backend unavailable, updating status locally")
      }

      // Update locally with proper user information
      const updatedSubmissions = submissions.map((s) => {
        if (s.tracking_id === trackingId) {
          const updated = { 
            ...s, 
            status, 
            updated_at: new Date().toISOString(), 
            admin_message: statusUpdate,
            // Ensure user information is preserved
            user_email: s.user_email || s.user_name || 'Unknown User',
            user_name: s.user_name || s.user_email || 'Unknown User',
            form_id: s.form_id || 'Unknown Form'
          }
          return updated
        }
        return s
      })

      setSubmissions(updatedSubmissions)
      localStorage.setItem("adminSubmissions", JSON.stringify(updatedSubmissions))
      setStatusUpdate("")
      setSelectedSubmission(null)
      alert("Status updated successfully (offline mode)!")
      
      // Notify user about status update
      notifyUserStatusUpdate(trackingId, status, statusUpdate)
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status. Please try again.")
    }
  }

  const notifyUserStatusUpdate = (trackingId: string, status: string, message: string) => {
    // Import and use StatusUpdater to notify users
    import("@/lib/status-updater").then(({ default: StatusUpdater }) => {
      StatusUpdater.notifyStatusUpdate(trackingId, status, message)
    })
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }
    if (selectedSubmission) {
      setStatusUpdate(rejectionReason) // Set the rejection reason as the status message
      handleStatusUpdate(selectedSubmission.tracking_id, "rejected")
      setShowRejectModal(false)
      setRejectionReason("")
    }
  }

  const handleViewDetails = (submission) => {
    setSelectedSubmissionDetails(submission)
    setShowDetailsModal(true)
  }

  const handleDownloadPDF = async (trackingId) => {
    try {
      console.log("[Admin] Attempting PDF download for tracking ID:", trackingId)
      
      // Try backend first
      try {
        const { AdminApiClient } = await import('@/lib/admin-api-client')
        await AdminApiClient.downloadSubmissionPDF(trackingId)
        console.log("[Admin] PDF downloaded successfully from backend")
        alert("PDF downloaded successfully!")
        return
      } catch (backendError) {
        console.error("[Admin] Backend PDF download failed:", backendError)
        console.log("[Admin] Attempting fallback PDF generation...")
      }
      
      // Fallback: Generate PDF using frontend PDF generator
      const submission = submissions.find(s => s.tracking_id === trackingId)
      if (!submission) {
        throw new Error("Submission not found")
      }
      
      console.log("[Admin] Using fallback PDF generation for submission:", submission)
      
      // Import and use frontend PDF generator
      const { PDFGenerator } = await import('@/lib/pdf-generator')
      
      // Get form data from submission
      const formData = submission.form_data || submission.data || {}
      console.log("[Admin] Form data for PDF generation:", formData)
      
      // Generate PDF using the same method as user submissions
      const pdf = await PDFGenerator.generateStyledPDF(
        submission.form_id || 'general_affidavit',
        formData,
        trackingId
      )
      
      // Download the PDF
      PDFGenerator.downloadPDF(pdf, `${trackingId}.pdf`)
      console.log("[Admin] Fallback PDF generated and downloaded successfully")
      alert("PDF generated and downloaded successfully!")
      
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert(`Failed to download PDF: ${error.message}`)
    }
  }

  const handleDeleteSubmission = async (trackingId) => {
    if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return
    }

    try {
      const { AdminApiClient } = await import('@/lib/admin-api-client')
      await AdminApiClient.deleteSubmission(trackingId)
      
      // Remove from local state
      const updatedSubmissions = submissions.filter(s => s.tracking_id !== trackingId)
      setSubmissions(updatedSubmissions)
      localStorage.setItem("adminSubmissions", JSON.stringify(updatedSubmissions))
      
      alert("Submission deleted successfully!")
    } catch (error) {
      console.error("Error deleting submission:", error)
      alert("Failed to delete submission. Please try again.")
    }
  }

  const handleFilterChange = async () => {
    try {
      const { AdminApiClient } = await import('@/lib/admin-api-client')
      const filteredData = await AdminApiClient.getSubmissions(filterFormId, filterStatus)
      
      if (filteredData && filteredData.submissions) {
        let filteredSubmissions = filteredData.submissions
        
        // Apply date filters
        if (filterDateFrom) {
          filteredSubmissions = filteredSubmissions.filter(s => 
            new Date(s.created_at) >= new Date(filterDateFrom)
          )
        }
        if (filterDateTo) {
          filteredSubmissions = filteredSubmissions.filter(s => 
            new Date(s.created_at) <= new Date(filterDateTo)
          )
        }
        
        setSubmissions(filteredSubmissions)
        localStorage.setItem("adminSubmissions", JSON.stringify(filteredSubmissions))
      }
    } catch (error) {
      console.error("Error filtering submissions:", error)
      alert("Failed to filter submissions. Please try again.")
    }
  }

  const clearFilters = () => {
    setFilterFormId("")
    setFilterStatus("")
    setFilterDateFrom("")
    setFilterDateTo("")
    fetchData() // Reload all data
  }

  const handleReplyToTicket = async (ticketId: string, reply: string, userEmail?: string, userName?: string, subject?: string) => {
    try {
      const { AdminApiClient } = await import('@/lib/admin-api-client')
      await AdminApiClient.replyToTicket(ticketId, reply, userEmail, userName, subject)
      alert("Reply sent successfully! User will receive an email notification.")
    } catch (error) {
      console.error("Error replying to ticket:", error)
      alert("Failed to send reply. Please try again.")
    }
  }

  const handleReplyToFeedback = async (feedbackId: string, reply: string, userEmail?: string, userName?: string, feedbackType?: string) => {
    try {
      const { AdminApiClient } = await import('@/lib/admin-api-client')
      await AdminApiClient.replyToFeedback(feedbackId, reply, userEmail, userName, feedbackType)
      alert("Reply sent successfully! User will receive an email notification.")
    } catch (error) {
      console.error("Error replying to feedback:", error)
      alert("Failed to send reply. Please try again.")
    }
  }

  const applyChatFilters = () => {
    // Filter chat users based on criteria
    const filteredUsers = getChatUsers().filter(user => {
      const matchesUser = !chatFilterUser || 
        user.name?.toLowerCase().includes(chatFilterUser.toLowerCase()) ||
        user.email?.toLowerCase().includes(chatFilterUser.toLowerCase())
      
      const matchesDate = !chatFilterDateFrom || !chatFilterDateTo ||
        (new Date(user.lastMessageTime) >= new Date(chatFilterDateFrom) &&
         new Date(user.lastMessageTime) <= new Date(chatFilterDateTo))
      
      return matchesUser && matchesDate
    })
    
    // Update the displayed users (this would need to be implemented with state)
    console.log("Filtered chat users:", filteredUsers)
  }

  const clearChatFilters = () => {
    setChatFilterUser("")
    setChatFilterDateFrom("")
    setChatFilterDateTo("")
    // Reload all chat data
    fetchData()
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }

    console.log(`[Admin] Deleting message: ${messageId}`)

    try {
      // Delete from database
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`[Admin] Delete response status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log(`[Admin] Delete result:`, result)
        
        // Remove from local state
        const updatedMessages = messages.filter(m => m.id !== messageId)
        setMessages(updatedMessages)
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
        
        // Also remove from any user-specific chat data
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("userChatMessages_")) {
            const userMessages = JSON.parse(localStorage.getItem(key) || '[]')
            const filteredUserMessages = userMessages.filter((msg: any) => msg.id !== messageId)
            localStorage.setItem(key, JSON.stringify(filteredUserMessages))
          }
        }
        
        alert("Message deleted successfully!")
      } else {
        const errorText = await response.text()
        console.error("Failed to delete message from database:", response.status, errorText)
        
        // Fallback: remove from local state only
        const updatedMessages = messages.filter(m => m.id !== messageId)
        setMessages(updatedMessages)
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
        
        // Also remove from user-specific data
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("userChatMessages_")) {
            const userMessages = JSON.parse(localStorage.getItem(key) || '[]')
            const filteredUserMessages = userMessages.filter((msg: any) => msg.id !== messageId)
            localStorage.setItem(key, JSON.stringify(filteredUserMessages))
          }
        }
        
        alert("Message deleted locally (database deletion failed)")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      
      // Fallback: remove from local state only
      const updatedMessages = messages.filter(m => m.id !== messageId)
      setMessages(updatedMessages)
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
      
      // Also remove from user-specific data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userChatMessages_")) {
          const userMessages = JSON.parse(localStorage.getItem(key) || '[]')
          const filteredUserMessages = userMessages.filter((msg: any) => msg.id !== messageId)
          localStorage.setItem(key, JSON.stringify(filteredUserMessages))
        }
      }
      
      alert("Message deleted locally (database connection failed)")
    }
  }

  const handleDeleteConversation = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this entire conversation? This action cannot be undone.")) {
      return
    }

    console.log(`[Admin] Deleting conversation for user: ${userId}`)

    try {
      // Get all messages for this user
      const userMessages = getUserMessages(userId)
      console.log(`[Admin] Found ${userMessages.length} messages to delete`)
      
      // Delete each message from database
      const deletePromises = userMessages.map(async (message) => {
        try {
          const response = await fetch(`/api/chat/messages/${message.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
          console.log(`[Admin] Delete message ${message.id}: ${response.status}`)
          return response.ok
        } catch (error) {
          console.error(`[Admin] Error deleting message ${message.id}:`, error)
          return false
        }
      })

      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r).length
      console.log(`[Admin] Deleted ${successCount}/${userMessages.length} messages from database`)

      // Remove all messages for this user from local state
      const updatedMessages = messages.filter(m => m.userId !== userId)
      setMessages(updatedMessages)
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
      
      // Also remove from user-specific chat data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userChatMessages_")) {
          const userMessages = JSON.parse(localStorage.getItem(key) || '[]')
          const filteredUserMessages = userMessages.filter((msg: any) => msg.userId !== userId)
          localStorage.setItem(key, JSON.stringify(filteredUserMessages))
        }
      }
      
      // Clear selected user
      setSelectedChatUser(null)
      
      alert(`Conversation deleted successfully! ${successCount}/${userMessages.length} messages deleted from database.`)
    } catch (error) {
      console.error("Error deleting conversation:", error)
      
      // Fallback: remove from local state only
      const updatedMessages = messages.filter(m => m.userId !== userId)
      setMessages(updatedMessages)
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
      
      // Also remove from user-specific data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userChatMessages_")) {
          const userMessages = JSON.parse(localStorage.getItem(key) || '[]')
          const filteredUserMessages = userMessages.filter((msg: any) => msg.userId !== userId)
          localStorage.setItem(key, JSON.stringify(filteredUserMessages))
        }
      }
      
      setSelectedChatUser(null)
      alert("Conversation deleted locally (database deletion failed)")
    }
  }

  const handleBulkDeleteChats = async () => {
    if (!confirm("Are you sure you want to delete ALL chat messages? This action cannot be undone.")) {
      return
    }

    try {
      // Get all message IDs
      const allMessageIds = messages.map(m => m.id)
      
      // Delete all messages from database
      const deletePromises = allMessageIds.map(messageId => 
        fetch(`/api/chat/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      )

      await Promise.all(deletePromises)

      // Clear all messages from local state
      setMessages([])
      localStorage.setItem("chatMessages", JSON.stringify([]))
      setSelectedChatUser(null)
      
      alert("All chat messages deleted successfully!")
    } catch (error) {
      console.error("Error bulk deleting chats:", error)
      // Fallback: clear from local state only
      setMessages([])
      localStorage.setItem("chatMessages", JSON.stringify([]))
      setSelectedChatUser(null)
      alert("All chat messages deleted locally (database deletion failed)")
    }
  }

  // ============ Data Management Functions ============

  const handleRefreshAdminData = async () => {
    setIsProcessing(true)
    try {
      console.log("🔄 Refreshing admin data...")
      
      // Clear all admin cache
      localStorage.removeItem("adminSubmissions")
      localStorage.removeItem("adminTickets")
      localStorage.removeItem("adminMessages")
      localStorage.removeItem("adminUsers")
      localStorage.removeItem("adminFeedbacks")
      localStorage.removeItem("adminChatUsers")
      
      // Fetch fresh data
      await fetchData()
      
      alert("✅ Admin data refreshed successfully!")
    } catch (error) {
      console.error("Error refreshing admin data:", error)
      alert("❌ Failed to refresh admin data")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearAllData = async () => {
    if (!confirm("⚠️ WARNING: This will delete ALL data including submissions, tickets, messages, users, and feedbacks. This action cannot be undone. Are you absolutely sure?")) {
      return
    }

    if (!confirm("🚨 FINAL WARNING: This will permanently delete ALL data. Type 'DELETE ALL' to confirm:")) {
      return
    }

    setIsProcessing(true)
    try {
      console.log("🗑️ Clearing all admin data...")
      
      // Clear all localStorage data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("admin") || key.startsWith("chat") || key.startsWith("help") || key.startsWith("user"))) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear all state
      setSubmissions([])
      setTickets([])
      setMessages([])
      setUsers([])
      setFeedbacks([])
      setSelectedSubmission(null)
      setSelectedChatUser(null)
      setSelectedUser(null)
      
      alert("✅ All data cleared successfully!")
    } catch (error) {
      console.error("Error clearing data:", error)
      alert("❌ Failed to clear all data")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDebugData = () => {
    console.log("🔍 Debugging admin data...")
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      localStorage: {
        adminSubmissions: JSON.parse(localStorage.getItem("adminSubmissions") || "[]").length,
        adminTickets: JSON.parse(localStorage.getItem("adminTickets") || "[]").length,
        adminMessages: JSON.parse(localStorage.getItem("adminMessages") || "[]").length,
        adminUsers: JSON.parse(localStorage.getItem("adminUsers") || "[]").length,
        adminFeedbacks: JSON.parse(localStorage.getItem("adminFeedbacks") || "[]").length,
        chatMessages: JSON.parse(localStorage.getItem("chatMessages") || "[]").length
      },
      state: {
        submissions: submissions.length,
        tickets: tickets.length,
        messages: messages.length,
        users: users.length,
        feedbacks: feedbacks.length
      },
      user: user,
      token: localStorage.getItem('token') ? 'Present' : 'Missing'
    }
    
    setDebugData(debugInfo)
    setDebugInfo(JSON.stringify(debugInfo, null, 2))
    console.log("Debug info:", debugInfo)
  }

  const handleCreateTestData = async () => {
    if (!confirm("This will create test data for all sections. Continue?")) {
      return
    }

    setIsCreatingTestData(true)
    try {
      console.log("🧪 Creating test data...")
      
      // Create test submissions
      const testSubmissions = Array.from({ length: 5 }, (_, i) => ({
        tracking_id: `TEST${Date.now()}-${i}`,
        form_id: "name_change",
        form_title: "Name Change Affidavit",
        user_id: `test_user_${i}`,
        user_name: `Test User ${i}`,
        user_email: `testuser${i}@example.com`,
        status: ["submitted", "processing", "approved", "rejected"][i % 4],
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        form_data: {
          applicant_name: `Test Applicant ${i}`,
          new_name: `New Name ${i}`,
          reason: `Test reason ${i}`
        }
      }))
      
      // Create test tickets
      const testTickets = Array.from({ length: 3 }, (_, i) => ({
        id: `TICKET${Date.now()}-${i}`,
        subject: `Test Ticket ${i}`,
        description: `This is a test ticket ${i}`,
        user_name: `Test User ${i}`,
        user_email: `testuser${i}@example.com`,
        status: ["open", "in_progress", "closed"][i % 3],
        priority: ["Low", "Medium", "High"][i % 3],
        created_at: new Date(Date.now() - i * 86400000).toISOString()
      }))
      
      // Create test messages
      const testMessages = Array.from({ length: 10 }, (_, i) => ({
        id: `MSG${Date.now()}-${i}`,
        sender: i % 2 === 0 ? "user" : "admin",
        userId: `test_user_${i % 3}`,
        userName: `Test User ${i % 3}`,
        userEmail: `testuser${i % 3}@example.com`,
        text: `Test message ${i}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      }))
      
      // Create test users
      const testUsers = Array.from({ length: 4 }, (_, i) => ({
        id: `USER${Date.now()}-${i}`,
        name: `Test User ${i}`,
        email: `testuser${i}@example.com`,
        phone: `+123456789${i}`,
        isAdmin: i === 0,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        lastLogin: new Date(Date.now() - i * 3600000).toISOString()
      }))
      
      // Create test feedbacks
      const testFeedbacks = Array.from({ length: 3 }, (_, i) => ({
        id: `FEEDBACK${Date.now()}-${i}`,
        type: ["general", "bug_report", "feature_request"][i % 3],
        message: `Test feedback ${i}`,
        rating: (i % 5) + 1,
        user_name: `Test User ${i}`,
        user_email: `testuser${i}@example.com`,
        status: ["submitted", "reviewed"][i % 2],
        created_at: new Date(Date.now() - i * 86400000).toISOString()
      }))
      
      // Update state and localStorage
      setSubmissions([...submissions, ...testSubmissions])
      setTickets([...tickets, ...testTickets])
      setMessages([...messages, ...testMessages])
      setUsers([...users, ...testUsers])
      setFeedbacks([...feedbacks, ...testFeedbacks])
      
      localStorage.setItem("adminSubmissions", JSON.stringify([...submissions, ...testSubmissions]))
      localStorage.setItem("adminTickets", JSON.stringify([...tickets, ...testTickets]))
      localStorage.setItem("adminMessages", JSON.stringify([...messages, ...testMessages]))
      localStorage.setItem("adminUsers", JSON.stringify([...users, ...testUsers]))
      localStorage.setItem("adminFeedbacks", JSON.stringify([...feedbacks, ...testFeedbacks]))
      
      alert("✅ Test data created successfully!")
    } catch (error) {
      console.error("Error creating test data:", error)
      alert("❌ Failed to create test data")
    } finally {
      setIsCreatingTestData(false)
    }
  }

  const handleTestAggregation = async () => {
    setIsProcessing(true)
    try {
      console.log("📊 Testing data aggregation...")
      
      const aggregationResults = {
        submissions: {
          total: submissions.length,
          by_status: submissions.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1
            return acc
          }, {}),
          by_form: submissions.reduce((acc, s) => {
            acc[s.form_id] = (acc[s.form_id] || 0) + 1
            return acc
          }, {})
        },
        tickets: {
          total: tickets.length,
          by_status: tickets.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
          }, {}),
          by_priority: tickets.reduce((acc, t) => {
            acc[t.priority] = (acc[t.priority] || 0) + 1
            return acc
          }, {})
        },
        messages: {
          total: messages.length,
          by_sender: messages.reduce((acc, m) => {
            acc[m.sender] = (acc[m.sender] || 0) + 1
            return acc
          }, {}),
          unique_users: new Set(messages.map(m => m.userId)).size
        },
        users: {
          total: users.length,
          admins: users.filter(u => u.isAdmin).length,
          regular_users: users.filter(u => !u.isAdmin).length
        },
        feedbacks: {
          total: feedbacks.length,
          by_type: feedbacks.reduce((acc, f) => {
            acc[f.type] = (acc[f.type] || 0) + 1
            return acc
          }, {}),
          average_rating: feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
        }
      }
      
      setDebugData(aggregationResults)
      setDebugInfo(JSON.stringify(aggregationResults, null, 2))
      console.log("Aggregation results:", aggregationResults)
      
      alert("✅ Data aggregation test completed! Check debug info.")
    } catch (error) {
      console.error("Error testing aggregation:", error)
      alert("❌ Failed to test aggregation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCleanDuplicates = async () => {
    if (!confirm("This will remove duplicate entries. Continue?")) {
      return
    }

    setIsProcessing(true)
    try {
      console.log("🧹 Cleaning duplicates...")
      
      let duplicatesRemoved = 0
      
      // Clean duplicate submissions
      const uniqueSubmissions = submissions.filter((sub, index, arr) => 
        arr.findIndex(s => s.tracking_id === sub.tracking_id) === index
      )
      if (uniqueSubmissions.length !== submissions.length) {
        duplicatesRemoved += submissions.length - uniqueSubmissions.length
        setSubmissions(uniqueSubmissions)
        localStorage.setItem("adminSubmissions", JSON.stringify(uniqueSubmissions))
      }
      
      // Clean duplicate tickets
      const uniqueTickets = tickets.filter((ticket, index, arr) => 
        arr.findIndex(t => t.id === ticket.id) === index
      )
      if (uniqueTickets.length !== tickets.length) {
        duplicatesRemoved += tickets.length - uniqueTickets.length
        setTickets(uniqueTickets)
        localStorage.setItem("adminTickets", JSON.stringify(uniqueTickets))
      }
      
      // Clean duplicate messages
      const uniqueMessages = messages.filter((msg, index, arr) => 
        arr.findIndex(m => m.id === msg.id) === index
      )
      if (uniqueMessages.length !== messages.length) {
        duplicatesRemoved += messages.length - uniqueMessages.length
        setMessages(uniqueMessages)
        localStorage.setItem("adminMessages", JSON.stringify(uniqueMessages))
      }
      
      // Clean duplicate users
      const uniqueUsers = users.filter((user, index, arr) => 
        arr.findIndex(u => u.id === user.id) === index
      )
      if (uniqueUsers.length !== users.length) {
        duplicatesRemoved += users.length - uniqueUsers.length
        setUsers(uniqueUsers)
        localStorage.setItem("adminUsers", JSON.stringify(uniqueUsers))
      }
      
      // Clean duplicate feedbacks
      const uniqueFeedbacks = feedbacks.filter((feedback, index, arr) => 
        arr.findIndex(f => f.id === feedback.id) === index
      )
      if (uniqueFeedbacks.length !== feedbacks.length) {
        duplicatesRemoved += feedbacks.length - uniqueFeedbacks.length
        setFeedbacks(uniqueFeedbacks)
        localStorage.setItem("adminFeedbacks", JSON.stringify(uniqueFeedbacks))
      }
      
      alert(`✅ Duplicate cleanup completed! Removed ${duplicatesRemoved} duplicates.`)
    } catch (error) {
      console.error("Error cleaning duplicates:", error)
      alert("❌ Failed to clean duplicates")
    } finally {
      setIsProcessing(false)
    }
  }

  const getChatUsers = () => {
    console.log("[Admin] getChatUsers called with messages:", messages.length, messages)
    const userMap = new Map()
    messages.forEach((msg) => {
      // Handle both user_id (from backend) and userId (from frontend)
      const userId = msg.user_id || msg.userId
      if (msg.sender === "user" && userId) {
        if (!userMap.has(userId)) {
          const userData = users.find((u) => u.id === userId) || {
            id: userId,
            name: msg.user_name || msg.userName || "Unknown User",
            email: msg.user_email || msg.userEmail || "unknown@example.com",
          }
          userMap.set(userId, {
            ...userData,
            lastMessage: msg.text,
            lastMessageTime: msg.timestamp,
            unreadCount: 0,
          })
        } else {
          const existing = userMap.get(userId)
          if (new Date(msg.timestamp) > new Date(existing.lastMessageTime)) {
            userMap.set(userId, {
              ...existing,
              lastMessage: msg.text,
              lastMessageTime: msg.timestamp,
            })
          }
        }
      }
    })
    const result = Array.from(userMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
    )
    console.log("[Admin] getChatUsers returning:", result.length, result)
    return result
  }

  const getUserMessages = (userId: string) => {
    return messages
      .filter((msg) => {
        const msgUserId = msg.user_id || msg.userId
        return msgUserId === userId || (msg.sender === "admin" && msg.recipientId === userId)
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  // End of added function

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <button
              onClick={async () => {
                console.log("[Admin] Manual refresh triggered")
                setIsRefreshing(true)
                try {
                  await fetchData()
                } finally {
                  setIsRefreshing(false)
                }
              }}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isRefreshing 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          {lastRefresh && (
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "submissions"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-foreground border border-blue-200"
            }`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "tickets"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-foreground border border-blue-200"
            }`}
          >
            Help Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "messages"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-foreground border border-blue-200"
            }`}
          >
            Chat Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-foreground border border-blue-200"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("feedbacks")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "feedbacks"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-foreground border border-blue-200"
            }`}
          >
            Feedbacks ({feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab("data-management")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "data-management"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-foreground border border-blue-200"
            }`}
          >
            Data Mgmt
          </button>
        </div>

        {isAuthChecking ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {activeTab === "submissions" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Recent Submissions</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={handleFilterChange}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Apply Filters
                        </button>
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          Clear Filters
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const { AdminApiClient } = await import('@/lib/admin-api-client')
                              const response = await fetch('http://localhost:8000/admin/test-pdf', {
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                  'Content-Type': 'application/json'
                                }
                              })
                              if (response.ok) {
                                const blob = await response.blob()
                                const url = window.URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = 'test.pdf'
                                link.click()
                                window.URL.revokeObjectURL(url)
                                alert('Test PDF downloaded successfully!')
                              } else {
                                alert('Test PDF failed: ' + response.statusText)
                              }
                            } catch (error) {
                              alert('Test PDF error: ' + error.message)
                            }
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                          Test PDF
                        </button>
                      </div>
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                        <select
                          value={filterFormId}
                          onChange={(e) => setFilterFormId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Forms</option>
                          <option value="name_change">Name Change Affidavit</option>
                          <option value="property_dispute_simple">Property Dispute Plaint</option>
                          <option value="traffic_fine_appeal">Traffic Fine Appeal</option>
                          <option value="mutual_divorce_petition">Mutual Divorce Petition</option>
                          <option value="affidavit_general">General Affidavit</option>
                          <option value="name_change_gazette">Name Change Gazette Application</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Statuses</option>
                          <option value="submitted">Submitted</option>
                          <option value="processing">Processing</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                          type="date"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                          type="date"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {submissions.map((submission, index) => (
                        <div
                          key={`${submission.tracking_id}-${index}`}
                          className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{submission.tracking_id}</p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Form:</strong> {submission.form_title || 
                                  (submission.form_id ? submission.form_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Form')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>User:</strong> {submission.user_name || submission.user_email || 
                                  submission.data?.user_name || submission.data?.email || 
                                  submission.user?.name || submission.user?.email || 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <strong>Submitted:</strong> {submission.created_at ? 
                                  new Date(submission.created_at).toLocaleString() : 
                                  submission.submitted_at ? 
                                    new Date(submission.submitted_at).toLocaleString() : 
                                    'Invalid Date'}
                              </p>
                              {submission.form_data && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Details:</strong> {Object.keys(submission.form_data).length} fields filled
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  submission.status === "submitted"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : submission.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : submission.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {submission.status}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetails(submission)
                                  }}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadPDF(submission.tracking_id)
                                  }}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition"
                                  title="Download PDF"
                                >
                                  📄
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSubmission(submission)
                                  }}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition"
                                  title="Update Status"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteSubmission(submission.tracking_id)
                                  }}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedSubmission && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-foreground mb-4">Submission Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Tracking ID</p>
                        <p className="text-foreground">{selectedSubmission.tracking_id}</p>
                      </div>

                      {documents.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Uploaded Documents ({documents.length})
                          </p>
                          <div className="space-y-2">
                            {documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="processing">Processing</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                        <textarea
                          value={statusUpdate}
                          onChange={(e) => setStatusUpdate(e.target.value)}
                          placeholder="Enter status update message..."
                          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedSubmission) {
                              handleStatusUpdate(selectedSubmission.tracking_id, "approved")
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all"
                        >
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedSubmission) {
                            handleStatusUpdate(selectedSubmission.tracking_id, newStatus)
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-foreground mb-6">Help Tickets</h2>
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No tickets yet</p>
                  ) : (
                    tickets.map((ticket, index) => (
                      <div key={`${ticket.id}-${index}`} className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-lg">{ticket.subject || ticket.title || 'No Subject'}</p>
                            <p className="text-sm text-muted-foreground">
                              <strong>From:</strong> {ticket.userName || ticket.user_name || ticket.userEmail || ticket.user_email || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Email:</strong> {ticket.userEmail || ticket.user_email || 'No email provided'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            ticket.status === "open" ? "bg-yellow-100 text-yellow-800" :
                            ticket.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            ticket.status === "closed" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {ticket.status || 'Open'}
                          </span>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Description:</strong>
                          </p>
                          <p className="text-sm text-foreground bg-gray-50 p-3 rounded-lg">
                            {ticket.description || ticket.message || 'No description provided'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            <strong>Priority:</strong> {ticket.priority || 'Medium'}
                          </span>
                          <span>
                            <strong>Created:</strong> {new Date(ticket.createdAt || ticket.timestamp || Date.now()).toLocaleString()}
                          </span>
                        </div>
                        {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}
                          </div>
                        )}
                        
                        {/* Reply Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your reply to this ticket..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  handleReplyToTicket(ticket.id, e.target.value, ticket.userEmail || ticket.user_email, ticket.userName || ticket.user_name, ticket.subject || ticket.title)
                                  e.target.value = ''
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input')
                                if (input.value.trim()) {
                                  handleReplyToTicket(ticket.id, input.value, ticket.userEmail || ticket.user_email, ticket.userName || ticket.user_name, ticket.subject || ticket.title)
                                  input.value = ''
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List */}
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <h2 className="text-xl font-bold text-white">Conversations</h2>
                  </div>
                  
                  {/* Chat Filter Controls */}
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
                        <input
                          type="text"
                          value={chatFilterUser}
                          onChange={(e) => setChatFilterUser(e.target.value)}
                          placeholder="Search by name or email..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                          <input
                            type="date"
                            value={chatFilterDateFrom}
                            onChange={(e) => setChatFilterDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                          <input
                            type="date"
                            value={chatFilterDateTo}
                            onChange={(e) => setChatFilterDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={applyChatFilters}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Apply
                        </button>
                        <button
                          onClick={clearChatFilters}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleBulkDeleteChats}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          title="Delete all filtered chats"
                        >
                          🗑️ Delete All
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {getChatUsers().length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No conversations yet</p>
                    ) : (
                      getChatUsers().map((chatUser) => (
                        <div
                          key={chatUser.id}
                          onClick={() => setSelectedChatUser(chatUser)}
                          className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${
                            selectedChatUser?.id === chatUser.id ? "bg-blue-100" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-lg font-bold">
                                {chatUser.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-foreground truncate">{chatUser.name}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                  {new Date(chatUser.lastMessageTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{chatUser.lastMessage}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Conversation */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col overflow-hidden">
                  {selectedChatUser ? (
                    <>
                      {/* Chat Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {selectedChatUser.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{selectedChatUser.name}</p>
                            <p className="text-sm text-white/80">{selectedChatUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteConversation(selectedChatUser.id)}
                          className="px-3 py-1 bg-red-500/20 text-white rounded-lg hover:bg-red-500/30 transition text-sm"
                          title="Delete entire conversation"
                        >
                          🗑️ Delete Chat
                        </button>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[450px] bg-gray-50">
                        {getUserMessages(selectedChatUser.id).map((message, index) => (
                          <div
                            key={`${message.id}-${index}`}
                            className={`flex gap-3 ${message.sender === "admin" ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.sender === "admin"
                                  ? "bg-gradient-to-br from-green-600 to-green-700"
                                  : "bg-gradient-to-br from-blue-600 to-blue-700"
                              }`}
                            >
                              <span className="text-white text-xs font-semibold">
                                {message.sender === "admin" ? "A" : "U"}
                              </span>
                            </div>
                            <div
                              className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                                message.sender === "admin"
                                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none"
                                  : "bg-white text-foreground rounded-tl-none border border-gray-200"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm leading-relaxed">{message.text}</p>
                                  <p
                                    className={`text-xs mt-1 ${message.sender === "admin" ? "text-white/80" : "text-muted-foreground"}`}
                                  >
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className={`ml-2 p-1 rounded-full hover:bg-red-500/20 transition ${
                                    message.sender === "admin" ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-red-500"
                                  }`}
                                  title="Delete message"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input */}
                      <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your reply..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!replyMessage.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-2">Select a conversation</p>
                        <p className="text-sm">Choose a user from the list to view and reply to their messages</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Registered Users</h2>
                    <div className="space-y-4">
                      {users.map((userData, index) => (
                        <div
                          key={`${userData.id}-${index}`}
                          onClick={() => setSelectedUser(userData)}
                          className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-foreground">{userData.name}</p>
                              <p className="text-sm text-muted-foreground">{userData.email}</p>
                              <p className="text-xs text-muted-foreground">{userData.phone}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                userData.isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {userData.isAdmin ? "Admin" : "User"}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>Joined: {new Date(userData.createdAt).toLocaleString()}</p>
                            <p>Last Login: {new Date(userData.lastLogin).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedUser && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-foreground mb-4">User Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Full Name</p>
                        <p className="text-foreground">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                        <p className="text-foreground">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Phone</p>
                        <p className="text-foreground">{selectedUser.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Account Type</p>
                        <p className="text-foreground">{selectedUser.isAdmin ? "Administrator" : "Regular User"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Registration Date</p>
                        <p className="text-foreground">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Last Login</p>
                        <p className="text-foreground">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">User Activity</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Submissions:</span>
                            <span className="font-semibold text-foreground">
                              {submissions.filter((s) => s.user_email === selectedUser.email).length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Help Tickets:</span>
                            <span className="font-semibold text-foreground">
                              {tickets.filter((t) => t.email === selectedUser.email).length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Chat Messages:</span>
                            <span className="font-semibold text-foreground">
                              {messages.filter((m) => m.sender === "user").length}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Admin Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-muted-foreground mb-3">Admin Actions</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to ${selectedUser.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to'} ${selectedUser.name}?`)) {
                                // Toggle admin status
                                const updatedUsers = users.map(u => 
                                  u.id === selectedUser.id 
                                    ? { ...u, isAdmin: !u.isAdmin }
                                    : u
                                )
                                setUsers(updatedUsers)
                                localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
                                setSelectedUser({ ...selectedUser, isAdmin: !selectedUser.isAdmin })
                                alert(`Admin privileges ${selectedUser.isAdmin ? 'removed from' : 'granted to'} ${selectedUser.name}`)
                              }
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              selectedUser.isAdmin 
                                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {selectedUser.isAdmin ? "Remove Admin" : "Make Admin"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to suspend ${selectedUser.name}? This will prevent them from logging in.`)) {
                                // Toggle suspended status
                                const updatedUsers = users.map(u => 
                                  u.id === selectedUser.id 
                                    ? { ...u, suspended: !u.suspended }
                                    : u
                                )
                                setUsers(updatedUsers)
                                localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
                                setSelectedUser({ ...selectedUser, suspended: !selectedUser.suspended })
                                alert(`${selectedUser.name} has been ${selectedUser.suspended ? 'unsuspended' : 'suspended'}`)
                              }
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              selectedUser.suspended 
                                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                          >
                            {selectedUser.suspended ? "Unsuspend User" : "Suspend User"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "feedbacks" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-foreground mb-6">User Feedbacks</h2>
                <div className="space-y-4">
                  {feedbacks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No feedback yet</p>
                  ) : (
                    feedbacks.map((feedback, index) => (
                      <div key={`${feedback.id}-${index}`} className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-lg">
                              {feedback.type?.replace(/_/g, ' ').toUpperCase() || 'General Feedback'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>From:</strong> {feedback.userName || feedback.user_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Email:</strong> {feedback.userEmail || feedback.user_email || 'No email provided'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (feedback.rating || 5) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              feedback.status === "submitted" ? "bg-blue-100 text-blue-800" :
                              feedback.status === "reviewed" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {feedback.status || 'Submitted'}
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Feedback:</strong>
                          </p>
                          <p className="text-sm text-foreground bg-gray-50 p-3 rounded-lg">
                            {feedback.message || feedback.feedback || 'No feedback message provided'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            <strong>Rating:</strong> {feedback.rating || 5}/5 stars
                          </span>
                          <span>
                            <strong>Submitted:</strong> {new Date(feedback.createdAt || feedback.timestamp || Date.now()).toLocaleString()}
                          </span>
                        </div>
                        {feedback.updatedAt && feedback.updatedAt !== feedback.createdAt && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <strong>Last Updated:</strong> {new Date(feedback.updatedAt).toLocaleString()}
                          </div>
                        )}
                        
                        {/* Reply Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your reply to this feedback..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  handleReplyToFeedback(feedback.id, e.target.value, feedback.userEmail || feedback.user_email, feedback.userName || feedback.user_name, feedback.type)
                                  e.target.value = ''
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input')
                                if (input.value.trim()) {
                                  handleReplyToFeedback(feedback.id, input.value, feedback.userEmail || feedback.user_email, feedback.userName || feedback.user_name, feedback.type)
                                  input.value = ''
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "data-management" && (
              <div className="space-y-6">
                {/* Data Management Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Data Management Center</h2>
                  <p className="text-blue-100">Manage, debug, and maintain admin data</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={handleRefreshAdminData}
                    disabled={isProcessing}
                    className="p-4 bg-white rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        🔄
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Refresh Data</h3>
                        <p className="text-sm text-muted-foreground">Reload all admin data</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleDebugData}
                    className="p-4 bg-white rounded-xl border border-green-200 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        🔍
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Debug Data</h3>
                        <p className="text-sm text-muted-foreground">Inspect data structure</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleCreateTestData}
                    disabled={isCreatingTestData}
                    className="p-4 bg-white rounded-xl border border-yellow-200 hover:bg-yellow-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        🧪
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Create Test Data</h3>
                        <p className="text-sm text-muted-foreground">Generate sample data</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleTestAggregation}
                    disabled={isProcessing}
                    className="p-4 bg-white rounded-xl border border-purple-200 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        📊
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Test Aggregation</h3>
                        <p className="text-sm text-muted-foreground">Analyze data patterns</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleCleanDuplicates}
                    disabled={isProcessing}
                    className="p-4 bg-white rounded-xl border border-orange-200 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        🧹
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Clean Duplicates</h3>
                        <p className="text-sm text-muted-foreground">Remove duplicate entries</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleClearAllData}
                    disabled={isProcessing}
                    className="p-4 bg-white rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        🗑️
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Clear All Data</h3>
                        <p className="text-sm text-muted-foreground">⚠️ Dangerous operation</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Debug Information */}
                {debugData && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-foreground">Debug Information</h3>
                      <button
                        onClick={() => setDebugData(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      {debugInfo}
                    </pre>
                  </div>
                )}

                {/* Data Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
                        <p className="text-sm text-muted-foreground">Submissions</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        🎫
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
                        <p className="text-sm text-muted-foreground">Tickets</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        💬
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                        <p className="text-sm text-muted-foreground">Messages</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        👥
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{users.length}</p>
                        <p className="text-sm text-muted-foreground">Users</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Status */}
                {(isProcessing || isCreatingTestData) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <p className="text-blue-800 font-medium">
                        {isCreatingTestData ? "Creating test data..." : "Processing..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Reject Submission</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this submission. This will be sent to the user.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedSubmissionDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-foreground">Submission Details</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tracking ID:</strong> {selectedSubmissionDetails.tracking_id}</p>
                      <p><strong>Form Type:</strong> {selectedSubmissionDetails.form_title || selectedSubmissionDetails.form_id}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedSubmissionDetails.status === "submitted" ? "bg-yellow-100 text-yellow-800" :
                          selectedSubmissionDetails.status === "approved" ? "bg-green-100 text-green-800" :
                          selectedSubmissionDetails.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {selectedSubmissionDetails.status}
                        </span>
                      </p>
                      <p><strong>Submitted:</strong> {new Date(selectedSubmissionDetails.created_at || selectedSubmissionDetails.submitted_at).toLocaleString()}</p>
                      <p><strong>User:</strong> {selectedSubmissionDetails.user_name || selectedSubmissionDetails.user_email || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPDF(selectedSubmissionDetails.tracking_id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                    >
                      📄 Download PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setSelectedSubmission(selectedSubmissionDetails)
                      }}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                    >
                      ✏️ Update Status
                    </button>
                  </div>
                </div>
                
                {/* Form Data */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Form Data</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedSubmissionDetails.form_data || selectedSubmissionDetails.data ? (
                      Object.entries(selectedSubmissionDetails.form_data || selectedSubmissionDetails.data).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded border">
                          <p className="font-medium text-sm text-gray-700 capitalize">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No form data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

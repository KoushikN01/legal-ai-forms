"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import StatusUpdater from "@/lib/status-updater"
import { getTrackingId, getFormTitle, getFormType, findSubmissionByTrackingId, matchesTrackingId, getTrackingIdDisplay, copyTrackingIdToClipboard } from "@/lib/tracking-utils"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Eye,
  MessageSquare,
  Send,
  HelpCircle,
  Ticket,
  RefreshCw
} from "lucide-react"

interface FormSubmission {
  id: string
  trackingId: string
  formTitle: string
  formType: string
  status: "submitted" | "processing" | "under_review" | "approved" | "rejected"
  submittedAt: string
  updatedAt: string
  adminMessage?: string
  documents?: any[]
}

interface UserStats {
  totalSubmissions: number
  pendingSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  thisMonthSubmissions: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function UserDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    thisMonthSubmissions: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  
  // Chat state
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])
  
  // Help ticket state
  const [showHelpTicket, setShowHelpTicket] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketDescription, setTicketDescription] = useState("")
  const [ticketPriority, setTicketPriority] = useState("medium")
  const [userTickets, setUserTickets] = useState<any[]>([])
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState("general")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [userFeedbacks, setUserFeedbacks] = useState<any[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    console.log("[Dashboard] User in useEffect:", user, "isLoading:", isLoading)
    if (!isLoading && !user) {
      console.log("[Dashboard] No user found, redirecting to auth")
      router.push("/auth")
      return
    }
    
    if (user) {
      console.log("[Dashboard] User ID:", user.id)
      loadUserSubmissions()
      loadChatMessages()
      fetchChatMessagesFromBackend() // Fetch messages from backend
      loadUserTickets()
      loadUserFeedbacks()
    }
    
    // Set up real-time status updates
    const statusUpdater = StatusUpdater.getInstance()
    statusUpdater.startPolling()
    
    // Listen for status update events
    const handleStatusUpdate = () => {
      loadUserSubmissions()
    }
    
    window.addEventListener('submissionStatusUpdated', handleStatusUpdate)
    
    // Request notification permission
    StatusUpdater.requestNotificationPermission()
    
    return () => {
      statusUpdater.stopPolling()
      window.removeEventListener('submissionStatusUpdated', handleStatusUpdate)
    }
  }, [user, router])

  const loadUserSubmissions = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from backend first
      try {
        const response = await fetch(`${API_BASE_URL}/user/submissions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setSubmissions(data.submissions || [])
          setStats(data.stats || stats)
          return
        }
      } catch (error) {
        console.log("[Dashboard] Backend unavailable, using local data")
      }

      // Fallback to localStorage with data recovery
      const storageKey = `userSubmissions_${user?.id}`
      console.log("[Dashboard] Loading from localStorage with key:", storageKey)
      let savedSubmissions = localStorage.getItem(storageKey)
      
      // If no submissions found, try to recover from backup using migration service
      if (!savedSubmissions && user?.email) {
        import('@/lib/data-migration').then(({ DataMigrationService }) => {
          // Try to recover using email-based backup
          const recovered = DataMigrationService.recoverUserDataByEmail(user.email, user.id)
          if (recovered) {
            console.log("[Dashboard] Data recovered from email backup")
            // Reload submissions after recovery
            const recoveredData = localStorage.getItem(storageKey)
            if (recoveredData) {
              const parsedSubmissions = JSON.parse(recoveredData)
              setSubmissions(parsedSubmissions)
              calculateStats(parsedSubmissions)
            }
          } else {
            // Try to find existing data by email
            const existingData = DataMigrationService.findUserDataByEmail(user.email)
            if (existingData) {
              console.log("[Dashboard] Found existing data, migrating...")
              DataMigrationService.migrateUserData(existingData.userId, user.id)
              // Reload submissions after migration
              const migratedData = localStorage.getItem(storageKey)
              if (migratedData) {
                const parsedSubmissions = JSON.parse(migratedData)
                setSubmissions(parsedSubmissions)
                calculateStats(parsedSubmissions)
              }
            }
          }
        }).catch(error => {
          console.error("[Dashboard] Error importing migration service:", error)
        })
      }
      
      if (savedSubmissions) {
        const parsedSubmissions = JSON.parse(savedSubmissions)
        console.log("[Dashboard] Loaded submissions from localStorage:", parsedSubmissions.length)
        console.log("[Dashboard] First submission details:", parsedSubmissions[0])
        console.log("[Dashboard] All submission tracking IDs:", parsedSubmissions.map((s: any) => ({
          id: s.id,
          trackingId: s.trackingId,
          tracking_id: s.tracking_id,
          extracted: getTrackingId(s)
        })))
        console.log("[Dashboard] Checking formData in submissions:")
        parsedSubmissions.forEach((sub: any, index: number) => {
          console.log(`[Dashboard] Submission ${index}:`, {
            trackingId: getTrackingId(sub),
            formType: sub.formType,
            hasFormData: !!sub.formData,
            formDataKeys: sub.formData ? Object.keys(sub.formData) : [],
            formDataValues: sub.formData ? Object.values(sub.formData) : []
          })
        })
        
        // Convert any MOCK tracking IDs to TRK format for consistency
        const updatedSubmissions = parsedSubmissions.map((sub: any) => {
          if (sub.trackingId && sub.trackingId.startsWith('MOCK-')) {
            console.log(`[Dashboard] Converting MOCK tracking ID: ${sub.trackingId}`)
            // Extract timestamp from MOCK format and convert to TRK format
            const mockTimestamp = sub.trackingId.split('-')[1]
            if (mockTimestamp) {
              const date = new Date(parseInt(mockTimestamp))
              const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
              const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase()
              const newTrackingId = `TRK${dateStr}-${randomStr}`
              console.log(`[Dashboard] New TRK tracking ID: ${newTrackingId}`)
              return {
                ...sub,
                trackingId: newTrackingId,
                id: newTrackingId
              }
            }
          }
          return sub
        })
        
        // Save updated submissions back to localStorage
        if (updatedSubmissions.some((sub: any, index: number) => sub !== parsedSubmissions[index])) {
          console.log("[Dashboard] Updated tracking IDs, saving to localStorage")
          localStorage.setItem(storageKey, JSON.stringify(updatedSubmissions))
        }
        
        setSubmissions(updatedSubmissions)
        calculateStats(updatedSubmissions)
      } else {
        console.log("[Dashboard] No submissions found in localStorage, using mock data")
        // Create some mock data for demo
        const mockSubmissions: FormSubmission[] = [
          {
            id: "1",
            trackingId: "TRK20241201-ABC123",
            formTitle: "Name Change Affidavit",
            formType: "name_change",
            status: "approved",
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            adminMessage: "Your name change application has been approved. Please collect your documents from the office."
          },
          {
            id: "2",
            trackingId: "TRK20241202-DEF456",
            formTitle: "Property Dispute Plaint",
            formType: "property_dispute",
            status: "processing",
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            adminMessage: "Your property dispute case is being reviewed by our legal team."
          },
          {
            id: "3",
            trackingId: "TRK20241203-GHI789",
            formTitle: "Traffic Fine Appeal",
            formType: "traffic_fine_appeal",
            status: "under_review",
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
        setSubmissions(mockSubmissions)
        calculateStats(mockSubmissions)
        localStorage.setItem(`userSubmissions_${user?.id}`, JSON.stringify(mockSubmissions))
      }
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (submissions: FormSubmission[]) => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const stats: UserStats = {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === "submitted" || s.status === "processing").length,
      approvedSubmissions: submissions.filter(s => s.status === "approved").length,
      rejectedSubmissions: submissions.filter(s => s.status === "rejected").length,
      thisMonthSubmissions: submissions.filter(s => new Date(s.submittedAt) >= thisMonth).length
    }
    setStats(stats)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "under_review":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ")
  }

  // Chat functions
  const loadChatMessages = () => {
    try {
      const savedMessages = localStorage.getItem(`userChatMessages_${user?.id}`)
      if (savedMessages) {
        const messages = JSON.parse(savedMessages)
        setChatMessages(messages)
        console.log("[Dashboard] Loaded chat messages from localStorage:", messages.length)
      }
    } catch (error) {
      console.error("[Dashboard] Error loading chat messages from localStorage:", error)
    }
  }

  const fetchChatMessagesFromBackend = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log("[Dashboard] No token found, skipping backend fetch")
        return
      }

      console.log("[Dashboard] Fetching chat messages from backend...")
      const response = await fetch('http://localhost:8000/chat/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const messages = data.messages || []
        console.log("[Dashboard] Fetched messages from backend:", messages.length)
        
        // Transform messages to match frontend format
        const transformedMessages = messages.map((msg: any) => ({
          id: msg.message_id || msg._id,
          sender: msg.sender,
          userId: msg.user_id,
          userName: msg.user_name || msg.userName || (msg.sender === "admin" ? "Admin" : user.name),
          userEmail: msg.user_email || msg.userEmail || (msg.sender === "admin" ? "admin@example.com" : user.email),
          text: msg.text,
          timestamp: msg.timestamp || msg.created_at
        }))

        setChatMessages(transformedMessages)
        
        // Save to localStorage
        localStorage.setItem(`userChatMessages_${user.id}`, JSON.stringify(transformedMessages))
        
        console.log("[Dashboard] Updated chat messages:", transformedMessages.length)
      } else {
        console.error("[Dashboard] Failed to fetch messages from backend:", response.status)
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching chat messages from backend:", error)
    }
  }

  const sendMessageToAdmin = async () => {
    if (!chatMessage.trim() || !user) return

    const newMessage = {
      id: Date.now().toString(),
      sender: "user",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      text: chatMessage,
      timestamp: new Date().toISOString(),
    }

    try {
      // Send message to backend database
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender: "user",
          text: chatMessage
        })
      })

      if (response.ok) {
        console.log("[Dashboard] Message sent to backend successfully")
        const result = await response.json()
        console.log("[Dashboard] Backend response:", result)
        
        // Refresh messages from backend after sending
        await fetchChatMessagesFromBackend()
      } else {
        console.error("[Dashboard] Failed to send message to backend:", response.status)
        // Fallback to localStorage if backend fails
      }
    } catch (error) {
      console.error("[Dashboard] Error sending message to backend:", error)
      // Fallback to localStorage if backend fails
    }

    // Always update local state and localStorage (for immediate UI update)
    const updatedMessages = [...chatMessages, newMessage]
    setChatMessages(updatedMessages)
    
    // Save to localStorage
    localStorage.setItem(`userChatMessages_${user.id}`, JSON.stringify(updatedMessages))
    
    // Also save to global chat messages for admin
    const globalMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]")
    globalMessages.push(newMessage)
    localStorage.setItem("chatMessages", JSON.stringify(globalMessages))
    
    setChatMessage("")
    console.log("[Dashboard] Message sent to admin:", newMessage)
  }

  // Help ticket functions
  const loadUserTickets = () => {
    try {
      const savedTickets = localStorage.getItem(`userTickets_${user?.id}`)
      if (savedTickets) {
        const tickets = JSON.parse(savedTickets)
        setUserTickets(tickets)
        console.log("[Dashboard] Loaded user tickets:", tickets.length)
      }
    } catch (error) {
      console.error("[Dashboard] Error loading user tickets:", error)
    }
  }

  const createHelpTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim() || !user) return

    const newTicket = {
      id: `ticket_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject: ticketSubject,
      description: ticketDescription,
      priority: ticketPriority,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      // Send ticket to backend database
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/user/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: ticketSubject,
          description: ticketDescription,
          priority: ticketPriority
        })
      })

      if (response.ok) {
        console.log("[Dashboard] Help ticket sent to backend successfully")
        const result = await response.json()
        console.log("[Dashboard] Backend response:", result)
      } else {
        console.error("[Dashboard] Failed to send ticket to backend:", response.status)
        // Fallback to localStorage if backend fails
      }
    } catch (error) {
      console.error("[Dashboard] Error sending ticket to backend:", error)
      // Fallback to localStorage if backend fails
    }

    // Always update local state and localStorage (for immediate UI update)
    const updatedTickets = [...userTickets, newTicket]
    setUserTickets(updatedTickets)
    
    // Save to localStorage
    localStorage.setItem(`userTickets_${user.id}`, JSON.stringify(updatedTickets))
    
    // Also save to global help tickets for admin
    const globalTickets = JSON.parse(localStorage.getItem("helpTickets") || "[]")
    globalTickets.push(newTicket)
    localStorage.setItem("helpTickets", JSON.stringify(globalTickets))
    
    // Reset form
    setTicketSubject("")
    setTicketDescription("")
    setTicketPriority("medium")
    setShowHelpTicket(false)
    
    console.log("[Dashboard] Help ticket created:", newTicket)
    alert("Help ticket created successfully! Admin will review it soon.")
  }

  // Feedback functions
  const loadUserFeedbacks = () => {
    try {
      const savedFeedbacks = localStorage.getItem(`userFeedbacks_${user?.id}`)
      if (savedFeedbacks) {
        const feedbacks = JSON.parse(savedFeedbacks)
        setUserFeedbacks(feedbacks)
        console.log("[Dashboard] Loaded user feedbacks:", feedbacks.length)
      }
    } catch (error) {
      console.error("[Dashboard] Error loading user feedbacks:", error)
    }
  }

  const submitFeedback = async () => {
    if (!feedbackMessage.trim() || !user) return

    const newFeedback = {
      id: `feedback_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: feedbackType,
      message: feedbackMessage,
      rating: feedbackRating,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      // Send feedback to backend database
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/user/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          message: feedbackMessage,
          rating: feedbackRating
        })
      })

      if (response.ok) {
        console.log("[Dashboard] Feedback sent to backend successfully")
        const result = await response.json()
        console.log("[Dashboard] Backend response:", result)
      } else {
        console.error("[Dashboard] Failed to send feedback to backend:", response.status)
        // Fallback to localStorage if backend fails
      }
    } catch (error) {
      console.error("[Dashboard] Error sending feedback to backend:", error)
      // Fallback to localStorage if backend fails
    }

    // Always update local state and localStorage (for immediate UI update)
    const updatedFeedbacks = [...userFeedbacks, newFeedback]
    setUserFeedbacks(updatedFeedbacks)
    
    // Save to localStorage
    localStorage.setItem(`userFeedbacks_${user.id}`, JSON.stringify(updatedFeedbacks))
    
    // Also save to global feedbacks for admin
    const globalFeedbacks = JSON.parse(localStorage.getItem("userFeedbacks") || "[]")
    globalFeedbacks.push(newFeedback)
    localStorage.setItem("userFeedbacks", JSON.stringify(globalFeedbacks))
    
    // Reset form
    setFeedbackType("general")
    setFeedbackMessage("")
    setFeedbackRating(5)
    setShowFeedback(false)
    
    console.log("[Dashboard] Feedback submitted:", newFeedback)
    alert("Feedback submitted successfully! Thank you for your input.")
  }

  const filteredSubmissions = submissions
    .filter(submission => {
      const matchesSearch = matchesTrackingId(submission, searchTerm)
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status)
      }
      return 0
    })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/forms")}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Forms
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600 mt-1">Track your legal form submissions</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showDebug ? 'Hide Debug' : 'Debug'}
              </button>
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {showFeedback ? 'Hide Feedback' : 'Feedback'}
              </button>
              <button
                onClick={() => setShowHelpTicket(!showHelpTicket)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold"
              >
                <HelpCircle className="w-5 h-5" />
                {showHelpTicket ? 'Hide Support' : 'Help & Support'}
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <MessageSquare className="w-5 h-5" />
                {showChat ? 'Hide Chat' : 'Chat with Admin'}
              </button>
              <button
                onClick={() => router.push("/forms")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Submit New Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approvedSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejectedSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisMonthSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Chat with Admin</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages yet. Start a conversation with the admin!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessageToAdmin()}
                placeholder="Type your message to admin..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={fetchChatMessagesFromBackend}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                title="Refresh messages"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={sendMessageToAdmin}
                disabled={!chatMessage.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        )}

        {/* Help Ticket Interface */}
        {showHelpTicket && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900">Help & Support</h3>
            </div>
            
            {/* Create New Ticket */}
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Create Help Ticket</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Minor issue</option>
                    <option value="high">High - Urgent issue</option>
                  </select>
                </div>
                <button
                  onClick={createHelpTicket}
                  disabled={!ticketSubject.trim() || !ticketDescription.trim()}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Create Help Ticket
                </button>
              </div>
            </div>
            
            {/* My Tickets */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">My Help Tickets ({userTickets.length})</h4>
              {userTickets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No help tickets yet. Create one above if you need assistance!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900">{ticket.subject}</h5>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Priority: {ticket.priority.toUpperCase()}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Interface */}
        {showFeedback && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Feedback & Suggestions</h3>
            </div>
            
            {/* Submit Feedback */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Share Your Feedback</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement Suggestion</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Please share your thoughts, suggestions, or report any issues..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackMessage.trim()}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Feedback
                </button>
              </div>
            </div>
            
            {/* My Feedbacks */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">My Feedback ({userFeedbacks.length})</h4>
              {userFeedbacks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p>No feedback submitted yet. Share your thoughts above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900 capitalize">{feedback.type.replace('_', ' ')}</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            feedback.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            feedback.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {feedback.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{feedback.message}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Submitted: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                        {feedback.adminReply && (
                          <span className="text-green-600 font-medium">Admin replied</span>
                        )}
                      </div>
                      {feedback.adminReply && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Admin Reply:</strong> {feedback.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debug Interface */}
        {showDebug && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Debug Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">User Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Submissions Data</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(submissions, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">LocalStorage Keys</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(
                      Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
                        .filter((key): key is string => key !== null && (key.includes('user') || key.includes('submission') || key.includes('backup')))
                        .map(key => ({ key, value: (localStorage.getItem(key) || '').substring(0, 100) + '...' })), 
                      null, 2
                    )}
                  </pre>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log('[Debug] All submissions:', submissions)
                    console.log('[Debug] User:', user)
                    console.log('[Debug] LocalStorage keys:', Object.keys(localStorage))
                    alert('Debug information logged to console')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Log to Console
                </button>
                <button
                  onClick={() => {
                    const debugData = {
                      user,
                      submissions,
                      localStorage: Object.keys(localStorage).reduce((acc, key) => {
                        if (key.includes('user') || key.includes('submission') || key.includes('backup')) {
                          acc[key] = localStorage.getItem(key)
                        }
                        return acc
                      }, {} as Record<string, string | null>)
                    }
                    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'debug-data.json'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Download Debug Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by form title or tracking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Form Submissions</h2>
            <p className="text-gray-600">Track the status of your legal form submissions</p>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "No submissions match your current filters." 
                  : "You haven't submitted any forms yet."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => router.push("/forms")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Submit Your First Form
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission, index) => (
                <div key={submission.id || submission.trackingId || (submission as any).tracking_id || `submission-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(submission.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{getFormTitle(submission)}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Tracking ID</p>
                          <p className="font-mono text-sm text-gray-900">{getTrackingIdDisplay(getTrackingId(submission))}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="text-sm text-gray-900">
                            {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                            {new Date(submission.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="text-sm text-gray-900">
                            {new Date(submission.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(submission.updatedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Form Type</p>
                          <p className="text-sm text-gray-900 capitalize">
                            {getFormType(submission).replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      {submission.adminMessage && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Message:</p>
                          <p className="text-sm text-blue-800">{submission.adminMessage}</p>
                        </div>
                      )}

                      {submission.documents && submission.documents.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attached Documents:</p>
                          <div className="flex gap-2">
                            {submission.documents.map((doc, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                <FileText className="w-4 h-4" />
                                {doc.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          try {
                            const trackingId = getTrackingId(submission)
                            console.log("[Dashboard] View Details clicked for submission:", submission)
                            console.log("[Dashboard] Extracted tracking ID:", trackingId)
                            console.log("[Dashboard] Submission keys:", Object.keys(submission))
                            
                            if (!trackingId) {
                              console.error("[Dashboard] No tracking ID found for submission:", submission)
                              alert("Error: No tracking ID found for this submission")
                              return
                            }
                            
                            console.log("[Dashboard] Navigating to track page with ID:", trackingId)
                            
                            // Try router.push first
                            try {
                              router.push(`/track?id=${trackingId}`)
                            } catch (routerError) {
                              console.error("[Dashboard] Router.push failed:", routerError)
                              // Fallback to window.location
                              console.log("[Dashboard] Using window.location fallback")
                              window.location.href = `/track?id=${trackingId}`
                            }
                          } catch (error) {
                            console.error("[Dashboard] Error in View Details click:", error)
                            alert("Error navigating to view details. Please try again.")
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={async () => {
                          const success = await copyTrackingIdToClipboard(getTrackingId(submission))
                          if (success) {
                            alert("Tracking ID copied to clipboard!")
                          } else {
                            alert("Failed to copy tracking ID")
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy ID
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

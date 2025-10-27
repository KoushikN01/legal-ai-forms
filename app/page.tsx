"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import FormChooser from "@/components/form-chooser"
import ConversationalFormFiller from "@/components/conversational-form-filler"
import ReviewForm from "@/components/review-form"
import Tracker from "@/components/tracker"
import { useAuth } from "@/lib/auth-context"

type AppStep = "home" | "conversational" | "review" | "submitted" | "track"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const MOCK_FORMS: Record<string, any> = {
  name_change: {
    fields: [
      {
        id: "applicant_full_name",
        label: "Full Name",
        help: "Your current full legal name",
        type: "text",
        required: true,
      },
      { id: "applicant_age", label: "Age", help: "Your age", type: "number", required: true },
      {
        id: "applicant_father_name",
        label: "Father's Name",
        help: "Your father's full name",
        type: "text",
        required: true,
      },
      {
        id: "current_address",
        label: "Current Address",
        help: "Your complete residential address with pincode",
        type: "textarea",
        required: true,
      },
      { id: "previous_name", label: "Previous Name", help: "Your old/previous name", type: "text", required: true },
      { id: "new_name", label: "New Name", help: "Your desired new name", type: "text", required: true },
      {
        id: "reason",
        label: "Reason for Change",
        help: "Why you want to change your name",
        type: "textarea",
        required: true,
      },
      {
        id: "date_of_declaration",
        label: "Date of Declaration",
        help: "Date of this declaration",
        type: "date",
        required: true,
      },
      { id: "place", label: "Place", help: "Place where this declaration is made", type: "text", required: true },
      { id: "id_proof_type", label: "ID Proof Type", help: "Type of ID proof", type: "select", required: true },
      { id: "id_proof_number", label: "ID Proof Number", help: "Your ID proof number", type: "text", required: true },
    ],
  },
  property_dispute_simple: {
    fields: [
      { id: "plaintiff_name", label: "Plaintiff Name", help: "Your full legal name", type: "text", required: true },
      {
        id: "plaintiff_address",
        label: "Plaintiff Address",
        help: "Your complete address with pincode",
        type: "textarea",
        required: true,
      },
      {
        id: "defendant_name",
        label: "Defendant Name",
        help: "Defendant full legal name",
        type: "text",
        required: true,
      },
      {
        id: "defendant_address",
        label: "Defendant Address",
        help: "Defendant complete address",
        type: "textarea",
        required: true,
      },
      {
        id: "property_description",
        label: "Property Description",
        help: "Location, survey number, or address of property",
        type: "textarea",
        required: true,
      },
      { id: "nature_of_claim", label: "Nature of Claim", help: "Type of claim", type: "select", required: true },
      {
        id: "value_of_claim",
        label: "Value of Claim (₹)",
        help: "Monetary value of claim",
        type: "number",
        required: true,
      },
      {
        id: "facts_of_case",
        label: "Facts of Case",
        help: "Detailed facts of the case",
        type: "textarea",
        required: true,
      },
      {
        id: "relief_sought",
        label: "Relief Sought",
        help: "What relief you are seeking",
        type: "textarea",
        required: true,
      },
      {
        id: "date_of_incident",
        label: "Date of Incident",
        help: "When the incident occurred",
        type: "date",
        required: false,
      },
      { id: "evidence_list", label: "Evidence List", help: "Upload evidence documents", type: "file", required: false },
      {
        id: "verification_declaration",
        label: "I Verify",
        help: "I verify that the above information is true",
        type: "boolean",
        required: true,
      },
    ],
  },
  traffic_fine_appeal: {
    fields: [
      { id: "appellant_name", label: "Appellant Name", help: "Your full legal name", type: "text", required: true },
      {
        id: "appellant_address",
        label: "Appellant Address",
        help: "Your complete address",
        type: "textarea",
        required: true,
      },
      {
        id: "challan_number",
        label: "Challan Number",
        help: "Your traffic fine challan number",
        type: "text",
        required: true,
      },
      {
        id: "vehicle_number",
        label: "Vehicle Number",
        help: "Vehicle registration number",
        type: "text",
        required: true,
      },
      {
        id: "date_of_challan",
        label: "Date of Challan",
        help: "When the challan was issued",
        type: "date",
        required: true,
      },
      {
        id: "offence_details",
        label: "Offence Details",
        help: "Details of the alleged offence",
        type: "textarea",
        required: true,
      },
      {
        id: "explanation",
        label: "Your Explanation",
        help: "Your explanation/defense",
        type: "textarea",
        required: true,
      },
      { id: "police_station", label: "Police Station", help: "Police station name", type: "text", required: false },
      { id: "attachments", label: "Attachments", help: "Upload supporting documents", type: "file", required: false },
    ],
  },
  mutual_divorce_petition: {
    fields: [
      {
        id: "husband_full_name",
        label: "Husband's Full Name",
        help: "Husband's full legal name",
        type: "text",
        required: true,
      },
      { id: "wife_full_name", label: "Wife's Full Name", help: "Wife's full legal name", type: "text", required: true },
      { id: "marriage_date", label: "Marriage Date", help: "Date of marriage", type: "date", required: true },
      {
        id: "marriage_place",
        label: "Place of Marriage",
        help: "Where the marriage took place",
        type: "text",
        required: true,
      },
      {
        id: "residential_address_husband",
        label: "Husband's Address",
        help: "Husband's residential address",
        type: "textarea",
        required: true,
      },
      {
        id: "residential_address_wife",
        label: "Wife's Address",
        help: "Wife's residential address",
        type: "textarea",
        required: true,
      },
      {
        id: "reason_for_divorce",
        label: "Reason for Divorce",
        help: "Reason for seeking divorce",
        type: "textarea",
        required: true,
      },
      {
        id: "mutual_agreement",
        label: "Mutual Agreement",
        help: "Both parties agree to divorce",
        type: "boolean",
        required: true,
      },
      {
        id: "children",
        label: "Children Details",
        help: "Names, DOB, and custody preferences",
        type: "textarea",
        required: false,
      },
      {
        id: "maintenance_terms",
        label: "Maintenance Terms",
        help: "Agreed maintenance terms",
        type: "textarea",
        required: false,
      },
      {
        id: "date_of_affidavit",
        label: "Date of Affidavit",
        help: "Date of this affidavit",
        type: "date",
        required: true,
      },
      {
        id: "attachments",
        label: "Attachments",
        help: "Marriage certificate and IDs required",
        type: "file",
        required: true,
      },
    ],
  },
  affidavit_general: {
    fields: [
      { id: "deponent_name", label: "Deponent Name", help: "Your full legal name", type: "text", required: true },
      { id: "deponent_age", label: "Age", help: "Your age", type: "number", required: true },
      { id: "deponent_address", label: "Address", help: "Your complete address", type: "textarea", required: true },
      {
        id: "statement_text",
        label: "Statement",
        help: "Your statement in first person",
        type: "textarea",
        required: true,
      },
      { id: "place_of_sworn", label: "Place of Sworn", help: "Where this is sworn", type: "text", required: true },
      { id: "date_of_sworn", label: "Date of Sworn", help: "Date of swearing", type: "date", required: true },
      { id: "notary_name", label: "Notary Name", help: "Name of notary public", type: "text", required: false },
      { id: "attachments", label: "Attachments", help: "Supporting documents", type: "file", required: false },
    ],
  },
  name_change_gazette: {
    fields: [
      {
        id: "applicant_full_name",
        label: "Current Full Name",
        help: "Your current full legal name",
        type: "text",
        required: true,
      },
      { id: "new_name", label: "New Name", help: "Your desired new name", type: "text", required: true },
      { id: "previous_name", label: "Previous Name", help: "Any previous names", type: "text", required: true },
      { id: "reason", label: "Reason", help: "Reason for name change", type: "textarea", required: true },
      {
        id: "publication_address",
        label: "Publication Address",
        help: "Address for gazette office",
        type: "textarea",
        required: true,
      },
      {
        id: "proof_of_publication_fee",
        label: "Publication Fee Proof",
        help: "Upload fee payment proof",
        type: "file",
        required: false,
      },
      {
        id: "date_of_application",
        label: "Application Date",
        help: "Date of application",
        type: "date",
        required: true,
      },
    ],
  },
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>("home")
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [formFields, setFormFields] = useState<any[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [trackingId, setTrackingId] = useState<string>("")
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Help and chat state for homepage
  const [showHelpTicket, setShowHelpTicket] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketDescription, setTicketDescription] = useState("")
  const [ticketPriority, setTicketPriority] = useState("medium")
  const [feedbackType, setFeedbackType] = useState("general")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [userTickets, setUserTickets] = useState<any[]>([])
  const [userFeedbacks, setUserFeedbacks] = useState<any[]>([])

  useEffect(() => {
    // Load user data when user is available
    if (user) {
      loadUserTickets()
      loadUserFeedbacks()
      loadChatMessages()
      fetchChatMessagesFromBackend() // Fetch messages from backend
    }
  }, [user, isLoading, router])

  // Help ticket functions
  const loadUserTickets = () => {
    try {
      const savedTickets = localStorage.getItem(`userTickets_${user?.id}`)
      if (savedTickets) {
        const tickets = JSON.parse(savedTickets)
        setUserTickets(tickets)
        console.log("[Homepage] Loaded user tickets:", tickets.length)
      }
    } catch (error) {
      console.error("[Homepage] Error loading user tickets:", error)
    }
  }

  const createHelpTicket = () => {
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
    
    console.log("[Homepage] Help ticket created:", newTicket)
    alert("Help ticket created successfully! Admin will review it soon.")
  }

  // Feedback functions
  const loadUserFeedbacks = () => {
    try {
      const savedFeedbacks = localStorage.getItem(`userFeedbacks_${user?.id}`)
      if (savedFeedbacks) {
        const feedbacks = JSON.parse(savedFeedbacks)
        setUserFeedbacks(feedbacks)
        console.log("[Homepage] Loaded user feedbacks:", feedbacks.length)
      }
    } catch (error) {
      console.error("[Homepage] Error loading user feedbacks:", error)
    }
  }

  const submitFeedback = () => {
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
    
    console.log("[Homepage] Feedback submitted:", newFeedback)
    alert("Feedback submitted successfully! Thank you for your input.")
  }

  // Chat functions
  const loadChatMessages = () => {
    try {
      const savedMessages = localStorage.getItem(`userChatMessages_${user?.id}`)
      if (savedMessages) {
        const messages = JSON.parse(savedMessages)
        setChatMessages(messages)
        console.log("[Homepage] Loaded chat messages from localStorage:", messages.length)
      }
    } catch (error) {
      console.error("[Homepage] Error loading chat messages from localStorage:", error)
    }
  }

  const fetchChatMessagesFromBackend = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log("[Homepage] No token found, skipping backend fetch")
        return
      }

      console.log("[Homepage] Fetching chat messages from backend...")
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
        console.log("[Homepage] Fetched messages from backend:", messages.length)
        
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
        
        console.log("[Homepage] Updated chat messages:", transformedMessages.length)
      } else {
        console.error("[Homepage] Failed to fetch messages from backend:", response.status)
      }
    } catch (error) {
      console.error("[Homepage] Error fetching chat messages from backend:", error)
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
        console.log("[Homepage] Message sent to backend successfully")
        const result = await response.json()
        console.log("[Homepage] Backend response:", result)
        
        // Refresh messages from backend after sending
        await fetchChatMessagesFromBackend()
      } else {
        console.error("[Homepage] Failed to send message to backend:", response.status)
        // Fallback to localStorage if backend fails
      }
    } catch (error) {
      console.error("[Homepage] Error sending message to backend:", error)
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
    console.log("[Homepage] Message sent to admin:", newMessage)
  }

  const handleFormSelect = async (formId: string) => {
    setSelectedFormId(formId)

    try {
      const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      })

      if (response.ok) {
        const formDetails = await response.json()
        setFormFields(formDetails.fields || [])
      } else {
        throw new Error("Backend unavailable")
      }
    } catch (error) {
      console.log("[v0] Backend unavailable, using mock data")
      // Use mock data when backend is not available
      const mockForm = MOCK_FORMS[formId]
      if (mockForm) {
        setFormFields(mockForm.fields)
      } else {
        console.error("Form not found in mock data:", formId)
        return
      }
    }

    setCurrentStep("conversational")
  }

  const handleConversationalComplete = (data: Record<string, string>) => {
    setFormData(data)
    setCurrentStep("review")
  }

  const handleSubmitSuccess = (id: string) => {
    console.log("[Main Page] ========== RECEIVED TRACKING ID ==========")
    console.log("[Main Page] Tracking ID received from ReviewForm:", id)
    console.log("[Main Page] Setting tracking ID in state:", id)
    setTrackingId(id)
    setCurrentStep("submitted")
    // Reset form data after successful submission to prevent data mixing
    setFormData({})
    console.log("[Main Page] Form data reset, tracking ID set to:", id)
  }

  const handleBackHome = () => {
    setCurrentStep("home")
    setSelectedFormId("")
    setFormData({})
    setFormFields([])
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show admin homepage for admin users
  if (user && user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Admin Panel</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Manage all users, submissions, and system operations. Monitor system health and handle user support requests.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/admin")}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-lg"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => router.push("/chat")}
                className="px-8 py-4 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl text-lg border-2 border-red-600"
              >
                User Chats
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Submissions</h3>
              <p className="text-gray-600">Review, approve, or reject all user form submissions in real-time.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">Monitor user accounts, manage permissions, and handle user support.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">System Analytics</h3>
              <p className="text-gray-600">View system performance, user statistics, and operational metrics.</p>
            </div>
          </div>

          {/* Admin Tools Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin Tools</h2>
              <p className="text-lg text-gray-600">System management and debugging tools</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* System Debug */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">System Debug</h3>
                    <p className="text-gray-600">Debug system issues and monitor performance</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Access system logs, debug information, and performance metrics to troubleshoot issues.
                </p>
                <button
                  onClick={() => router.push("/debug-admin-data")}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Debug Tools
                </button>
              </div>

              {/* Data Management */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Data Management</h3>
                    <p className="text-gray-600">Manage system data and user information</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Export user data, manage database, and perform system maintenance operations.
                </p>
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Data Tools
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show user homepage for regular users
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LegalVoice</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Your voice-powered legal form assistant. Submit forms, track status, and manage your legal documents all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-lg"
              >
                View Dashboard
              </button>
              <button
                onClick={() => router.push("/forms")}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl text-lg border-2 border-blue-600"
              >
                Submit New Form
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Submissions</h3>
              <p className="text-gray-600">Monitor the status of all your legal form submissions in real-time.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Voice Forms</h3>
              <p className="text-gray-600">Fill complex legal forms using just your voice in your preferred language.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Notifications</h3>
              <p className="text-gray-600">Receive instant updates when your form status changes.</p>
            </div>
          </div>

          {/* Help & Support Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-lg text-gray-600">Get support for your legal form submissions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Help Tickets */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Help Tickets</h3>
                    <p className="text-gray-600">Report issues with form submissions</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Having trouble with your form submission? Create a help ticket and our support team will assist you.
                </p>
                <button
                  onClick={() => setShowHelpTicket(!showHelpTicket)}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  {showHelpTicket ? 'Hide Help Ticket' : 'Create Help Ticket'}
                </button>
              </div>

              {/* Feedback */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Feedback</h3>
                    <p className="text-gray-600">Share your experience with us</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Help us improve our service by sharing your feedback and suggestions.
                </p>
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {showFeedback ? 'Hide Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>

          {/* Help Ticket Form */}
          {showHelpTicket && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Create Help Ticket</h3>
                </div>
                
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
                  <div className="flex gap-3">
                    <button
                      onClick={createHelpTicket}
                      disabled={!ticketSubject.trim() || !ticketDescription.trim()}
                      className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Create Ticket
                    </button>
                    <button
                      onClick={() => setShowHelpTicket(false)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {showFeedback && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Submit Feedback</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={submitFeedback}
                      disabled={!feedbackMessage.trim()}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Submit Feedback
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Show beautiful landing page for unauthenticated users
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LegalVoice</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Your intelligent legal form assistant powered by AI. Fill complex legal documents using just your voice, 
              track submissions in real-time, and manage your legal documents all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push("/auth")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-lg"
              >
                Get Started
              </button>
              <button
                onClick={() => router.push("/forms")}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl text-lg border-2 border-blue-600"
              >
                View Forms
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h3a1 1 0 110 2h-1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3zM9 4h2v1H9V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Voice-Powered Forms</h3>
              <p className="text-gray-600">Fill complex legal forms using just your voice in your preferred language. No more typing long documents!</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">Monitor the status of all your legal form submissions in real-time with instant notifications.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart AI Assistant</h3>
              <p className="text-gray-600">Get intelligent help with form completion, legal guidance, and document management.</p>
            </div>
          </div>

          {/* Available Forms Section */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Legal Forms</h2>
              <p className="text-lg text-gray-600">Choose from our comprehensive collection of legal forms</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Name Change</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Legal name change applications and declarations</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Property Disputes</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Property dispute petitions and legal notices</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Traffic Appeals</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Traffic fine appeals and challan disputes</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Divorce Petitions</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Mutual divorce petitions and legal proceedings</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Affidavits</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">General affidavits and sworn statements</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Gazette Publications</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Name change gazette publications</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of users who have simplified their legal document process</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/auth")}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 text-lg"
              >
                Sign Up Now
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg"
              >
                Contact Us
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {currentStep === "home" && <FormChooser onSelectForm={handleFormSelect} />}

          {currentStep === "conversational" && (
            <ConversationalFormFiller
              formId={selectedFormId}
              fields={formFields}
              onComplete={handleConversationalComplete}
              onBack={handleBackHome}
            />
          )}

          {currentStep === "review" && (
            <>
              {console.log("[Main Page] Passing formData to ReviewForm:", formData)}
              {console.log("[Main Page] FormData keys:", Object.keys(formData))}
              {console.log("[Main Page] FormData values:", Object.values(formData))}
              <ReviewForm
                key={selectedFormId}
                formId={selectedFormId}
                transcript={formData}
                onSubmitSuccess={handleSubmitSuccess}
                onBack={() => setCurrentStep("conversational")}
              />
            </>
          )}

          {currentStep === "submitted" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl shadow-xl p-8 text-center border border-border">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Form Submitted Successfully!</h2>
                <p className="text-muted-foreground mb-6">Your legal form has been submitted and is being processed.</p>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
                  <p className="text-sm text-muted-foreground mb-2">Your Tracking ID</p>
                  <p className="text-3xl font-mono font-bold text-blue-600">{trackingId}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-8">
                  Save this ID to track your submission status at any time
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => setCurrentStep("track")}
                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all font-semibold"
                  >
                    Track Status
                  </button>
                  <button
                    onClick={handleBackHome}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Submit Another Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "track" && <Tracker onBack={handleBackHome} />}
        </div>
      </main>
    </>
  )
}

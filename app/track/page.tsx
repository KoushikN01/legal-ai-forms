"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { getTrackingId, getFormTitle, getFormType, findSubmissionByTrackingId } from "@/lib/tracking-utils"

export const dynamic = 'force-dynamic'

interface SubmissionDetails {
  id: string
  trackingId: string
  formTitle: string
  formType: string
  status: string
  submittedAt: string
  updatedAt: string
  adminMessage?: string
  documents?: Array<{
    name: string
    uploadedAt: string
  }>
  formData?: Record<string, string>
}

export default function ViewDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log("[ViewDetails] Component mounted")
    console.log("[ViewDetails] User loading:", isLoading)
    console.log("[ViewDetails] User:", user)
    
    if (!isLoading && !user) {
      console.log("[ViewDetails] No user found, redirecting to auth")
      router.push("/auth")
      return
    }

    // Get tracking ID from URL params
    const trackingId = searchParams.get("id")
    console.log("[ViewDetails] URL search params:", searchParams.toString())
    console.log("[ViewDetails] Tracking ID from URL:", trackingId)
    console.log("[ViewDetails] Full URL:", window.location.href)
    
    if (trackingId) {
      loadSubmissionDetails(trackingId)
    } else {
      setError("No tracking ID provided in URL")
      setLoading(false)
    }
  }, [user, isLoading, router, searchParams])

  const loadSubmissionDetails = async (trackingId: string) => {
    try {
      setLoading(true)
      setError("")

      console.log("[ViewDetails] Looking for tracking ID:", trackingId)

      // Get user from localStorage
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      
      if (!user) {
        setError("User not found. Please log in again.")
        return
      }

      console.log("[ViewDetails] User ID:", user.id)

      let submission = null

      // First, try to find in localStorage submissions
      let savedSubmissions = localStorage.getItem(`userSubmissions_${user.id}`)
      console.log("[ViewDetails] Saved submissions:", savedSubmissions)
      
      // If no submissions found with user ID, try to find by email as backup
      if (!savedSubmissions && user.email) {
        console.log("[ViewDetails] Trying to find submissions by email backup")
        savedSubmissions = localStorage.getItem(`submissions_backup_${user.email}`)
        if (savedSubmissions) {
          console.log("[ViewDetails] Found submissions in email backup")
        }
      }
      
      if (savedSubmissions) {
        const submissions = JSON.parse(savedSubmissions)
        console.log("[ViewDetails] Parsed submissions:", submissions)
        
        // Use utility function to find submission
        submission = findSubmissionByTrackingId(submissions, trackingId)
        
        // If not found, try alternative matching strategies
        if (!submission) {
          console.log("[ViewDetails] Standard matching failed, trying alternative strategies...")
          
          // Try exact string matching
          submission = submissions.find((sub: any) => {
            const subTrackingId = getTrackingId(sub)
            return subTrackingId === trackingId
          })
          
          // Try partial matching
          if (!submission) {
            submission = submissions.find((sub: any) => {
              const subTrackingId = getTrackingId(sub)
              return subTrackingId.includes(trackingId) || trackingId.includes(subTrackingId)
            })
          }
          
          // Try case-insensitive matching
          if (!submission) {
            submission = submissions.find((sub: any) => {
              const subTrackingId = getTrackingId(sub)
              return subTrackingId.toLowerCase() === trackingId.toLowerCase()
            })
          }
        }
      }

      // If not found in localStorage, try backend API
      if (!submission) {
        console.log("[ViewDetails] Not found in localStorage, trying backend API...")
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/track/${trackingId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const backendSubmission = await response.json()
            console.log("[ViewDetails] Found submission in backend:", backendSubmission)
            
            // Form title mapping
            const formTitleMap: Record<string, string> = {
              'name_change_gazette': 'Name Change Gazette Application',
              'mutual_divorce_petition': 'Mutual Divorce Petition',
              'affidavit_general': 'General Affidavit',
              'property_dispute_simple': 'Property Dispute Plaint',
              'traffic_fine_appeal': 'Traffic Fine Appeal',
              'name_change': 'Name Change Affidavit',
              'property_dispute': 'Property Dispute Plaint',
              'probate_petition': 'Probate Petition',
              'caveat_petition': 'Caveat Petition'
            }
            
            const formId = backendSubmission.form_id || backendSubmission.formType || 'unknown'
            const formTitle = formTitleMap[formId] || backendSubmission.formTitle || formId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            
            // Convert backend format to frontend format
            submission = {
              id: backendSubmission._id || backendSubmission.id || backendSubmission.tracking_id,
              trackingId: backendSubmission.tracking_id || backendSubmission.trackingId,
              formTitle: formTitle,
              formType: formId,
              status: backendSubmission.status || 'submitted',
              submittedAt: backendSubmission.created_at || backendSubmission.submittedAt || new Date().toISOString(),
              updatedAt: backendSubmission.updated_at || backendSubmission.updatedAt || new Date().toISOString(),
              adminMessage: backendSubmission.admin_message || backendSubmission.adminMessage,
              documents: backendSubmission.documents || [],
              formData: backendSubmission.data || backendSubmission.formData || {}
            }
          } else {
            console.log("[ViewDetails] Backend API returned error:", response.status)
          }
        } catch (backendError) {
          console.log("[ViewDetails] Backend API error:", backendError)
        }
      }
      
      if (submission) {
        console.log("[ViewDetails] Found submission with formData:", submission.formData)
        console.log("[ViewDetails] FormData keys:", Object.keys(submission.formData || {}))
        console.log("[ViewDetails] FormData values:", Object.values(submission.formData || {}))
        
        setSubmission({
          id: submission.id || '',
          trackingId: getTrackingId(submission),
          formTitle: getFormTitle(submission),
          formType: getFormType(submission),
          status: submission.status || 'submitted',
          submittedAt: submission.submittedAt || new Date().toISOString(),
          updatedAt: submission.updatedAt || new Date().toISOString(),
          adminMessage: submission.adminMessage,
          documents: submission.documents || [],
          formData: submission.formData || {} // Include form data
        })
      } else {
        console.log("[ViewDetails] No submission found in any source")
        
        // Show detailed debug information
        console.log("[ViewDetails] Debug - Looking for:", trackingId)
        if (savedSubmissions) {
          const submissions = JSON.parse(savedSubmissions)
          console.log("[ViewDetails] Debug - Available tracking IDs:", submissions.map((s: any) => getTrackingId(s)))
          console.log("[ViewDetails] Debug - Raw submission data:", submissions)
        }
        
        setError(`Submission with tracking ID "${trackingId}" not found. Please check the tracking ID and try again.`)
      }
    } catch (err) {
      console.error("Error loading submission:", err)
      setError(`Error loading submission details: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "processing":
      case "submitted":
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
      case "submitted":
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading submission details...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : submission ? (
              <div className="space-y-6">
                {/* Main Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{submission.formTitle}</h2>
                      <p className="text-gray-600">Tracking ID: {submission.trackingId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission.status)}
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={async () => {
                        try {
                          console.log("[Track] PDF download - submission:", submission)
                          console.log("[Track] PDF download - tracking ID:", submission.trackingId)
                          console.log("[Track] Form data available:", submission.formData)
                          
                          // Always generate a fresh PDF to avoid blob URL expiration issues
                          console.log("[Track] Generating fresh PDF to avoid blob URL expiration...")
                            // Fallback: Generate new PDF if original not found
                            const { PDFGenerator } = await import('@/lib/pdf-generator')
                            
                            // Get form data from submission or create a basic structure
                            const formData = submission.formData || {}
                            console.log("[Track] Using form data for PDF:", formData)
                            console.log("[Track] Form data keys:", Object.keys(formData))
                            console.log("[Track] Form data values:", Object.values(formData))
                            console.log("[Track] Submission form type:", submission.formType)
                            console.log("[Track] Full submission object:", submission)
                            
                            // Check if form data is empty or has wrong structure
                            if (Object.keys(formData).length === 0) {
                              console.log("[Track] WARNING: Form data is empty!")
                              console.log("[Track] Available submission keys:", Object.keys(submission))
                            }
                            
                            // If no form data, create a basic structure with available info
                            if (Object.keys(formData).length === 0) {
                              console.log("[Track] No form data found, creating basic PDF structure")
                              const basicData = {
                                'Form Title': submission.formTitle,
                                'Form Type': submission.formType,
                                'Status': submission.status,
                                'Submitted At': new Date(submission.submittedAt).toLocaleString(),
                                'Tracking ID': submission.trackingId
                              }
                              
                              const pdf = PDFGenerator.generateFormPDF(
                                submission.formTitle,
                                basicData,
                                submission.trackingId
                              )
                              PDFGenerator.downloadPDF(pdf, `${submission.trackingId}.pdf`)
                            } else {
                            // Use the same styled PDF generation as during form submission
                            try {
                              console.log("[Track] ========== PDF GENERATION DEBUG ==========")
                              console.log("[Track] Form Type:", submission.formType)
                              console.log("[Track] Form Data for PDF:", formData)
                              console.log("[Track] Form Data Keys:", Object.keys(formData))
                              console.log("[Track] Form Data Values:", Object.values(formData))
                              console.log("[Track] Tracking ID:", submission.trackingId)
                              
                              const pdf = await PDFGenerator.generateStyledPDF(
                                submission.formType || 'general_affidavit',
                                formData,
                                submission.trackingId
                              )
                              PDFGenerator.downloadPDF(pdf, `${submission.trackingId}.pdf`)
                              console.log("[Track] Styled PDF generated successfully")
                            } catch (error) {
                              console.error("[Track] Styled PDF generation failed, using legacy:", error)
                              // Fallback to legacy PDF generation
                              console.log("[Track] Using legacy PDF generation with data:", formData)
                              const pdf = PDFGenerator.generateFormPDF(
                                submission.formTitle,
                                formData,
                                submission.trackingId
                              )
                              PDFGenerator.downloadPDF(pdf, `${submission.trackingId}.pdf`)
                            }
                            }
                        } catch (error) {
                          console.error('Error downloading PDF:', error)
                          alert('Error downloading PDF. Please try again.')
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </button>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Dashboard
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Form Type</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {submission.formType.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Submitted</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(submission.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(submission.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {getStatusLabel(submission.status)}
                      </p>
                    </div>
                  </div>

                  {submission.adminMessage && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Admin Message</h3>
                      <p className="text-blue-800">{submission.adminMessage}</p>
                    </div>
                  )}
                </div>

                {/* Form Data Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Form Data
                  </h3>
                  
                  
                  {submission.formData && Object.keys(submission.formData).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(submission.formData).map(([key, value]) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-gray-900 break-words">{value || 'Not provided'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No form data available for this submission.</p>
                    </div>
                  )}
                </div>

                {/* Documents Card */}
                {submission.documents && submission.documents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-6 h-6" />
                      Documents ({submission.documents.length})
                    </h3>
                    <div className="space-y-3">
                      {submission.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-600">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Status Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Form Submitted</p>
                        <p className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${
                          submission.status === 'approved' ? 'bg-green-500' :
                          submission.status === 'rejected' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Status: {getStatusLabel(submission.status)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(submission.updatedAt).toLocaleDateString()} at{" "}
                          {new Date(submission.updatedAt).toLocaleTimeString()}
                        </p>
                        {submission.adminMessage && (
                          <p className="text-sm text-gray-700 mt-1">{submission.adminMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { getSubmissionService, type Submission } from "@/lib/submission-service"
import DocumentUpload from "./document-upload"
import { FileText } from "lucide-react"
import { getTrackingId, getFormTitle, getFormType, findSubmissionByTrackingId } from "@/lib/tracking-utils"

interface TrackerProps {
  onBack: () => void
  initialTrackingId?: string
}

export default function Tracker({ onBack, initialTrackingId }: TrackerProps) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || "")
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      // First try to get from submission service
      const submissionService = getSubmissionService()
      let result = submissionService.getSubmission(trackingId)

      // If not found in service, try localStorage
      if (!result) {
        // Get user from localStorage
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        
        if (user) {
          const savedSubmissions = localStorage.getItem(`userSubmissions_${user.id}`)
          if (savedSubmissions) {
            const submissions = JSON.parse(savedSubmissions)
            const submission = findSubmissionByTrackingId(submissions, trackingId)
            
            if (submission) {
              // Convert localStorage format to Submission format
              result = {
                id: getTrackingId(submission),
                formId: getFormType(submission),
                formTitle: getFormTitle(submission),
                data: submission.formData || {},
                status: submission.status,
                submittedAt: new Date(submission.submittedAt),
                updatedAt: new Date(submission.updatedAt),
                events: [
                  {
                    timestamp: new Date(submission.submittedAt),
                    status: 'submitted',
                    message: 'Form submitted successfully'
                  },
                  {
                    timestamp: new Date(submission.updatedAt),
                    status: submission.status,
                    message: submission.adminMessage || `Status updated to ${submission.status}`
                  }
                ],
                notificationsSent: ['email']
              }
            }
          }
        }
      }

      if (!result) {
        setError("Tracking ID not found. Please check and try again.")
        setSubmission(null)
      } else {
        setSubmission(result)
        const docs = JSON.parse(localStorage.getItem(`documents_${trackingId}`) || "[]")
        setUploadedDocs(docs)
      }
    } catch (err) {
      console.error("Error tracking:", err)
      setError("Error retrieving submission. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Auto-track when initial tracking ID is provided
  useEffect(() => {
    if (initialTrackingId && initialTrackingId.trim()) {
      handleTrack()
    }
  }, [initialTrackingId])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-green-600"
      case "processing":
      case "submitted":
        return "text-blue-600"
      case "under_review":
        return "text-yellow-600"
      case "rejected":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Track Your Submission</h2>

        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">Tracking ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => {
                setTrackingId(e.target.value)
                setError("")
              }}
              placeholder="Enter your tracking ID (e.g., TRK1234567890)"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
            >
              {loading ? "Tracking..." : "Track"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {submission && (
          <div className="space-y-6">
            <div className="bg-background rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tracking ID</p>
                  <p className="text-lg font-mono font-bold text-foreground">{submission.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(submission.status)}`}>
                    {getStatusLabel(submission.status)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Form Type</p>
                  <p className="text-foreground font-medium">{submission.formTitle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="text-foreground font-medium">{submission.submittedAt.toLocaleDateString()}</p>
                </div>
              </div>
              {submission.notificationsSent.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Notifications sent via:</p>
                  <div className="flex gap-2">
                    {submission.notificationsSent.map((type) => (
                      <span key={type} className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {type.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {uploadedDocs.length > 0 && (
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Uploaded Documents ({uploadedDocs.length})
                </h3>
                <div className="space-y-2">
                  {uploadedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showDocumentUpload && (
              <button
                onClick={() => setShowDocumentUpload(true)}
                className="w-full px-6 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium"
              >
                Upload Supporting Documents
              </button>
            )}

            {showDocumentUpload && (
              <DocumentUpload
                trackingId={trackingId}
                onUploadComplete={() => {
                  setShowDocumentUpload(false)
                  handleTrack()
                }}
              />
            )}

            <div>
              <h3 className="font-semibold text-foreground mb-4">Status History</h3>
              <div className="space-y-3">
                {submission.events.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(event.status).replace("text-", "bg-")}`}
                      ></div>
                      {idx < submission.events.length - 1 && <div className="w-0.5 h-12 bg-border mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">{event.message}</p>
                      {event.details && <p className="text-xs text-muted-foreground mt-1">{event.details}</p>}
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full mt-8 px-6 py-2 text-muted-foreground hover:text-foreground transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

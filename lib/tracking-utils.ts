// Tracking ID Utility Functions
// Provides consistent handling of tracking IDs across the application

export interface TrackingSubmission {
  id?: string
  trackingId?: string
  tracking_id?: string
  formTitle?: string
  form_id?: string
  formType?: string
  status?: string
  submittedAt?: string
  updatedAt?: string
  adminMessage?: string
  documents?: any[]
  formData?: Record<string, string>
}

/**
 * Get the tracking ID from a submission object, handling both field name variations
 */
export function getTrackingId(submission: TrackingSubmission): string {
  return submission.trackingId || submission.tracking_id || submission.id || ''
}

/**
 * Get the form title from a submission object, handling both field name variations
 */
export function getFormTitle(submission: TrackingSubmission): string {
  return submission.formTitle || submission.form_id || 'Unknown Form'
}

/**
 * Get the form type from a submission object, handling both field name variations
 */
export function getFormType(submission: TrackingSubmission): string {
  return submission.formType || submission.form_id || 'Unknown'
}

/**
 * Normalize a submission object to have consistent field names
 */
export function normalizeSubmission(submission: TrackingSubmission): TrackingSubmission {
  return {
    ...submission,
    trackingId: getTrackingId(submission),
    formTitle: getFormTitle(submission),
    formType: getFormType(submission)
  }
}

/**
 * Find a submission by tracking ID in an array of submissions
 */
export function findSubmissionByTrackingId(
  submissions: TrackingSubmission[], 
  trackingId: string
): TrackingSubmission | undefined {
  console.log("[TrackingUtils] Looking for tracking ID:", trackingId)
  console.log("[TrackingUtils] Available submissions:", submissions.map(s => ({
    id: s.id,
    trackingId: getTrackingId(s),
    formTitle: getFormTitle(s)
  })))
  
  const found = submissions.find(submission => {
    const submissionTrackingId = getTrackingId(submission)
    console.log("[TrackingUtils] Comparing:", { 
      searchId: trackingId, 
      submissionId: submissionTrackingId,
      exactMatch: submissionTrackingId === trackingId
    })
    
    // Try exact match first
    if (submissionTrackingId === trackingId) {
      console.log("[TrackingUtils] Exact match found!")
      return true
    }
    
    // Try case-insensitive match
    if (submissionTrackingId.toLowerCase() === trackingId.toLowerCase()) {
      console.log("[TrackingUtils] Case-insensitive match found!")
      return true
    }
    
    // Try partial match for different ID formats
    if (submissionTrackingId.includes(trackingId) || trackingId.includes(submissionTrackingId)) {
      console.log("[TrackingUtils] Partial match found!")
      return true
    }
    
    // Only try exact matches - no timestamp-based matching to avoid wrong submissions
    console.log("[TrackingUtils] No exact match found for:", trackingId)
    
    return false
  })
  
  console.log("[TrackingUtils] Found submission:", found ? "Yes" : "No")
  return found
}

/**
 * Check if a tracking ID matches a submission (case-insensitive, partial match)
 */
export function matchesTrackingId(submission: TrackingSubmission, searchTerm: string): boolean {
  const submissionTrackingId = getTrackingId(submission)
  const formTitle = getFormTitle(submission)
  
  return submissionTrackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         formTitle.toLowerCase().includes(searchTerm.toLowerCase())
}

/**
 * Generate a standardized tracking ID
 */
export function generateTrackingId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase()
  return `TRK${dateStr}-${randomStr}`
}

/**
 * Validate tracking ID format
 */
export function isValidTrackingId(trackingId: string): boolean {
  // TRK format: TRKYYYYMMDD-XXXXXXXX
  const pattern = /^TRK\d{8}-[A-Z0-9]{8}$/
  return pattern.test(trackingId)
}

/**
 * Extract date from tracking ID
 */
export function extractDateFromTrackingId(trackingId: string): Date | null {
  const match = trackingId.match(/^TRK(\d{8})-/)
  if (match) {
    const dateStr = match[1]
    const year = parseInt(dateStr.slice(0, 4))
    const month = parseInt(dateStr.slice(4, 6)) - 1 // Month is 0-indexed
    const day = parseInt(dateStr.slice(6, 8))
    return new Date(year, month, day)
  }
  return null
}

/**
 * Get tracking ID display text with formatting
 */
export function getTrackingIdDisplay(trackingId: string): string {
  if (!trackingId) return 'No Tracking ID'
  return trackingId.toUpperCase()
}

/**
 * Copy tracking ID to clipboard
 */
export async function copyTrackingIdToClipboard(trackingId: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(trackingId)
    return true
  } catch (error) {
    console.error('Failed to copy tracking ID to clipboard:', error)
    return false
  }
}

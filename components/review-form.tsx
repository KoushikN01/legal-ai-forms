"use client"

import { useState, useEffect } from "react"
import { FormValidator, FormMapper, type FormField } from "@/lib/form-mapper"
import { PDFGenerator } from "@/lib/pdf-generator"
import { Download, CheckCircle2 } from "lucide-react"

interface ReviewFormProps {
  formId: string
  transcript: Record<string, string>
  onSubmitSuccess: (trackingId: string) => void
  onBack: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const MOCK_FORMS: Record<string, any> = {
  name_change: {
    _id: "name_change",
    title: "Name Change Affidavit",
    fields: [
      {
        id: "applicant_full_name",
        label: "Full Name",
        type: "text",
        required: true,
        help: "Your current full legal name",
      },
      { id: "applicant_age", label: "Age", type: "number", required: true, help: "Your age" },
      {
        id: "applicant_father_name",
        label: "Father's Name",
        type: "text",
        required: true,
        help: "Your father's full name",
      },
      {
        id: "current_address",
        label: "Current Address",
        type: "textarea",
        required: true,
        help: "Your complete residential address with pincode",
      },
      { id: "previous_name", label: "Previous Name", type: "text", required: true, help: "Your old/previous name" },
      { id: "new_name", label: "New Name", type: "text", required: true, help: "Your desired new name" },
      {
        id: "reason",
        label: "Reason for Change",
        type: "textarea",
        required: true,
        help: "Why you want to change your name",
      },
      {
        id: "date_of_declaration",
        label: "Date of Declaration",
        type: "date",
        required: true,
        help: "Date of this declaration",
      },
      { id: "place", label: "Place", type: "text", required: true, help: "Place where this declaration is made" },
      { id: "id_proof_type", label: "ID Proof Type", type: "select", required: true, help: "Type of ID proof" },
      { id: "id_proof_number", label: "ID Proof Number", type: "text", required: true, help: "Your ID proof number" },
    ],
  },
  property_dispute_simple: {
    _id: "property_dispute_simple",
    title: "Property Dispute Plaint",
    fields: [
      { id: "plaintiff_name", label: "Plaintiff Name", type: "text", required: true, help: "Your full legal name" },
      {
        id: "plaintiff_address",
        label: "Plaintiff Address",
        type: "textarea",
        required: true,
        help: "Your complete address with pincode",
      },
      {
        id: "defendant_name",
        label: "Defendant Name",
        type: "text",
        required: true,
        help: "Defendant full legal name",
      },
      {
        id: "defendant_address",
        label: "Defendant Address",
        type: "textarea",
        required: true,
        help: "Defendant complete address",
      },
      {
        id: "property_description",
        label: "Property Description",
        type: "textarea",
        required: true,
        help: "Location, survey number, or address of property",
      },
      { id: "nature_of_claim", label: "Nature of Claim", type: "select", required: true, help: "Type of claim" },
      {
        id: "value_of_claim",
        label: "Value of Claim (₹)",
        type: "number",
        required: true,
        help: "Monetary value of claim",
      },
      {
        id: "facts_of_case",
        label: "Facts of Case",
        type: "textarea",
        required: true,
        help: "Detailed facts of the case",
      },
      {
        id: "relief_sought",
        label: "Relief Sought",
        type: "textarea",
        required: true,
        help: "What relief you are seeking",
      },
      {
        id: "date_of_incident",
        label: "Date of Incident",
        type: "date",
        required: false,
        help: "When the incident occurred",
      },
      { id: "evidence_list", label: "Evidence List", type: "file", required: false, help: "Upload evidence documents" },
      {
        id: "verification_declaration",
        label: "I Verify",
        type: "boolean",
        required: true,
        help: "I verify that the above information is true",
      },
    ],
  },
  traffic_fine_appeal: {
    _id: "traffic_fine_appeal",
    title: "Traffic Fine Appeal",
    fields: [
      { id: "appellant_name", label: "Appellant Name", type: "text", required: true, help: "Your full legal name" },
      {
        id: "appellant_address",
        label: "Appellant Address",
        type: "textarea",
        required: true,
        help: "Your complete address",
      },
      {
        id: "challan_number",
        label: "Challan Number",
        type: "text",
        required: true,
        help: "Your traffic fine challan number",
      },
      {
        id: "vehicle_number",
        label: "Vehicle Number",
        type: "text",
        required: true,
        help: "Vehicle registration number",
      },
      {
        id: "date_of_challan",
        label: "Date of Challan",
        type: "date",
        required: true,
        help: "When the challan was issued",
      },
      {
        id: "offence_details",
        label: "Offence Details",
        type: "textarea",
        required: true,
        help: "Details of the alleged offence",
      },
      {
        id: "explanation",
        label: "Your Explanation",
        type: "textarea",
        required: true,
        help: "Your explanation/defense",
      },
      { id: "police_station", label: "Police Station", type: "text", required: false, help: "Police station name" },
      { id: "attachments", label: "Attachments", type: "file", required: false, help: "Upload supporting documents" },
    ],
  },
  mutual_divorce_petition: {
    _id: "mutual_divorce_petition",
    title: "Mutual Divorce Petition",
    fields: [
      {
        id: "husband_full_name",
        label: "Husband's Full Name",
        type: "text",
        required: true,
        help: "Husband's full legal name",
      },
      { id: "wife_full_name", label: "Wife's Full Name", type: "text", required: true, help: "Wife's full legal name" },
      { id: "marriage_date", label: "Marriage Date", type: "date", required: true, help: "Date of marriage" },
      {
        id: "marriage_place",
        label: "Place of Marriage",
        type: "text",
        required: true,
        help: "Where the marriage took place",
      },
      {
        id: "residential_address_husband",
        label: "Husband's Address",
        type: "textarea",
        required: true,
        help: "Husband's residential address",
      },
      {
        id: "residential_address_wife",
        label: "Wife's Address",
        type: "textarea",
        required: true,
        help: "Wife's residential address",
      },
      {
        id: "reason_for_divorce",
        label: "Reason for Divorce",
        type: "textarea",
        required: true,
        help: "Reason for seeking divorce",
      },
      {
        id: "mutual_agreement",
        label: "Mutual Agreement",
        type: "boolean",
        required: true,
        help: "Both parties agree to divorce",
      },
      {
        id: "children",
        label: "Children Details",
        type: "textarea",
        required: false,
        help: "Names, DOB, and custody preferences",
      },
      {
        id: "maintenance_terms",
        label: "Maintenance Terms",
        type: "textarea",
        required: false,
        help: "Agreed maintenance terms",
      },
      {
        id: "date_of_affidavit",
        label: "Date of Affidavit",
        type: "date",
        required: true,
        help: "Date of this affidavit",
      },
      {
        id: "attachments",
        label: "Attachments",
        type: "file",
        required: true,
        help: "Marriage certificate and IDs required",
      },
    ],
  },
  affidavit_general: {
    _id: "affidavit_general",
    title: "General Affidavit",
    fields: [
      { id: "deponent_name", label: "Deponent Name", type: "text", required: true, help: "Your full legal name" },
      { id: "deponent_age", label: "Age", type: "number", required: true, help: "Your age" },
      { id: "deponent_address", label: "Address", type: "textarea", required: true, help: "Your complete address" },
      {
        id: "statement_text",
        label: "Statement",
        type: "textarea",
        required: true,
        help: "Your statement in first person",
      },
      { id: "place_of_sworn", label: "Place of Sworn", type: "text", required: true, help: "Where this is sworn" },
      { id: "date_of_sworn", label: "Date of Sworn", type: "date", required: true, help: "Date of swearing" },
      { id: "notary_name", label: "Notary Name", type: "text", required: false, help: "Name of notary public" },
      { id: "attachments", label: "Attachments", type: "file", required: false, help: "Supporting documents" },
    ],
  },
  name_change_gazette: {
    _id: "name_change_gazette",
    title: "Name Change Gazette Application",
    fields: [
      {
        id: "applicant_full_name",
        label: "Current Full Name",
        type: "text",
        required: true,
        help: "Your current full legal name",
      },
      { id: "new_name", label: "New Name", type: "text", required: true, help: "Your desired new name" },
      { id: "previous_name", label: "Previous Name", type: "text", required: true, help: "Any previous names" },
      { id: "reason", label: "Reason", type: "textarea", required: true, help: "Reason for name change" },
      {
        id: "publication_address",
        label: "Publication Address",
        type: "textarea",
        required: true,
        help: "Address for gazette office",
      },
      {
        id: "proof_of_publication_fee",
        label: "Publication Fee Proof",
        type: "file",
        required: false,
        help: "Upload fee payment proof",
      },
      {
        id: "date_of_application",
        label: "Application Date",
        type: "date",
        required: true,
        help: "Date of application",
      },
    ],
  },
}

export default function ReviewForm({ formId, transcript, onSubmitSuccess, onBack }: ReviewFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [fields, setFields] = useState<FormField[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [validator] = useState(() => new FormValidator())
  const [mapper] = useState(() => new FormMapper())
  const [allFieldsConfirmed, setAllFieldsConfirmed] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

  const saveSubmissionToDashboard = (trackingId: string, formId: string, formTitle: string, formData: Record<string, string>) => {
    try {
      console.log("[Dashboard] ========== SAVING SUBMISSION ==========")
      console.log("[Dashboard] Tracking ID:", trackingId)
      console.log("[Dashboard] Form ID:", formId)
      console.log("[Dashboard] Form Title:", formTitle)
      console.log("[Dashboard] Form Data Received:", formData)
      console.log("[Dashboard] Form Data Keys:", Object.keys(formData))
      console.log("[Dashboard] Form Data Values:", Object.values(formData))
      console.log("[Dashboard] Form Data Type:", typeof formData)
      
      // Get current user
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      
      console.log("[Dashboard] User from localStorage:", user)
      
      if (!user) {
        console.error("[Dashboard] No user found in localStorage")
        return
      }

      // Create submission object
      console.log("[Dashboard] Saving form data to submission:", {
        trackingId,
        formId,
        formTitle,
        formDataKeys: Object.keys(formData),
        formDataValues: Object.values(formData),
        formDataLength: Object.keys(formData).length
      })
      
      const submission = {
        id: Date.now().toString(),
        trackingId,
        formTitle,
        formType: formId,
        formData: { ...formData }, // Store a copy of the actual form data
        status: "submitted",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminMessage: "",
        documents: Object.values(uploadedFiles).map(file => ({
          name: file.name,
          uploadedAt: new Date().toISOString()
        }))
      }
      
      console.log("[Dashboard] Submission object created:", {
        id: submission.id,
        trackingId: submission.trackingId,
        formTitle: submission.formTitle,
        formType: submission.formType,
        formDataKeys: Object.keys(submission.formData),
        formDataCount: Object.keys(submission.formData).length
      })

      // Get existing submissions
      const storageKey = `userSubmissions_${user.id}`
      const existingSubmissions = JSON.parse(localStorage.getItem(storageKey) || "[]")
      
      console.log("[Dashboard] Existing submissions:", existingSubmissions.length)
      console.log("[Dashboard] Storage key:", storageKey)
      
      // Add new submission
      existingSubmissions.unshift(submission)
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(existingSubmissions))
      
      // Also create a backup with email as key for data recovery
      if (user.email) {
        const backupKey = `submissions_backup_${user.email}`
        localStorage.setItem(backupKey, JSON.stringify(existingSubmissions))
        console.log("[Dashboard] Created backup with email key:", backupKey)
      }
      
      console.log("[Dashboard] Submission saved to user dashboard:", submission)
      console.log("[Dashboard] Total submissions now:", existingSubmissions.length)
    } catch (error) {
      console.error("[Dashboard] Error saving submission:", error)
    }
  }

  useEffect(() => {
    console.log("[ReviewForm] useEffect triggered with formId:", formId)
    console.log("[ReviewForm] useEffect triggered with transcript:", transcript)
    console.log("[ReviewForm] Transcript keys:", transcript ? Object.keys(transcript) : 'null')
    loadFormAndInterpret()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId, transcript])

  const loadFormAndInterpret = async () => {
    setIsLoading(true)
    console.log("[v0] Loading form and processing form data...")

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      let formSchema

      try {
        // Try to fetch from backend
        const formResponse = await fetch(`${API_BASE_URL}/forms/${formId}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (formResponse.ok) {
          formSchema = await formResponse.json()
          console.log("[v0] Loaded form from backend")
        }
      } catch (fetchError) {
        console.log("[v0] Backend unavailable, using mock data")
      }

      if (!formSchema) {
        formSchema = MOCK_FORMS[formId]
        if (!formSchema) {
          throw new Error("Form not found")
        }
        console.log("[v0] Using mock form schema")
      }

      const formFields: FormField[] = formSchema.fields.map((f: any) => ({
        id: f.id,
        label: f.label,
        help: f.help || "",
        type: f.type || "text",
        required: f.required || false,
        validationRules: [],
      }))

      setFields(formFields)

      // Use the form data directly instead of parsing JSON
      console.log("[v0] Using form data directly:", transcript)
      console.log("[v0] Form data keys:", Object.keys(transcript))
      console.log("[v0] Form data values:", Object.values(transcript))
      console.log("[v0] Form data type:", typeof transcript)
      // Create a deep copy to prevent reference sharing
      setFormData({ ...transcript })

      // Check for missing required fields
      const missing = formFields.filter((f) => f.required && !transcript[f.id]).map((f) => f.id)
      setMissingFields(missing)

      console.log("[v0] Form loaded successfully")
    } catch (error) {
      console.error("[v0] Error loading form:", error)
      alert("Error loading form. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => ({ ...prev, [fieldId]: "" }))

    // Remove from missing fields if user fills it
    if (missingFields.includes(fieldId) && value.trim()) {
      setMissingFields((prev) => prev.filter((f) => f !== fieldId))
    }
  }

  const handleFileUpload = async (fieldId: string, file: File) => {
    setUploadedFiles((prev) => ({ ...prev, [fieldId]: file }))

    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "legal_docs")

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          },
        )

        const data = await response.json()
        handleFieldChange(fieldId, data.secure_url)
        console.log("[v0] File uploaded to Cloudinary:", data.secure_url)
      } catch (error) {
        console.error("[v0] Error uploading to Cloudinary:", error)
        handleFieldChange(fieldId, file.name)
      }
    } else {
      handleFieldChange(fieldId, file.name)
    }
  }

  const handleDownloadPDF = async () => {
    const formTitle = MOCK_FORMS[formId]?.title || "Legal Form"
    const trackingId = `TEMP-${Date.now()}`
    
    try {
      // Try to use the new styled PDF generation
      const pdf = await PDFGenerator.generateStyledPDF(formId, formData, trackingId)
      PDFGenerator.downloadPDF(pdf, `${formId}_${trackingId}.pdf`)
    } catch (error) {
      console.error("Error generating styled PDF, falling back to legacy:", error)
      // Fallback to legacy PDF generation
      const pdf = PDFGenerator.generateFormPDF(formTitle, formData, trackingId)
      PDFGenerator.downloadPDF(pdf, `${formId}_${trackingId}.pdf`)
    }
  }

  const handleSubmit = async () => {
    if (!allFieldsConfirmed) {
      alert("Please confirm that all fields are correct before submitting.")
      return
    }

    console.log("[ReviewForm] ========== SUBMITTING FORM ==========")
    console.log("[ReviewForm] Current formData state at submit:", formData)
    console.log("[ReviewForm] FormData keys at submit:", Object.keys(formData))
    console.log("[ReviewForm] FormData values at submit:", Object.values(formData))
    console.log("[ReviewForm] FormData type:", typeof formData)
    
    setIsSubmitting(true)
    try {
      let validationResult

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        // Import apiClient for validation
        const { apiClient } = await import("@/lib/api-client")
        
        const validationResult = await apiClient.post("/validate", {
          form_id: formId,
          filled_data: formData,
        })
        clearTimeout(timeoutId)

        console.log("[v0] Validated with backend")
      } catch (fetchError) {
        console.log("[v0] Backend unavailable, using client-side validation")
      }

      if (!validationResult) {
        const clientErrors = validator.validateForm(formData, fields)
        validationResult = {
          valid: Object.keys(clientErrors).length === 0,
          errors: Object.entries(clientErrors).map(([field, message]) => ({
            field,
            message,
          })),
        }
        console.log("[v0] Used client-side validation")
      }

      if (!validationResult.valid && validationResult.errors) {
        const newErrors: Record<string, string> = {}
        validationResult.errors.forEach((err: any) => {
          newErrors[err.field] = err.message
        })
        setErrors(newErrors)
        setIsSubmitting(false)
        return
      }

      // Get user from localStorage
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const userId = user?.id || "anonymous"

      let submitResult

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        // Import apiClient at the top of the file
        const { apiClient } = await import("@/lib/api-client")
        
        const submitResult = await apiClient.post("/submit", {
          form_id: formId,
          filled_data: formData,
          user_id: userId,
        })
        clearTimeout(timeoutId)

        console.log("[v0] Submitted to backend")
      } catch (fetchError) {
        console.log("[v0] Backend unavailable, generating mock tracking ID")
      }

      if (!submitResult) {
        // Generate tracking ID in the same format as backend
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
        const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase()
        const mockTrackingId = `TRK${dateStr}-${randomStr}`
        submitResult = { tracking_id: mockTrackingId }
        console.log("[ReviewForm] ========== GENERATING TRACKING ID ==========")
        console.log("[ReviewForm] Generated mock tracking ID:", mockTrackingId)
        console.log("[ReviewForm] Date string:", dateStr)
        console.log("[ReviewForm] Random string:", randomStr)
        console.log("[ReviewForm] Full tracking ID:", mockTrackingId)
      }

      if (submitResult) {
        const formTitle = MOCK_FORMS[formId]?.title || "Legal Form"
        let originalPDFBlob = null
        
        console.log("[ReviewForm] Processing submission with tracking ID:", submitResult.tracking_id)
        console.log("[ReviewForm] Form data for PDF:", formData)
        
        try {
          // Try to use the new styled PDF generation
          const pdf = await PDFGenerator.generateStyledPDF(formId, formData, submitResult.tracking_id)
          originalPDFBlob = PDFGenerator.getPDFBlob(pdf)
          PDFGenerator.downloadPDF(pdf, `${formId}_${submitResult.tracking_id}.pdf`)
          console.log("[ReviewForm] Styled PDF generated successfully")
        } catch (error) {
          console.error("Error generating styled PDF, falling back to legacy:", error)
          // Fallback to legacy PDF generation
          const pdf = PDFGenerator.generateFormPDF(formTitle, formData, submitResult.tracking_id)
          originalPDFBlob = PDFGenerator.getPDFBlob(pdf)
          PDFGenerator.downloadPDF(pdf, `${formId}_${submitResult.tracking_id}.pdf`)
          console.log("[ReviewForm] Legacy PDF generated successfully")
        }

        // Store the original PDF for later retrieval
        if (originalPDFBlob) {
          const pdfUrl = URL.createObjectURL(originalPDFBlob)
          const pdfStorageKey = `original_pdf_${submitResult.tracking_id}`
          localStorage.setItem(pdfStorageKey, pdfUrl)
          console.log("[ReviewForm] PDF storage debug:")
          console.log("[ReviewForm] - Tracking ID used for storage:", submitResult.tracking_id)
          console.log("[ReviewForm] - PDF storage key:", pdfStorageKey)
          console.log("[ReviewForm] - PDF URL created:", pdfUrl)
          console.log("[ReviewForm] - PDF stored successfully:", !!localStorage.getItem(pdfStorageKey))
          
          // Clean up old PDF URLs to prevent memory leaks
          const allKeys = Object.keys(localStorage)
          const pdfKeys = allKeys.filter(key => key.startsWith('original_pdf_'))
          if (pdfKeys.length > 10) { // Keep only last 10 PDFs
            const sortedKeys = pdfKeys.sort((a, b) => {
              const aTime = parseInt(a.split('_')[2] || '0')
              const bTime = parseInt(b.split('_')[2] || '0')
              return aTime - bTime
            })
            // Remove oldest PDFs
            for (let i = 0; i < pdfKeys.length - 10; i++) {
              const oldUrl = localStorage.getItem(sortedKeys[i])
              if (oldUrl) {
                URL.revokeObjectURL(oldUrl)
              }
              localStorage.removeItem(sortedKeys[i])
            }
          }
        }

        // Save submission to user's dashboard
        console.log("[ReviewForm] ========== SAVING TO DASHBOARD ==========")
        console.log("[ReviewForm] About to save submission to dashboard:", {
          trackingId: submitResult.tracking_id,
          formId,
          formTitle,
          formData
        })
        console.log("[ReviewForm] Form data structure debug:")
        console.log("[ReviewForm] - Form data keys:", Object.keys(formData))
        console.log("[ReviewForm] - Form data values:", Object.values(formData))
        console.log("[ReviewForm] - Form data type:", typeof formData)
        console.log("[ReviewForm] - Form data length:", Object.keys(formData).length)
        console.log("[ReviewForm] Calling saveSubmissionToDashboard...")
        saveSubmissionToDashboard(submitResult.tracking_id, formId, formTitle, formData)
        console.log("[ReviewForm] saveSubmissionToDashboard completed")
      }

      console.log("[ReviewForm] ========== CALLING onSubmitSuccess ==========")
      console.log("[ReviewForm] Tracking ID being passed to onSubmitSuccess:", submitResult.tracking_id)
      onSubmitSuccess(submitResult.tracking_id)
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      alert("Error submitting form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Processing your transcript with AI...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Information</h2>
        <p className="text-muted-foreground mb-4">Please review and edit the AI-extracted information</p>

        {missingFields.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Some fields could not be extracted from your recording. Please fill them manually.
            </p>
          </div>
        )}

        <div className="space-y-6 mb-8">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-foreground mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {missingFields.includes(field.id) && (
                  <span className="ml-2 text-xs text-yellow-600">(Not detected - please fill)</span>
                )}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.help}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    errors[field.id]
                      ? "border-red-500 bg-red-50/10"
                      : missingFields.includes(field.id)
                        ? "border-yellow-400 bg-yellow-50/10"
                        : "border-border bg-background hover:border-primary/50 focus:border-primary"
                  } text-foreground placeholder-muted-foreground focus:outline-none`}
                />
              ) : field.type === "file" ? (
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(field.id, file)
                    }}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      errors[field.id]
                        ? "border-red-500 bg-red-50/10"
                        : missingFields.includes(field.id)
                          ? "border-yellow-400 bg-yellow-50/10"
                          : "border-border bg-background hover:border-primary/50 focus:border-primary"
                    } text-foreground placeholder-muted-foreground focus:outline-none`}
                  />
                  {uploadedFiles[field.id] && (
                    <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles[field.id].name} uploaded</p>
                  )}
                </div>
              ) : field.type === "boolean" ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[field.id] === "true"}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked.toString())}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm">{field.help}</span>
                </div>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.help}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    errors[field.id]
                      ? "border-red-500 bg-red-50/10"
                      : missingFields.includes(field.id)
                        ? "border-yellow-400 bg-yellow-50/10"
                        : "border-border bg-background hover:border-primary/50 focus:border-primary"
                  } text-foreground placeholder-muted-foreground focus:outline-none`}
                />
              )}
              {errors[field.id] && <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>}
              <p className="text-xs text-muted-foreground mt-1">{field.help}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-all-fields"
              checked={allFieldsConfirmed}
              onChange={(e) => setAllFieldsConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <label htmlFor="confirm-all-fields" className="text-sm text-foreground cursor-pointer">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />I confirm that all the information provided above is
              accurate and complete to the best of my knowledge.
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Preview PDF
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !allFieldsConfirmed}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </button>
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/90 transition font-medium disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

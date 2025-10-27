"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import FormChooser from "@/components/form-chooser"
import ConversationalFormFiller from "@/components/conversational-form-filler"
import AIFormFiller from "@/components/ai-form-filler"
import ReviewForm from "@/components/review-form"
import Tracker from "@/components/tracker"
import { useAuth } from "@/lib/auth-context"

type AppStep = "home" | "conversational" | "ai-fill" | "review" | "submitted" | "track"

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

export default function FormsPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>("home")
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [formFields, setFormFields] = useState<any[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [trackingId, setTrackingId] = useState<string>("")
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if not loading and no user
    if (!isLoading && !user) {
      console.log("❌ No user found, redirecting to auth")
      router.push("/auth")
    }
  }, [user, isLoading, router])

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

  const handleAIFill = async (formId: string) => {
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

    setCurrentStep("ai-fill")
  }

  const handleConversationalComplete = (data: Record<string, string>) => {
    setFormData(data)
    setCurrentStep("review")
  }

  const handleSubmitSuccess = (id: string) => {
    setTrackingId(id)
    setCurrentStep("submitted")
  }

  const handleBackHome = () => {
    setCurrentStep("home")
    setSelectedFormId("")
    setFormData({})
    setFormFields([])
  }

  // Show loading state while checking auth
  if (isLoading || !user) {
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
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {currentStep === "home" && <FormChooser onSelectForm={handleFormSelect} onAIFill={handleAIFill} />}

          {currentStep === "conversational" && (
            <ConversationalFormFiller
              formId={selectedFormId}
              fields={formFields}
              onComplete={handleConversationalComplete}
              onBack={handleBackHome}
            />
          )}

          {currentStep === "ai-fill" && (
            <AIFormFiller
              formId={selectedFormId}
              onComplete={handleConversationalComplete}
              onBack={handleBackHome}
            />
          )}

          {currentStep === "review" && (
            <ReviewForm
              formId={selectedFormId}
              transcript={formData}
              onSubmitSuccess={handleSubmitSuccess}
              onBack={() => setCurrentStep("conversational")}
            />
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
                  <p className="text-xs text-muted-foreground mt-2">Save this ID to track your submission status</p>
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
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    View Dashboard
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

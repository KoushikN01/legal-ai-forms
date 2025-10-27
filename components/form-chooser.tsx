"use client"

import { useState, useEffect } from "react"
import { ArrowRight, FileText, Shield, Zap } from "lucide-react"

interface Form {
  _id: string
  title: string
  description?: string
  icon?: string
  fields: Array<{ id: string; label: string; help: string }>
}

interface FormChooserProps {
  onSelectForm: (formId: string) => void
  onAIFill?: (formId: string) => void
}

export default function FormChooser({ onSelectForm, onAIFill }: FormChooserProps) {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockForms: Form[] = [
      {
        _id: "name_change",
        title: "Name Change Affidavit",
        description: "Apply for a legal name change with voice guidance",
        icon: "📝",
        fields: [
          { id: "applicant_full_name", label: "Full Name", help: "Your current full legal name" },
          { id: "applicant_age", label: "Age", help: "Your age" },
          { id: "applicant_father_name", label: "Father's Name", help: "Your father's full name" },
          { id: "current_address", label: "Current Address", help: "Your complete address with pincode" },
          { id: "previous_name", label: "Previous Name", help: "Your old/previous name" },
          { id: "new_name", label: "New Name", help: "Your desired new name" },
          { id: "reason", label: "Reason for Change", help: "Why you want to change your name" },
          { id: "date_of_declaration", label: "Date of Declaration", help: "Date of this declaration" },
          { id: "place", label: "Place", help: "Place where declaration is made" },
          { id: "id_proof_type", label: "ID Proof Type", help: "Type of ID proof" },
          { id: "id_proof_number", label: "ID Proof Number", help: "Your ID proof number" },
        ],
      },
      {
        _id: "property_dispute_simple",
        title: "Property Dispute Plaint",
        description: "File a property dispute case with detailed documentation",
        icon: "🏠",
        fields: [
          { id: "plaintiff_name", label: "Plaintiff Name", help: "Your full legal name" },
          { id: "plaintiff_address", label: "Plaintiff Address", help: "Your complete address" },
          { id: "defendant_name", label: "Defendant Name", help: "Defendant full name" },
          { id: "defendant_address", label: "Defendant Address", help: "Defendant address" },
          { id: "property_description", label: "Property Description", help: "Property details" },
          { id: "nature_of_claim", label: "Nature of Claim", help: "Type of claim" },
          { id: "value_of_claim", label: "Value of Claim", help: "Monetary value" },
          { id: "facts_of_case", label: "Facts of Case", help: "Case details" },
          { id: "relief_sought", label: "Relief Sought", help: "What you seek" },
          { id: "date_of_incident", label: "Date of Incident", help: "When it occurred" },
          { id: "evidence_list", label: "Evidence", help: "Supporting documents" },
          { id: "verification_declaration", label: "Verification", help: "I verify this is true" },
        ],
      },
      {
        _id: "traffic_fine_appeal",
        title: "Traffic Fine Appeal",
        description: "Appeal a traffic fine with voice evidence",
        icon: "🚗",
        fields: [
          { id: "appellant_name", label: "Appellant Name", help: "Your full name" },
          { id: "appellant_address", label: "Address", help: "Your address" },
          { id: "challan_number", label: "Challan Number", help: "Fine number" },
          { id: "vehicle_number", label: "Vehicle Number", help: "Registration number" },
          { id: "date_of_challan", label: "Challan Date", help: "When issued" },
          { id: "offence_details", label: "Offence Details", help: "What happened" },
          { id: "explanation", label: "Your Explanation", help: "Your defense" },
          { id: "police_station", label: "Police Station", help: "Station name" },
          { id: "attachments", label: "Attachments", help: "Documents" },
        ],
      },
      {
        _id: "mutual_divorce_petition",
        title: "Mutual Divorce Petition",
        description: "File for mutual divorce proceedings",
        icon: "⚖️",
        fields: [
          { id: "husband_full_name", label: "Husband's Name", help: "Husband's full name" },
          { id: "wife_full_name", label: "Wife's Name", help: "Wife's full name" },
          { id: "marriage_date", label: "Marriage Date", help: "Date of marriage" },
          { id: "marriage_place", label: "Marriage Place", help: "Where married" },
          { id: "residential_address_husband", label: "Husband's Address", help: "Husband's address" },
          { id: "residential_address_wife", label: "Wife's Address", help: "Wife's address" },
          { id: "reason_for_divorce", label: "Reason", help: "Reason for divorce" },
          { id: "mutual_agreement", label: "Mutual Agreement", help: "Both agree" },
          { id: "children", label: "Children Details", help: "Children info" },
          { id: "maintenance_terms", label: "Maintenance", help: "Maintenance terms" },
          { id: "date_of_affidavit", label: "Affidavit Date", help: "Date of affidavit" },
          { id: "attachments", label: "Documents", help: "Required documents" },
        ],
      },
      {
        _id: "affidavit_general",
        title: "General Affidavit",
        description: "Create a general purpose affidavit",
        icon: "📄",
        fields: [
          { id: "deponent_name", label: "Your Name", help: "Your full name" },
          { id: "deponent_age", label: "Age", help: "Your age" },
          { id: "deponent_address", label: "Address", help: "Your address" },
          { id: "statement_text", label: "Statement", help: "Your statement" },
          { id: "place_of_sworn", label: "Place", help: "Where sworn" },
          { id: "date_of_sworn", label: "Date", help: "Date of swearing" },
          { id: "notary_name", label: "Notary Name", help: "Notary name" },
          { id: "attachments", label: "Attachments", help: "Documents" },
        ],
      },
      {
        _id: "name_change_gazette",
        title: "Name Change Gazette",
        description: "Apply for name change through gazette",
        icon: "📰",
        fields: [
          { id: "applicant_full_name", label: "Current Name", help: "Current full name" },
          { id: "new_name", label: "New Name", help: "Desired new name" },
          { id: "previous_name", label: "Previous Name", help: "Any previous names" },
          { id: "reason", label: "Reason", help: "Reason for change" },
          { id: "publication_address", label: "Publication Address", help: "Gazette office address" },
          { id: "proof_of_publication_fee", label: "Fee Proof", help: "Payment proof" },
          { id: "date_of_application", label: "Application Date", help: "Date of application" },
        ],
      },
    ]
    setForms(mockForms)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ✨ Simplify Legal Forms
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Speak Your Legal{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Forms</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            No more complex paperwork. Just speak in your language, and our AI will fill your legal forms automatically.
            Fast, accurate, and accessible.
          </p>

          {/* Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Fast & Easy</p>
              <p className="text-xs text-gray-600">Complete forms in minutes</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Secure & Private</p>
              <p className="text-xs text-gray-600">Your data is encrypted</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Multi-Language</p>
              <p className="text-xs text-gray-600">Speak in your language</p>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Available Legal Forms</h2>
            <p className="text-xl text-gray-600">Choose the form that matches your legal needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {forms.map((form) => (
              <div
                key={form._id}
                className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border border-blue-100 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-2"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 mb-4 text-3xl border border-blue-200">
                    {form.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {form.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{form.description}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => onSelectForm(form._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Fill Manually
                    </button>
                    {onAIFill && (
                      <button
                        onClick={() => onAIFill(form._id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        AI Fill
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                    <span className="text-xs font-medium text-gray-500">{form.fields.length} fields</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Choose your method</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-12 mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Select Form", desc: "Choose the legal form you need", icon: "📋" },
                { step: "2", title: "Speak", desc: "Record your answers in your language", icon: "🎤" },
                { step: "3", title: "Review", desc: "Check and edit the filled form", icon: "✓" },
                { step: "4", title: "Submit", desc: "Get tracking ID and confirmation", icon: "✉️" },
              ].map((item, idx) => (
                <div key={idx} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: Shield, title: "Secure & Private", desc: "Bank-level encryption for all data" },
              { icon: Zap, title: "Fast Processing", desc: "Get results in seconds, not hours" },
              { icon: FileText, title: "Legal Compliance", desc: "Forms comply with all regulations" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-blue-100 rounded-2xl p-8 text-center hover:shadow-lg hover:border-blue-300 transition-all duration-300"
              >
                <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Simplify Your Legal Process?</h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Select a form above and start speaking. It's that simple. Your data is encrypted and secure.
              </p>
              <div className="flex justify-center gap-4">
                <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "number" | "date" | "select" | "boolean" | "file" | "array"
  required: boolean
  help?: string
  pattern?: string
  min?: number
  max?: number
  options?: string[]
  validation?: (value: any) => string | null
}

export interface FormSchema {
  _id: string
  title: string
  description: string
  icon: string
  fields: FormField[]
  gptPrompt: string
}

export const FORM_SCHEMAS: Record<string, FormSchema> = {
  name_change: {
    _id: "name_change",
    title: "Name Change Affidavit",
    description: "Apply for a legal name change with voice guidance",
    icon: "📝",
    fields: [
      {
        id: "applicant_full_name",
        label: "Full Name",
        type: "text",
        required: true,
        help: "Your current full legal name",
        validation: (v) => (v.length < 3 ? "Name must be at least 3 characters" : null),
      },
      {
        id: "applicant_age",
        label: "Age",
        type: "number",
        required: true,
        help: "Your age",
        min: 1,
        max: 120,
        validation: (v) => (v < 1 || v > 120 ? "Age must be between 1 and 120" : null),
      },
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
        validation: (v) => (!/\b\d{6}\b/.test(v) ? "Address must contain a 6-digit pincode" : null),
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
        validation: (v) => (new Date(v) > new Date() ? "Date cannot be in the future" : null),
      },
      { id: "place", label: "Place", type: "text", required: true, help: "Place where this declaration is made" },
      {
        id: "id_proof_type",
        label: "ID Proof Type",
        type: "select",
        required: true,
        help: "Type of ID proof",
        options: ["Aadhar", "Passport", "Voter ID", "Driving Licence"],
      },
      {
        id: "id_proof_number",
        label: "ID Proof Number",
        type: "text",
        required: true,
        help: "Your ID proof number",
        validation: (v) => (v.length < 5 ? "Invalid ID number" : null),
      },
    ],
    gptPrompt: `FORM: name_change
FIELDS:
- applicant_full_name (keywords: "my name is", "I am", "name") example: "Ravi Kumar"
- applicant_age (keywords: "age", "I am") example: "35"
- applicant_father_name (keywords: "son/daughter of", "father") example: "Shyam Lal"
- current_address (keywords: "address", "live at", "reside") example: "123 MG Road, Bangalore - 560001"
- previous_name (keywords: "formerly called", "old name") example: "R K"
- new_name (keywords: "now want to be called", "new name") example: "Ravi Kumar"
- reason (keywords: "because", "due to") example: "marriage"
- date_of_declaration (keywords: "today", date formats)
- place (keywords: "at", "place")
- id_proof_type (choose one: Aadhar, Passport, Voter ID, Driving Licence)
- id_proof_number (follow id format)
Extract values for each field. Return JSON only.`,
  },

  property_dispute_simple: {
    _id: "property_dispute_simple",
    title: "Property Dispute Plaint",
    description: "File a property dispute case with detailed documentation",
    icon: "🏠",
    fields: [
      { id: "plaintiff_name", label: "Plaintiff Name", type: "text", required: true, help: "Your full legal name" },
      {
        id: "plaintiff_address",
        label: "Plaintiff Address",
        type: "textarea",
        required: true,
        help: "Your complete address with pincode",
        validation: (v) => (!/\b\d{6}\b/.test(v) ? "Address must contain a 6-digit pincode" : null),
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
      {
        id: "nature_of_claim",
        label: "Nature of Claim",
        type: "select",
        required: true,
        help: "Type of claim",
        options: ["Ownership", "Ejectment", "Partition", "Possession"],
      },
      {
        id: "value_of_claim",
        label: "Value of Claim (₹)",
        type: "number",
        required: true,
        help: "Monetary value of claim",
        min: 0,
        validation: (v) => (v < 0 ? "Value must be positive" : null),
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
        validation: (v) => (!v ? "You must verify the declaration" : null),
      },
    ],
    gptPrompt: `FORM: property_dispute_simple
Extract plaintiff_name, defendant_name, property_description, nature_of_claim, value_of_claim (numbers only), facts_of_case, relief_sought. For verification_declaration, set true only if user says "I verify" or similar. Return JSON only.`,
  },

  traffic_fine_appeal: {
    _id: "traffic_fine_appeal",
    title: "Traffic Fine Appeal",
    description: "Appeal a traffic fine with voice evidence",
    icon: "🚗",
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
        pattern: "[A-Z]{2}\\s?\\d{1,2}\\s?[A-Z]{0,2}\\s?\\d{1,4}",
        validation: (v) =>
          !/^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{0,2}\s?\d{1,4}$/.test(v.toUpperCase()) ? "Invalid vehicle number format" : null,
      },
      {
        id: "date_of_challan",
        label: "Date of Challan",
        type: "date",
        required: true,
        help: "When the challan was issued",
        validation: (v) => (new Date(v) > new Date() ? "Date cannot be in the future" : null),
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
    gptPrompt: `FORM: traffic_fine_appeal
Extract appellant_name, challan_number, vehicle_number (uppercase, no spaces), date_of_challan, offence_details, explanation. Return JSON only.`,
  },

  mutual_divorce_petition: {
    _id: "mutual_divorce_petition",
    title: "Mutual Divorce Petition",
    description: "File for mutual divorce proceedings",
    icon: "⚖️",
    fields: [
      {
        id: "husband_full_name",
        label: "Husband's Full Name",
        type: "text",
        required: true,
        help: "Husband's full legal name",
      },
      { id: "wife_full_name", label: "Wife's Full Name", type: "text", required: true, help: "Wife's full legal name" },
      {
        id: "marriage_date",
        label: "Marriage Date",
        type: "date",
        required: true,
        help: "Date of marriage",
        validation: (v) => (new Date(v) >= new Date() ? "Marriage date must be in the past" : null),
      },
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
        validation: (v) => (!v ? "Both parties must agree" : null),
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
    gptPrompt: `FORM: mutual_divorce_petition
Extract husband_full_name, wife_full_name, marriage_date, marriage_place, addresses, reason_for_divorce. Set mutual_agreement true only if both names present and transcript says "we both agree". Return JSON only.`,
  },

  affidavit_general: {
    _id: "affidavit_general",
    title: "General Affidavit",
    description: "Create a general purpose affidavit",
    icon: "📄",
    fields: [
      { id: "deponent_name", label: "Deponent Name", type: "text", required: true, help: "Your full legal name" },
      {
        id: "deponent_age",
        label: "Age",
        type: "number",
        required: true,
        help: "Your age",
        min: 1,
        validation: (v) => (v < 1 ? "Age must be positive" : null),
      },
      { id: "deponent_address", label: "Address", type: "textarea", required: true, help: "Your complete address" },
      {
        id: "statement_text",
        label: "Statement",
        type: "textarea",
        required: true,
        help: "Your statement in first person",
      },
      { id: "place_of_sworn", label: "Place of Sworn", type: "text", required: true, help: "Where this is sworn" },
      {
        id: "date_of_sworn",
        label: "Date of Sworn",
        type: "date",
        required: true,
        help: "Date of swearing",
        validation: (v) => (new Date(v) > new Date() ? "Date cannot be in the future" : null),
      },
      { id: "notary_name", label: "Notary Name", type: "text", required: false, help: "Name of notary public" },
      { id: "attachments", label: "Attachments", type: "file", required: false, help: "Supporting documents" },
    ],
    gptPrompt: `FORM: affidavit_general
Extract deponent_name, deponent_age, deponent_address, statement_text (preserve first-person tone), place_of_sworn, date_of_sworn. Return JSON only.`,
  },

  name_change_gazette: {
    _id: "name_change_gazette",
    title: "Name Change Gazette Application",
    description: "Apply for name change through gazette notification",
    icon: "📰",
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
        validation: (v) => (new Date(v) > new Date() ? "Date cannot be in the future" : null),
      },
    ],
    gptPrompt: `FORM: name_change_gazette
Extract applicant_full_name, new_name, previous_name, reason, publication_address, date_of_application. Return JSON only.`,
  },
}

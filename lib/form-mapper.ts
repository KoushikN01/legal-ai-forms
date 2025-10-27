// Form Mapping and Validation Service
// Intelligently extracts and maps transcript data to form fields

export interface ValidationRule {
  type: "required" | "email" | "phone" | "date" | "minLength" | "maxLength" | "pattern" | "custom"
  value?: string | number | RegExp
  message?: string
}

export interface FormField {
  id: string
  label: string
  help: string
  type: "text" | "email" | "tel" | "date" | "textarea" | "select"
  required: boolean
  validationRules?: ValidationRule[]
}

export interface FormSchema {
  id: string
  title: string
  fields: FormField[]
}

// Validation functions
export const validators = {
  required: (value: string): boolean => value?.trim().length > 0,

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[\d\s\-+$$$$]{10,}$/
    return phoneRegex.test(value.replace(/\s/g, ""))
  },

  date: (value: string): boolean => {
    const date = new Date(value)
    return date instanceof Date && !isNaN(date.getTime())
  },

  minLength: (value: string, min: number): boolean => value.length >= min,

  maxLength: (value: string, max: number): boolean => value.length <= max,

  pattern: (value: string, pattern: RegExp): boolean => pattern.test(value),
}

export class FormValidator {
  validateField(value: string, rules: ValidationRule[]): string | null {
    for (const rule of rules) {
      switch (rule.type) {
        case "required":
          if (!validators.required(value)) {
            return rule.message || "This field is required"
          }
          break

        case "email":
          if (value && !validators.email(value)) {
            return rule.message || "Please enter a valid email address"
          }
          break

        case "phone":
          if (value && !validators.phone(value)) {
            return rule.message || "Please enter a valid phone number"
          }
          break

        case "date":
          if (value && !validators.date(value)) {
            return rule.message || "Please enter a valid date"
          }
          break

        case "minLength":
          if (value && !validators.minLength(value, rule.value as number)) {
            return rule.message || `Minimum length is ${rule.value} characters`
          }
          break

        case "maxLength":
          if (value && !validators.maxLength(value, rule.value as number)) {
            return rule.message || `Maximum length is ${rule.value} characters`
          }
          break

        case "pattern":
          if (value && !validators.pattern(value, rule.value as RegExp)) {
            return rule.message || "Invalid format"
          }
          break
      }
    }
    return null
  }

  validateForm(formData: Record<string, string>, fields: FormField[]): Record<string, string> {
    const errors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.id] || ""
      const rules = field.validationRules || []

      if (field.required) {
        rules.unshift({ type: "required" })
      }

      const error = this.validateField(value, rules)
      if (error) {
        errors[field.id] = error
      }
    })

    return errors
  }
}

// Form Mapper - Extracts data from transcript
export class FormMapper {
  private patterns: Record<string, RegExp[]> = {
    phone: [
      /(?:phone|contact|number|call|reach|mobile|cell)[\s:]*(\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/gi,
      /(\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g,
    ],
    email: [/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi],
    date: [
      /(?:date|born|married|on)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/gi,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/g,
    ],
    name: [
      /(?:name|called|known|my name is)[\s:]*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g,
    ],
  }

  extractData(transcript: string, fields: FormField[]): Record<string, string> {
    const extractedData: Record<string, string> = {}

    fields.forEach((field) => {
      const value = this.extractFieldValue(transcript, field)
      if (value) {
        extractedData[field.id] = value
      }
    })

    return extractedData
  }

  private extractFieldValue(transcript: string, field: FormField): string {
    const lowerTranscript = transcript.toLowerCase()
    const fieldLabel = field.label.toLowerCase()

    // Type-based extraction
    if (field.type === "tel" || fieldLabel.includes("phone")) {
      return this.extractPhone(transcript)
    }

    if (field.type === "email" || fieldLabel.includes("email")) {
      return this.extractEmail(transcript)
    }

    if (field.type === "date" || fieldLabel.includes("date")) {
      return this.extractDate(transcript)
    }

    // Keyword-based extraction for text fields
    if (field.type === "text" || field.type === "textarea") {
      return this.extractByKeyword(transcript, field)
    }

    return ""
  }

  private extractPhone(transcript: string): string {
    for (const pattern of this.patterns.phone) {
      const match = transcript.match(pattern)
      if (match) {
        return match[1] || match[0]
      }
    }
    return ""
  }

  private extractEmail(transcript: string): string {
    for (const pattern of this.patterns.email) {
      const match = transcript.match(pattern)
      if (match) {
        return match[0]
      }
    }
    return ""
  }

  private extractDate(transcript: string): string {
    for (const pattern of this.patterns.date) {
      const match = transcript.match(pattern)
      if (match) {
        return match[1] || match[0]
      }
    }
    return ""
  }

  private extractByKeyword(transcript: string, field: FormField): string {
    const keywords = field.label.toLowerCase().split(" ")
    const sentences = transcript.split(/[.!?]/)

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase()
      if (keywords.some((keyword) => sentenceLower.includes(keyword))) {
        // Extract the relevant part after the keyword
        const words = sentence.trim().split(/\s+/)
        return words
          .slice(Math.max(0, words.length - 10))
          .join(" ")
          .trim()
      }
    }

    return ""
  }
}

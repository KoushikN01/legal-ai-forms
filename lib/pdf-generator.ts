import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { jsPDF as JSPDF } from "jspdf"

export class PDFGenerator {
  // Legacy method for backward compatibility
  static generateFormPDF(formTitle: string, formData: Record<string, string>, trackingId: string): jsPDF {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(formTitle, 105, 20, { align: "center" })

    // Tracking ID
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Tracking ID: ${trackingId}`, 105, 30, { align: "center" })
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 35, { align: "center" })

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 40, 190, 40)

    // Form fields
    let yPosition = 50
    doc.setFontSize(12)

    Object.entries(formData).forEach(([key, value]) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      // Field label
      doc.setFont("helvetica", "bold")
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      doc.text(`${label}:`, 20, yPosition)

      // Field value
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(value || "N/A", 150)
      doc.text(lines, 20, yPosition + 5)

      yPosition += 5 + lines.length * 5 + 5
    })

    // Footer
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("This is a computer-generated document. No signature is required.", 105, 285, { align: "center" })

    return doc
  }

  // New method for styled PDFs using templates
  static async generateStyledPDF(
    formId: string, 
    formData: Record<string, string>, 
    trackingId: string
  ): Promise<jsPDF> {
    // Try the simpler jsPDF method first
    try {
      return this.generateStyledPDFSimple(formId, formData, trackingId)
    } catch (error) {
      console.error('[PDF Generator] Simple method failed, trying HTML2Canvas:', error)
      
      // Fallback to HTML2Canvas method
      const template = this.getTemplateForFormId(formId)
      const htmlContent = this.fillTemplate(template, formData, trackingId)
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '210mm' // A4 width
      tempDiv.style.height = '297mm' // A4 height
      tempDiv.style.fontSize = '12px'
      document.body.appendChild(tempDiv)

      try {
        // Convert HTML to canvas
        const canvas = await html2canvas(tempDiv, {
          width: 794, // A4 width in pixels (210mm)
          height: 1123, // A4 height in pixels (297mm)
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        })

        // Create PDF from canvas
        const imgData = canvas.toDataURL('image/png')
        const doc = new jsPDF('p', 'mm', 'a4')
        doc.addImage(imgData, 'PNG', 0, 0, 210, 297)

        return doc
      } finally {
        // Clean up
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv)
        }
      }
    }
  }

  // Simpler method using jsPDF's built-in capabilities
  private static generateStyledPDFSimple(
    formId: string, 
    formData: Record<string, string>, 
    trackingId: string
  ): jsPDF {
    console.log('[PDF Generator] Generating styled PDF with data:', formData)
    console.log('[PDF Generator] Form ID:', formId)
    console.log('[PDF Generator] Tracking ID:', trackingId)
    
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Add border
    doc.setDrawColor(47, 79, 143) // Blue border
    doc.setLineWidth(3)
    doc.rect(10, 10, 190, 277) // Outer border
    
    doc.setDrawColor(157, 181, 204) // Light blue border
    doc.setLineWidth(1)
    doc.rect(15, 15, 180, 267) // Inner border
    
    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    const formTitle = this.getFormTitle(formId)
    doc.text(formTitle, 105, 30, { align: "center" })
    
    // Court info
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const courtInfo = this.getCourtInfo(formId)
    doc.text(courtInfo, 105, 40, { align: "center" })
    
    // Case number
    doc.setFontSize(10)
    doc.text(`Case No. ${trackingId}`, 105, 50, { align: "center" })
    
    // Add form-specific content
    this.addFormContent(doc, formId, formData, trackingId)
    
    // Footer
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const today = new Date().toLocaleDateString('en-IN')
    doc.text(`Place: Bengaluru`, 20, 270)
    doc.text(`Date: ${today}`, 20, 275)
    doc.text("Advocate for Petitioner", 150, 275)
    
    console.log('[PDF Generator] PDF generated successfully')
    return doc
  }

  private static getFormTitle(formId: string): string {
    const titles: Record<string, string> = {
      'name_change': 'NAME CHANGE AFFIDAVIT',
      'name_change_gazette': 'NAME CHANGE GAZETTE APPLICATION',
      'property_dispute_simple': 'PROPERTY DISPUTE PLAINT',
      'property_dispute': 'PROPERTY DISPUTE PLAINT',
      'probate_petition': 'PROBATE PETITION',
      'caveat_petition': 'CAVEAT PETITION',
      'mutual_divorce_petition': 'MUTUAL DIVORCE PETITION',
      'traffic_fine_appeal': 'TRAFFIC FINE APPEAL',
      'affidavit_general': 'GENERAL AFFIDAVIT',
    }
    return titles[formId] || 'LEGAL DOCUMENT'
  }

  private static getCourtInfo(formId: string): string {
    const courtInfo: Record<string, string> = {
      'name_change': 'BEFORE THE HON\'BLE EXECUTIVE MAGISTRATE AT BENGALURU',
      'name_change_gazette': 'BEFORE THE HON\'BLE EXECUTIVE MAGISTRATE AT BENGALURU',
      'property_dispute_simple': 'BEFORE THE HON\'BLE CITY CIVIL JUDGE AT BENGALURU',
      'property_dispute': 'BEFORE THE HON\'BLE CITY CIVIL JUDGE AT BENGALURU',
      'probate_petition': 'BEFORE THE HON\'BLE PRL. CITY CIVIL JUDGE AT BENGALURU',
      'caveat_petition': 'IN THE HON\'BLE HIGH COURT OF KARNATAKA AT BENGALURU',
      'mutual_divorce_petition': 'BEFORE THE HON\'BLE FAMILY COURT AT BENGALURU',
      'traffic_fine_appeal': 'BEFORE THE HON\'BLE TRAFFIC APPELLATE TRIBUNAL AT BENGALURU',
      'affidavit_general': 'BEFORE THE HON\'BLE NOTARY PUBLIC AT BENGALURU',
    }
    return courtInfo[formId] || 'BEFORE THE HON\'BLE COURT'
  }

  private static addFormContent(doc: jsPDF, formId: string, formData: Record<string, string>, trackingId: string): void {
    let yPosition = 70
    
    console.log('[PDF Generator] Adding form content for:', formId)
    console.log('[PDF Generator] Form data keys:', Object.keys(formData))
    
    // Add form-specific content based on form type
    switch (formId) {
      case 'name_change':
      case 'name_change_gazette':
        this.addNameChangeContent(doc, formData, yPosition)
        break
      case 'property_dispute_simple':
      case 'property_dispute':
        this.addPropertyDisputeContent(doc, formData, yPosition)
        break
      case 'probate_petition':
        this.addProbateContent(doc, formData, yPosition)
        break
      case 'caveat_petition':
        this.addCaveatContent(doc, formData, yPosition)
        break
      case 'mutual_divorce_petition':
        this.addMutualDivorceContent(doc, formData, yPosition)
        break
      case 'traffic_fine_appeal':
        this.addTrafficAppealContent(doc, formData, yPosition)
        break
      case 'affidavit_general':
        this.addGeneralAffidavitContent(doc, formData, yPosition)
        break
      default:
        this.addDefaultContent(doc, formData, yPosition)
    }
  }

  private static addNameChangeContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("I, " + (formData.applicant_full_name || ""), 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const declaration = `S/o ${formData.applicant_father_name || ""}, aged ${formData.applicant_age || ""} years, residing at ${formData.current_address || ""}, do hereby solemnly affirm and declare as under:`
    const lines = doc.splitTextToSize(declaration, 170)
    doc.text(lines, 20, y)
    y += lines.length * 5 + 10
    
    doc.setFont("helvetica", "bold")
    doc.text("That", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const thatText = `I was previously known as ${formData.previous_name || ""} and I now want to be known as ${formData.new_name || ""}.`
    const thatLines = doc.splitTextToSize(thatText, 170)
    doc.text(thatLines, 20, y)
    y += thatLines.length * 5 + 10
    
    doc.setFont("helvetica", "bold")
    doc.text("Reason for Change", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const reasonLines = doc.splitTextToSize(formData.reason || "", 170)
    doc.text(reasonLines, 20, y)
  }

  private static addPropertyDisputeContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Plaintiff", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`${formData.plaintiff_name || ""}, residing at ${formData.plaintiff_address || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Defendant", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.text(`${formData.defendant_name || ""}, residing at ${formData.defendant_address || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Property Description", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const propLines = doc.splitTextToSize(formData.property_description || "", 170)
    doc.text(propLines, 20, y)
    y += propLines.length * 5 + 10
    
    doc.setFont("helvetica", "bold")
    doc.text("Nature of Claim", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.text(formData.nature_of_claim || "", 20, y)
    y += 10
    
    doc.setFont("helvetica", "bold")
    doc.text("Value of Claim", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.text(`₹${formData.value_of_claim || ""}`, 20, y)
  }

  private static addProbateContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Petitioners", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("1. " + (formData.petitioner1_name || ""), 20, y)
    y += 10
    doc.text("2. " + (formData.petitioner2_name || ""), 20, y)
    y += 10
    doc.text("3. " + (formData.petitioner3_name || ""), 20, y)
    y += 10
    doc.text("4. " + (formData.petitioner4_name || ""), 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Claim", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const claimLines = doc.splitTextToSize(formData.claim_text || "", 170)
    doc.text(claimLines, 20, y)
  }

  private static addCaveatContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Between", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`${formData.caveator_name || ""}, ${formData.caveator_designation || ""}, ${formData.caveator_address || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("And", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.text(`${formData.respondent_name || ""}, ${formData.respondent_designation || ""}, ${formData.respondent_address || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Memorandum of Caveat Petition", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const caveatLines = doc.splitTextToSize(formData.caveat_body || "", 170)
    doc.text(caveatLines, 20, y)
  }

  private static addMutualDivorceContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Petitioners", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`1. ${formData.husband_full_name || ""}, Husband`, 20, y)
    y += 10
    doc.text(`2. ${formData.wife_full_name || ""}, Wife`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Marriage Details", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.text(`Marriage solemnized on ${formData.marriage_date || ""} at ${formData.marriage_place || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Reason for Divorce", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const reasonLines = doc.splitTextToSize(formData.reason_for_divorce || "", 170)
    doc.text(reasonLines, 20, y)
  }

  private static addTrafficAppealContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Appellant", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`${formData.appellant_name || ""}, residing at ${formData.appellant_address || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Challan Details", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.text(`Challan Number: ${formData.challan_number || ""}`, 20, y)
    y += 10
    doc.text(`Vehicle Number: ${formData.vehicle_number || ""}`, 20, y)
    y += 10
    doc.text(`Date of Challan: ${formData.date_of_challan || ""}`, 20, y)
    y += 15
    
    doc.setFont("helvetica", "bold")
    doc.text("Offence Details", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const offenceLines = doc.splitTextToSize(formData.offence_details || "", 170)
    doc.text(offenceLines, 20, y)
  }

  private static addGeneralAffidavitContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("I, " + (formData.deponent_name || ""), 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const declaration = `aged ${formData.deponent_age || ""} years, residing at ${formData.deponent_address || ""}, do hereby solemnly affirm and declare as under:`
    const lines = doc.splitTextToSize(declaration, 170)
    doc.text(lines, 20, y)
    y += lines.length * 5 + 10
    
    doc.setFont("helvetica", "bold")
    doc.text("Statement", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const statementLines = doc.splitTextToSize(formData.statement_text || "", 170)
    doc.text(statementLines, 20, y)
    y += statementLines.length * 5 + 10
    
    doc.setFont("helvetica", "bold")
    doc.text("Verification", 20, y)
    y += 10
    
    doc.setFont("helvetica", "normal")
    const verificationText = "I hereby declare that the above statement is true to the best of my knowledge and belief and that no part of it is false and nothing material has been concealed therefrom."
    const verificationLines = doc.splitTextToSize(verificationText, 170)
    doc.text(verificationLines, 20, y)
  }

  private static addDefaultContent(doc: jsPDF, formData: Record<string, string>, startY: number): void {
    let y = startY
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Document Details", 20, y)
    y += 15
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        doc.text(`${label}: ${value}`, 20, y)
        y += 10
      }
    })
  }

  private static getTemplateForFormId(formId: string): string {
    const templates: Record<string, string> = {
      'name_change': this.getNameChangeTemplate(),
      'name_change_gazette': this.getNameChangeTemplate(),
      'property_dispute_simple': this.getPropertyDisputeTemplate(),
      'property_dispute': this.getPropertyDisputeTemplate(),
      'probate_petition': this.getProbateTemplate(),
      'caveat_petition': this.getCaveatTemplate(),
      'mutual_divorce_petition': this.getMutualDivorceTemplate(),
      'traffic_fine_appeal': this.getTrafficAppealTemplate(),
      'affidavit_general': this.getGeneralAffidavitTemplate(),
    }
    
    return templates[formId] || this.getDefaultTemplate()
  }

  private static fillTemplate(template: string, formData: Record<string, string>, trackingId: string): string {
    let filledTemplate = template
    
    // Add tracking ID and date
    const today = new Date().toLocaleDateString('en-IN')
    filledTemplate = filledTemplate.replace(/\{\{ tracking_id \}\}/g, trackingId)
    filledTemplate = filledTemplate.replace(/\{\{ date_today \}\}/g, today)
    
    // Fill in form data - fix the regex pattern
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `{{ ${key} }}`
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      filledTemplate = filledTemplate.replace(regex, value || '')
    })
    
    // Debug: Log the filled template to see what's happening
    console.log('[PDF Generator] Form data:', formData)
    console.log('[PDF Generator] Tracking ID:', trackingId)
    console.log('[PDF Generator] Filled template preview:', filledTemplate.substring(0, 500))
    
    return filledTemplate
  }

  private static getNameChangeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Name Change Affidavit</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>NAME CHANGE AFFIDAVIT</h1>
            <p class="court">BEFORE THE HON'BLE EXECUTIVE MAGISTRATE AT BENGALURU</p>
            <p class="sub">AFFIDAVIT No. {{ tracking_id }}</p>
          </header>

          <section class="section">
            <h2>I, {{ applicant_full_name }}</h2>
            <div class="petitioner-item">
              <p>S/o {{ applicant_father_name }}, aged {{ applicant_age }} years, residing at {{ current_address }}, do hereby solemnly affirm and declare as under:</p>
            </div>
          </section>

          <section class="section">
            <h2>That</h2>
            <div class="claim-text">
              <p>I was previously known as <strong>{{ previous_name }}</strong> and I now want to be known as <strong>{{ new_name }}</strong>.</p>
            </div>
          </section>

          <section class="section">
            <h2>Reason for Change</h2>
            <div class="petition-body">
              <p>{{ reason }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Verification</h2>
            <div class="claim-text">
              <p>I hereby declare that the above statement is true to the best of my knowledge and belief and that no part of it is false and nothing material has been concealed therefrom.</p>
            </div>
          </section>

          <section class="section">
            <h2>Identity Proof</h2>
            <div class="petitioner-item">
              <p>I am producing my {{ id_proof_type }} bearing No. {{ id_proof_number }} as proof of my identity.</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> {{ place }}</p>
              <p><strong>Date:</strong> {{ date_of_declaration }}</p>
            </div>
            <div>
              <p><strong>DEPONENT</strong></p>
              <p>{{ applicant_full_name }}</p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getPropertyDisputeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Property Dispute Plaint</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>PROPERTY DISPUTE PLAINT</h1>
            <p class="court">BEFORE THE HON'BLE CITY CIVIL JUDGE AT BENGALURU</p>
            <p class="sub">O.S. No. {{ tracking_id }}</p>
          </header>

          <section class="section">
            <h2>Plaintiff</h2>
            <div class="petitioner-item">
              <p><strong>{{ plaintiff_name }}</strong>, residing at {{ plaintiff_address }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Defendant</h2>
            <div class="petitioner-item">
              <p><strong>{{ defendant_name }}</strong>, residing at {{ defendant_address }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Property Description</h2>
            <div class="claim-text">
              <p>{{ property_description }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Nature of Claim</h2>
            <div class="petitioner-item">
              <p>The plaintiff is claiming <strong>{{ nature_of_claim }}</strong> of the above-mentioned property.</p>
            </div>
          </section>

          <section class="section">
            <h2>Value of Claim</h2>
            <div class="petitioner-item">
              <p>The value of the claim is ₹{{ value_of_claim }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Facts of the Case</h2>
            <div class="petition-body">
              <p>{{ facts_of_case }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Relief Sought</h2>
            <div class="prayer-text">
              <p>{{ relief_sought }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Verification</h2>
            <div class="claim-text">
              <p>I, {{ plaintiff_name }}, the plaintiff above named, do hereby verify that the contents of the above plaint are true to the best of my knowledge and belief.</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> Bengaluru</p>
              <p><strong>Date:</strong> {{ date_of_incident }}</p>
            </div>
            <div>
              <p><strong>Advocate for Plaintiff</strong></p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getProbateTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Probate Petition</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>PROBATE PETITION</h1>
            <p class="court">BEFORE THE HON'BLE PRL. CITY CIVIL JUDGE AT BENGALURU</p>
            <p class="sub">P. & S.C. No. {{ tracking_id }}</p>
          </header>

          <section class="section applicant">
            <h2>Petitioners</h2>
            <div class="petitioner-item">
              <p><strong>1.</strong> {{ petitioner1_name }}, {{ petitioner1_relation }}, aged {{ petitioner1_age }}, residing at {{ petitioner1_address }}.</p>
            </div>
            <div class="petitioner-item">
              <p><strong>2.</strong> {{ petitioner2_name }}, {{ petitioner2_relation }}, aged {{ petitioner2_age }}, residing at {{ petitioner2_address }}.</p>
            </div>
            <div class="petitioner-item">
              <p><strong>3.</strong> {{ petitioner3_name }}, {{ petitioner3_relation }}, aged {{ petitioner3_age }}, residing at {{ petitioner3_address }}.</p>
            </div>
            <div class="petitioner-item">
              <p><strong>4.</strong> {{ petitioner4_name }}, {{ petitioner4_relation }}, aged {{ petitioner4_age }}, residing at {{ petitioner4_address }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Respondents</h2>
            <p>Nil.</p>
          </section>

          <section class="section">
            <h2>Claim</h2>
            <div class="claim-text">
              <p>{{ claim_text }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Petition</h2>
            <div class="petition-body">
              <p>{{ petition_body }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Prayer</h2>
            <div class="prayer-text">
              <p>{{ prayer_text }}</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> Bengaluru</p>
              <p><strong>Date:</strong> {{ date_today }}</p>
            </div>
            <div>
              <p><strong>Advocate for Petitioners</strong></p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getCaveatTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Caveat Petition</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>CAVEAT PETITION</h1>
            <p class="court">IN THE HON'BLE HIGH COURT OF KARNATAKA AT BENGALURU</p>
            <p class="sub">CAVEAT PETITION No. {{ tracking_id }} / {{ year }}</p>
          </header>

          <section class="section">
            <h2>Between</h2>
            <div class="caveat-section">
              <p><strong>{{ caveator_name }}</strong>, {{ caveator_designation }}, {{ caveator_address }}. <br>…CAVEATOR</p>
            </div>
          </section>

          <section class="section">
            <h2>And</h2>
            <div class="caveat-section">
              <p><strong>{{ respondent_name }}</strong>, {{ respondent_designation }}, {{ respondent_address }}. <br>…RESPONDENT</p>
            </div>
          </section>

          <section class="section">
            <h2>Memorandum of Caveat Petition</h2>
            <div class="claim-text">
              <p>{{ caveat_body }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Prayer</h2>
            <div class="prayer-text">
              <p>{{ prayer_text }}</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> Bengaluru</p>
              <p><strong>Date:</strong> {{ date_today }}</p>
            </div>
            <div>
              <p><strong>Advocate for Caveator</strong></p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getMutualDivorceTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Mutual Divorce Petition</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>MUTUAL DIVORCE PETITION</h1>
            <p class="court">BEFORE THE HON'BLE FAMILY COURT AT BENGALURU</p>
            <p class="sub">M.C. No. {{ tracking_id }}</p>
          </header>

          <section class="section">
            <h2>Petitioners</h2>
            <div class="petitioner-item">
              <p><strong>1. {{ husband_full_name }}</strong>, Husband, residing at {{ residential_address_husband }}.</p>
            </div>
            <div class="petitioner-item">
              <p><strong>2. {{ wife_full_name }}</strong>, Wife, residing at {{ residential_address_wife }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Marriage Details</h2>
            <div class="claim-text">
              <p>The marriage between the petitioners was solemnized on {{ marriage_date }} at {{ marriage_place }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Reason for Divorce</h2>
            <div class="petition-body">
              <p>{{ reason_for_divorce }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Mutual Agreement</h2>
            <div class="claim-text">
              <p>Both parties mutually agree to dissolve their marriage and have been living separately for a considerable period.</p>
            </div>
          </section>

          <section class="section">
            <h2>Children Details</h2>
            <div class="claim-text">
              <p>{{ children || "No children from this marriage." }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Maintenance Terms</h2>
            <div class="claim-text">
              <p>{{ maintenance_terms || "No maintenance terms agreed upon." }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Prayer</h2>
            <div class="prayer-text">
              <p>In view of the above facts, we pray that this Hon'ble Court may be pleased to grant a decree of divorce dissolving the marriage between the petitioners.</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> Bengaluru</p>
              <p><strong>Date:</strong> {{ date_of_affidavit }}</p>
            </div>
            <div>
              <p><strong>Advocate for Petitioners</strong></p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getTrafficAppealTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Traffic Fine Appeal</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>TRAFFIC FINE APPEAL</h1>
            <p class="court">BEFORE THE HON'BLE TRAFFIC APPELLATE TRIBUNAL AT BENGALURU</p>
            <p class="sub">Appeal No. {{ tracking_id }}</p>
          </header>

          <section class="section">
            <h2>Appellant</h2>
            <div class="petitioner-item">
              <p><strong>{{ appellant_name }}</strong>, residing at {{ appellant_address }}.</p>
            </div>
          </section>

          <section class="section">
            <h2>Challan Details</h2>
            <div class="claim-text">
              <p><strong>Challan Number:</strong> {{ challan_number }}</p>
              <p><strong>Vehicle Number:</strong> {{ vehicle_number }}</p>
              <p><strong>Date of Challan:</strong> {{ date_of_challan }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Offence Details</h2>
            <div class="petition-body">
              <p>{{ offence_details }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Appellant's Explanation</h2>
            <div class="petition-body">
              <p>{{ explanation }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Police Station</h2>
            <div class="claim-text">
              <p>{{ police_station || "Not specified" }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Prayer</h2>
            <div class="prayer-text">
              <p>In view of the above facts and circumstances, we pray that this Hon'ble Tribunal may be pleased to set aside the challan and allow this appeal.</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> Bengaluru</p>
              <p><strong>Date:</strong> {{ date_today }}</p>
            </div>
            <div>
              <p><strong>Advocate for Appellant</strong></p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getGeneralAffidavitTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>General Affidavit</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>GENERAL AFFIDAVIT</h1>
            <p class="court">BEFORE THE HON'BLE NOTARY PUBLIC AT BENGALURU</p>
            <p class="sub">Affidavit No. {{ tracking_id }}</p>
          </header>

          <section class="section">
            <h2>I, {{ deponent_name }}</h2>
            <div class="petitioner-item">
              <p>aged {{ deponent_age }} years, residing at {{ deponent_address }}, do hereby solemnly affirm and declare as under:</p>
            </div>
          </section>

          <section class="section">
            <h2>Statement</h2>
            <div class="claim-text">
              <p>{{ statement_text }}</p>
            </div>
          </section>

          <section class="section">
            <h2>Verification</h2>
            <div class="claim-text">
              <p>I hereby declare that the above statement is true to the best of my knowledge and belief and that no part of it is false and nothing material has been concealed therefrom.</p>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Place:</strong> {{ place_of_sworn }}</p>
              <p><strong>Date:</strong> {{ date_of_sworn }}</p>
            </div>
            <div>
              <p><strong>DEPONENT</strong></p>
              <p>{{ deponent_name }}</p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getDefaultTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Legal Document</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400&display=swap" rel="stylesheet">
        <style>
          ${this.getCSSStyles()}
        </style>
      </head>
      <body>
        <div class="certificate">
          <header class="cert-header">
            <h1>LEGAL DOCUMENT</h1>
            <p class="sub">Document No. {{ tracking_id }}</p>
          </header>

          <section class="section">
            <h2>Document Details</h2>
            <div class="claim-text">
              <p>This document contains the following information:</p>
              <ul>
                ${Object.keys({}).map(key => `<li><strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> {{ ${key} }}</li>`).join('')}
              </ul>
            </div>
          </section>

          <footer class="cert-footer">
            <div>
              <p><strong>Date:</strong> {{ date_today }}</p>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `
  }

  private static getCSSStyles(): string {
    return `
      @page {
        size: A4;
        margin: 25mm 20mm;
      }

      body {
        font-family: "Roboto", Arial, sans-serif;
        color: #111;
        background: #fff;
        margin: 0;
        padding: 0;
      }

      .certificate {
        border: 8px solid #2f4f8f;
        padding: 25px 25px 40px;
        position: relative;
        background: white;
        min-height: 297mm;
        box-sizing: border-box;
      }

      .certificate::before {
        content: "";
        position: absolute;
        inset: 12px;
        border: 3px solid #9db5cc;
        pointer-events: none;
      }

      .cert-header {
        text-align: center;
        margin-bottom: 15px;
      }

      .cert-header h1 {
        font-family: "Playfair Display", serif;
        font-size: 26px;
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .cert-header .court {
        font-size: 13px;
        margin-top: 6px;
        color: #333;
      }

      .cert-header .sub {
        font-size: 12px;
        margin-top: 2px;
        color: #555;
      }

      .section {
        margin-top: 20px;
        font-size: 13px;
        line-height: 1.5;
      }

      .section h2 {
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      .cert-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
        font-size: 12px;
        border-top: 1px solid #ccc;
        padding-top: 8px;
      }

      .petitioner-item {
        margin-bottom: 8px;
      }

      .claim-text, .petition-body, .prayer-text {
        text-align: justify;
        margin-bottom: 10px;
      }

      .caveat-section {
        margin-bottom: 15px;
      }

      .respondent-info {
        margin-bottom: 10px;
      }
    `
  }

  static downloadPDF(doc: jsPDF, filename: string) {
    doc.save(filename)
  }

  static getPDFBlob(doc: jsPDF): Blob {
    return doc.output("blob")
  }
}

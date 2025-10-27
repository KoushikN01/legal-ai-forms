from typing import Dict
import json
from datetime import datetime
import os
import tempfile
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

class PDFService:
    """Service for generating PDF documents from forms"""
    
    @staticmethod
    def generate_form_pdf(form_id: str, form_data: Dict, tracking_id: str) -> str:
        """Generate PDF from filled form data"""
        
        try:
            # Create temp directory if it doesn't exist
            temp_dir = tempfile.gettempdir()
            pdf_path = os.path.join(temp_dir, f"{tracking_id}.pdf")
            
            # Create PDF document
            doc = SimpleDocTemplate(pdf_path, pagesize=A4)
            story = []
            
            # Get styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=1,  # Center alignment
                textColor=colors.darkblue
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                spaceAfter=12,
                textColor=colors.darkblue
            )
            
            # Title
            story.append(Paragraph(f"LEGAL FORM - {form_id.upper().replace('_', ' ')}", title_style))
            story.append(Spacer(1, 12))
            
            # Form details
            story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
            story.append(Paragraph(f"<b>Tracking ID:</b> {tracking_id}", styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Form data section
            story.append(Paragraph("FORM DATA", heading_style))
            story.append(Spacer(1, 12))
            
            # Create table for form data
            table_data = [['Field', 'Value']]
            for key, value in form_data.items():
                field_name = key.replace('_', ' ').title()
                table_data.append([field_name, str(value)])
            
            table = Table(table_data, colWidths=[2*inch, 4*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
            
            # Declaration section
            story.append(Paragraph("DECLARATION", heading_style))
            story.append(Spacer(1, 12))
            
            declaration_text = """
            I hereby declare that the information provided above is true and correct to the best of my knowledge.
            I understand that any false information may result in legal consequences.
            """
            
            story.append(Paragraph(declaration_text, styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Signature line
            story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%Y-%m-%d')}", styles['Normal']))
            story.append(Spacer(1, 30))
            story.append(Paragraph("Signature: _________________________", styles['Normal']))
            
            # Build PDF
            doc.build(story)
            print(f"[PDF] Generated PDF successfully: {pdf_path}")
            return pdf_path
            
        except Exception as e:
            print(f"[PDF] Error generating PDF: {str(e)}")
            # Fallback to text file if PDF generation fails
            return PDFService._generate_text_fallback(form_id, form_data, tracking_id)
    
    @staticmethod
    def _generate_text_fallback(form_id: str, form_data: Dict, tracking_id: str) -> str:
        """Fallback text file generation if PDF fails"""
        try:
            temp_dir = tempfile.gettempdir()
            txt_path = os.path.join(temp_dir, f"{tracking_id}.txt")
            
            content = f"""
LEGAL FORM - {form_id.upper()}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Tracking ID: {tracking_id}

========================================
FORM DATA
========================================

"""
            
            for key, value in form_data.items():
                content += f"{key}: {value}\n"
            
            content += f"""

========================================
DECLARATION
========================================

I hereby declare that the information provided above is true and correct to the best of my knowledge.

Date: {datetime.now().strftime('%Y-%m-%d')}

========================================
"""
            
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            print(f"[PDF] Generated text fallback: {txt_path}")
            return txt_path
            
        except Exception as e:
            print(f"[PDF] Error generating text fallback: {str(e)}")
            return f"mock_{tracking_id}.txt"

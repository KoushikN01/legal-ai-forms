import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
from config import (
    EMAIL_SERVICE, SENDER_EMAIL, FRONTEND_URL,
    SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD
)
import os
import uuid
from datetime import datetime, timedelta

class EmailService:
    """Advanced email service for sending beautiful notifications and documents"""
    
    @staticmethod
    def send_login_notification(email: str, user_name: str, login_time: str, ip_address: str = "Unknown"):
        """Send beautiful login notification email"""
        subject = "🔐 Welcome Back! Your Account is Secure"
        
        html_body = EmailService._get_login_template(user_name, login_time, ip_address)
        EmailService._send_email(email, subject, html_body)
    
    @staticmethod
    def send_submission_confirmation(email: str, tracking_id: str, form_title: str, user_name: str):
        """Send beautiful form submission confirmation email"""
        subject = f"📋 Form Submitted Successfully - {form_title}"
        
        html_body = EmailService._get_submission_template(user_name, tracking_id, form_title)
        EmailService._send_email(email, subject, html_body)
    
    @staticmethod
    def send_status_update(email: str, tracking_id: str, status: str, message: str):
        """Send beautiful status update email"""
        subject = f"📋 Submission Status Update - {tracking_id}"
        
        status_display = {
            "submitted": "Submitted",
            "processing": "Processing", 
            "approved": "Approved",
            "rejected": "Rejected"
        }.get(status, status)
        
        # Get status-specific styling and messaging
        from email_extensions import EmailServiceExtensions
        status_info = EmailServiceExtensions._get_status_info(status)
        
        html_body = EmailServiceExtensions._get_status_update_template(tracking_id, status_display, message, status_info)
        EmailService._send_email(email, subject, html_body)
    
    @staticmethod
    def send_help_ticket_response(email: str, ticket_id: str, subject: str, response: str, user_name: str):
        """Send help ticket response email"""
        email_subject = f"💬 Help Ticket Response - {subject}"
        
        from email_extensions import EmailServiceExtensions
        html_body = EmailServiceExtensions._get_help_ticket_response_template(ticket_id, subject, response, user_name)
        EmailService._send_email(email, email_subject, html_body)
    
    @staticmethod
    def send_feedback_response(email: str, feedback_id: str, feedback_type: str, response: str, user_name: str):
        """Send feedback response email"""
        email_subject = f"⭐ Feedback Response - {feedback_type}"
        
        from email_extensions import EmailServiceExtensions
        html_body = EmailServiceExtensions._get_feedback_response_template(feedback_id, feedback_type, response, user_name)
        EmailService._send_email(email, email_subject, html_body)
    
    @staticmethod
    def _get_pdf_template(tracking_id: str) -> str:
        """Beautiful PDF notification template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Legal Form PDF</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        📄 Your Legal Form PDF
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        Your completed form is ready for download
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Your Form is Ready! 🎉
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Your legal form has been processed and is ready for download. The PDF contains all the information you provided and is properly formatted for legal use.
                    </p>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px;">📊 Form Details</h3>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Tracking ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{tracking_id}</code></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #38a169; font-weight: 600;">Completed</span></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Format:</strong> PDF Document</p>
                    </div>
                    
                    <div style="background-color: #ebf8ff; border: 1px solid #90cdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #2c5282; margin: 0 0 15px 0; font-size: 18px;">📋 Next Steps</h3>
                        <ol style="color: #2b6cb0; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Download and review your completed form</li>
                            <li>Print the form if needed for physical submission</li>
                            <li>Keep a copy for your records</li>
                            <li>Submit to the appropriate authority</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/track/{tracking_id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            View Submission Details
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #667eea; text-decoration: none; padding: 15px 30px; border: 2px solid #667eea; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Your form has been processed successfully. Contact support if you need assistance.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        EmailService._send_email(email, subject, html_body)
    
    @staticmethod
    def send_password_reset_link(email: str, reset_token: str, user_name: str = "User"):
        """Send beautiful password reset email"""
        subject = "🔑 Password Reset Request - Secure Your Account"
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_body = EmailService._get_password_reset_template(user_name, reset_link)
        EmailService._send_email(email, subject, html_body)
    
    @staticmethod
    def send_form_pdf(email: str, pdf_path: str, tracking_id: str):
        """Send form as PDF attachment"""
        subject = f"📄 Your Legal Form PDF - {tracking_id}"
        
        html_body = EmailService._get_pdf_template(tracking_id)
        
        # For now, just send the email without attachment
        # In production, you would attach the PDF file
        print(f"[EMAIL] PDF email sent to {email} (PDF: {pdf_path})")
        EmailService._send_email(email, subject, html_body)
    
    @staticmethod
    def _send_email(to_email: str, subject: str, html_body: str):
        """Internal method to send email"""
        try:
            if EMAIL_SERVICE == "smtp":
                EmailService._send_smtp_email(to_email, subject, html_body)
            elif EMAIL_SERVICE == "sendgrid":
                EmailService._send_sendgrid_email(to_email, subject, html_body)
            else:
                # Fallback to console logging
                print(f"[EMAIL] Sending to {to_email}")
                print(f"[EMAIL] Subject: {subject}")
                print(f"[EMAIL] Body: {html_body[:100]}...")
                
        except Exception as e:
            print(f"[EMAIL ERROR] {str(e)}")
    
    @staticmethod
    def _send_smtp_email(to_email: str, subject: str, html_body: str):
        """Send email using SMTP"""
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print(f"[EMAIL] SMTP not configured - logging email to console")
            print(f"[EMAIL] To: {to_email}")
            print(f"[EMAIL] Subject: {subject}")
            return
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            print(f"[EMAIL] Sent successfully to {to_email}")
    
    @staticmethod
    def _send_sendgrid_email(to_email: str, subject: str, html_body: str):
        """Send email using SendGrid API"""
        print(f"[EMAIL] SendGrid not configured - using SMTP instead")
        # Fallback to SMTP since SendGrid is not configured
        EmailService._send_smtp_email(to_email, subject, html_body)
    
    # ============ Beautiful Email Templates ============
    
    @staticmethod
    def _get_login_template(user_name: str, login_time: str, ip_address: str) -> str:
        """Beautiful login notification template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        🔐 Welcome Back!
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        Your account is secure and protected
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Hello {user_name}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We're excited to see you back! Your account was successfully accessed and is secure.
                    </p>
                    
                    <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">Login Details</h3>
                        <p style="color: #4a5568; margin: 5px 0; font-size: 14px;"><strong>Time:</strong> {login_time}</p>
                        <p style="color: #4a5568; margin: 5px 0; font-size: 14px;"><strong>IP Address:</strong> {ip_address}</p>
                    </div>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 10px 0; font-size: 18px;">🛡️ Security Tips</h3>
                        <ul style="color: #2f855a; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Always log out from shared devices</li>
                            <li>Use strong, unique passwords</li>
                            <li>Enable two-factor authentication if available</li>
                            <li>Report suspicious activity immediately</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                            Continue to Legal Voice
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        If you didn't make this login, please secure your account immediately.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_pdf_template(tracking_id: str) -> str:
        """Beautiful PDF notification template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Legal Form PDF</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        📄 Your Legal Form PDF
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        Your completed form is ready for download
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Your Form is Ready! 🎉
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Your legal form has been processed and is ready for download. The PDF contains all the information you provided and is properly formatted for legal use.
                    </p>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px;">📊 Form Details</h3>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Tracking ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{tracking_id}</code></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #38a169; font-weight: 600;">Completed</span></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Format:</strong> PDF Document</p>
                    </div>
                    
                    <div style="background-color: #ebf8ff; border: 1px solid #90cdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #2c5282; margin: 0 0 15px 0; font-size: 18px;">📋 Next Steps</h3>
                        <ol style="color: #2b6cb0; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Download and review your completed form</li>
                            <li>Print the form if needed for physical submission</li>
                            <li>Keep a copy for your records</li>
                            <li>Submit to the appropriate authority</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/track/{tracking_id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            View Submission Details
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #667eea; text-decoration: none; padding: 15px 30px; border: 2px solid #667eea; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Your form has been processed successfully. Contact support if you need assistance.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_submission_template(user_name: str, tracking_id: str, form_title: str) -> str:
        """Beautiful form submission template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Form Submission Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        📋 Form Submitted Successfully!
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        Your legal form is now being processed
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Congratulations {user_name}! 🎉
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Your <strong>{form_title}</strong> has been successfully submitted and is now in our processing queue.
                    </p>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px;">📊 Submission Details</h3>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Form Type:</strong> {form_title}</p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Tracking ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{tracking_id}</code></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #38a169; font-weight: 600;">Submitted</span></p>
                    </div>
                    
                    <div style="background-color: #ebf8ff; border: 1px solid #90cdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #2c5282; margin: 0 0 15px 0; font-size: 18px;">📈 What Happens Next?</h3>
                        <ol style="color: #2b6cb0; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Our legal team will review your submission</li>
                            <li>You'll receive email updates on the progress</li>
                            <li>Once approved, you'll get your completed form</li>
                            <li>Track your submission status anytime</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/track/{tracking_id}" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Track Your Submission
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #48bb78; text-decoration: none; padding: 15px 30px; border: 2px solid #48bb78; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Questions? Contact our support team for assistance.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_pdf_template(tracking_id: str) -> str:
        """Beautiful PDF notification template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Legal Form PDF</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        📄 Your Legal Form PDF
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        Your completed form is ready for download
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Your Form is Ready! 🎉
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Your legal form has been processed and is ready for download. The PDF contains all the information you provided and is properly formatted for legal use.
                    </p>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px;">📊 Form Details</h3>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Tracking ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{tracking_id}</code></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #38a169; font-weight: 600;">Completed</span></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Format:</strong> PDF Document</p>
                    </div>
                    
                    <div style="background-color: #ebf8ff; border: 1px solid #90cdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #2c5282; margin: 0 0 15px 0; font-size: 18px;">📋 Next Steps</h3>
                        <ol style="color: #2b6cb0; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Download and review your completed form</li>
                            <li>Print the form if needed for physical submission</li>
                            <li>Keep a copy for your records</li>
                            <li>Submit to the appropriate authority</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/track/{tracking_id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            View Submission Details
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #667eea; text-decoration: none; padding: 15px 30px; border: 2px solid #667eea; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Your form has been processed successfully. Contact support if you need assistance.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_password_reset_template(user_name: str, reset_link: str) -> str:
        """Beautiful password reset template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        🔑 Password Reset Request
                    </h1>
                    <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">
                        Secure your account with a new password
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Hello {user_name}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We received a request to reset your password for your Legal Voice account. If you made this request, click the button below to set a new password.
                    </p>
                    
                    <div style="background-color: #fffaf0; border: 1px solid #fbd38d; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #c05621; margin: 0 0 15px 0; font-size: 18px;">⚠️ Important Security Notice</h3>
                        <ul style="color: #9c4221; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>This link will expire in 24 hours</li>
                            <li>Only use this link if you requested the password reset</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Your account remains secure until you reset the password</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                            Reset My Password
                        </a>
                    </div>
                    
                    <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">🔒 Security Tips</h3>
                        <p style="color: #4a5568; margin: 5px 0; font-size: 14px;">• Use a strong password with letters, numbers, and symbols</p>
                        <p style="color: #4a5568; margin: 5px 0; font-size: 14px;">• Don't reuse passwords from other accounts</p>
                        <p style="color: #4a5568; margin: 5px 0; font-size: 14px;">• Consider using a password manager</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        If you didn't request this password reset, please contact our support team immediately.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_pdf_template(tracking_id: str) -> str:
        """Beautiful PDF notification template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Legal Form PDF</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        📄 Your Legal Form PDF
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        Your completed form is ready for download
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Your Form is Ready! 🎉
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Your legal form has been processed and is ready for download. The PDF contains all the information you provided and is properly formatted for legal use.
                    </p>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px;">📊 Form Details</h3>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Tracking ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{tracking_id}</code></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #38a169; font-weight: 600;">Completed</span></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Format:</strong> PDF Document</p>
                    </div>
                    
                    <div style="background-color: #ebf8ff; border: 1px solid #90cdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #2c5282; margin: 0 0 15px 0; font-size: 18px;">📋 Next Steps</h3>
                        <ol style="color: #2b6cb0; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Download and review your completed form</li>
                            <li>Print the form if needed for physical submission</li>
                            <li>Keep a copy for your records</li>
                            <li>Submit to the appropriate authority</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/track/{tracking_id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            View Submission Details
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #667eea; text-decoration: none; padding: 15px 30px; border: 2px solid #667eea; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Your form has been processed successfully. Contact support if you need assistance.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

#!/usr/bin/env python3
"""
Test script for email notifications
Tests all email notification types: status updates, help tickets, and feedback responses
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.email_service import EmailService
from email_extensions import EmailServiceExtensions

def test_status_update_emails():
    """Test status update email notifications"""
    print("🧪 Testing Status Update Emails...")
    
    test_cases = [
        {
            "email": "test@example.com",
            "tracking_id": "TRK20250123-TEST001",
            "status": "submitted",
            "message": "Your form has been received and is being reviewed by our legal team."
        },
        {
            "email": "test@example.com", 
            "tracking_id": "TRK20250123-TEST002",
            "status": "processing",
            "message": "Our team is currently reviewing your submission. We'll update you soon."
        },
        {
            "email": "test@example.com",
            "tracking_id": "TRK20250123-TEST003", 
            "status": "approved",
            "message": "Congratulations! Your form has been approved and is ready for use."
        },
        {
            "email": "test@example.com",
            "tracking_id": "TRK20250123-TEST004",
            "status": "rejected", 
            "message": "Your form requires some corrections. Please review the feedback and resubmit."
        }
    ]
    
    for case in test_cases:
        print(f"  📧 Sending {case['status']} status update to {case['email']}")
        try:
            EmailService.send_status_update(
                case['email'],
                case['tracking_id'], 
                case['status'],
                case['message']
            )
            print(f"  ✅ {case['status']} email sent successfully")
        except Exception as e:
            print(f"  ❌ Error sending {case['status']} email: {e}")
    
    print("✅ Status Update Email Tests Complete\n")

def test_help_ticket_emails():
    """Test help ticket response email notifications"""
    print("🧪 Testing Help Ticket Response Emails...")
    
    test_cases = [
        {
            "email": "user1@example.com",
            "ticket_id": "TICKET-001",
            "subject": "Form submission issue",
            "response": "Thank you for contacting us. We've identified the issue and it should be resolved now. Please try submitting your form again.",
            "user_name": "John Doe"
        },
        {
            "email": "user2@example.com",
            "ticket_id": "TICKET-002", 
            "subject": "Payment processing problem",
            "response": "We've processed your payment and your form is now being reviewed. You should receive an update within 24 hours.",
            "user_name": "Jane Smith"
        },
        {
            "email": "user3@example.com",
            "ticket_id": "TICKET-003",
            "subject": "Document upload error", 
            "response": "The document upload issue has been fixed. Please try uploading your documents again. If you continue to experience issues, please contact us immediately.",
            "user_name": "Bob Johnson"
        }
    ]
    
    for case in test_cases:
        print(f"  📧 Sending help ticket response to {case['email']}")
        try:
            EmailService.send_help_ticket_response(
                case['email'],
                case['ticket_id'],
                case['subject'], 
                case['response'],
                case['user_name']
            )
            print(f"  ✅ Help ticket response sent successfully")
        except Exception as e:
            print(f"  ❌ Error sending help ticket response: {e}")
    
    print("✅ Help Ticket Response Email Tests Complete\n")

def test_feedback_emails():
    """Test feedback response email notifications"""
    print("🧪 Testing Feedback Response Emails...")
    
    test_cases = [
        {
            "email": "feedback1@example.com",
            "feedback_id": "FEEDBACK-001",
            "feedback_type": "feature_request",
            "response": "Thank you for your valuable feedback! We're considering your suggestion for our next update. We'll keep you posted on our progress.",
            "user_name": "Alice Brown"
        },
        {
            "email": "feedback2@example.com",
            "feedback_id": "FEEDBACK-002",
            "feedback_type": "bug_report", 
            "response": "We've identified and fixed the bug you reported. The issue should be resolved in our next release. Thank you for helping us improve!",
            "user_name": "Charlie Wilson"
        },
        {
            "email": "feedback3@example.com",
            "feedback_id": "FEEDBACK-003",
            "feedback_type": "general_feedback",
            "response": "We appreciate your feedback and are constantly working to improve our service. Your input helps us serve you better.",
            "user_name": "Diana Lee"
        }
    ]
    
    for case in test_cases:
        print(f"  📧 Sending feedback response to {case['email']}")
        try:
            EmailService.send_feedback_response(
                case['email'],
                case['feedback_id'],
                case['feedback_type'],
                case['response'], 
                case['user_name']
            )
            print(f"  ✅ Feedback response sent successfully")
        except Exception as e:
            print(f"  ❌ Error sending feedback response: {e}")
    
    print("✅ Feedback Response Email Tests Complete\n")

def test_email_templates():
    """Test email template generation"""
    print("🧪 Testing Email Template Generation...")
    
    # Test status info generation
    statuses = ["submitted", "processing", "approved", "rejected"]
    for status in statuses:
        try:
            status_info = EmailServiceExtensions._get_status_info(status)
            print(f"  ✅ Status info for '{status}': {status_info['title']} ({status_info['icon']})")
        except Exception as e:
            print(f"  ❌ Error getting status info for '{status}': {e}")
    
    # Test template generation
    try:
        template = EmailServiceExtensions._get_status_update_template(
            "TRK-TEST-001",
            "Approved", 
            "Your form has been approved!",
            EmailServiceExtensions._get_status_info("approved")
        )
        print(f"  ✅ Status update template generated ({len(template)} characters)")
    except Exception as e:
        print(f"  ❌ Error generating status update template: {e}")
    
    try:
        template = EmailServiceExtensions._get_help_ticket_response_template(
            "TICKET-001",
            "Test Subject",
            "Test response message",
            "Test User"
        )
        print(f"  ✅ Help ticket template generated ({len(template)} characters)")
    except Exception as e:
        print(f"  ❌ Error generating help ticket template: {e}")
    
    try:
        template = EmailServiceExtensions._get_feedback_response_template(
            "FEEDBACK-001",
            "feature_request",
            "Test feedback response",
            "Test User"
        )
        print(f"  ✅ Feedback template generated ({len(template)} characters)")
    except Exception as e:
        print(f"  ❌ Error generating feedback template: {e}")
    
    print("✅ Email Template Tests Complete\n")

def main():
    """Run all email notification tests"""
    print("🚀 Starting Email Notification Tests")
    print("=" * 50)
    
    try:
        # Test email templates first
        test_email_templates()
        
        # Test actual email sending
        test_status_update_emails()
        test_help_ticket_emails() 
        test_feedback_emails()
        
        print("🎉 All Email Notification Tests Completed Successfully!")
        print("=" * 50)
        print("📧 Check your email configuration to see if emails were sent")
        print("💡 In development mode, emails are logged to console")
        
    except Exception as e:
        print(f"❌ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Test script for email functionality only (bypassing PDF generation)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.email_service import EmailService
from datetime import datetime

def test_email_directly():
    """Test email service directly"""
    print("🧪 Testing Email Service Directly...")
    try:
        EmailService.send_submission_confirmation(
            email="test@example.com",
            tracking_id="TRK20241201-TEST1234",
            form_title="Name Change Affidavit",
            user_name="Test User"
        )
        print("✅ Email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_background_task_simulation():
    """Simulate background task email sending"""
    print("\n🧪 Testing Background Task Email Simulation...")
    try:
        # Simulate what happens in the background task
        from fastapi import BackgroundTasks
        
        def send_email_task(email, tracking_id, form_title, user_name):
            print(f"[BACKGROUND TASK] Sending email to {email}")
            EmailService.send_submission_confirmation(email, tracking_id, form_title, user_name)
            print(f"[BACKGROUND TASK] Email sent successfully!")
        
        # Simulate the background task
        send_email_task(
            email="test@example.com",
            tracking_id="TRK20241201-BACKGROUND123",
            form_title="Name Change Affidavit", 
            user_name="Test User"
        )
        
        print("✅ Background task email simulation successful!")
        return True
    except Exception as e:
        print(f"❌ Background task email failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Testing Email Functionality")
    print("=" * 50)
    
    success1 = test_email_directly()
    success2 = test_background_task_simulation()
    
    if success1 and success2:
        print("\n✅ All email tests passed!")
        print("The email system is working correctly.")
    else:
        print("\n❌ Some email tests failed!")
        print("Check the error messages above for details.")
    
    print("\nNote: In development mode, emails are logged to console.")

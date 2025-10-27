#!/usr/bin/env python3
"""
Test email configuration
Run this script to test your email setup
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.email_service import EmailService

def test_email():
    """Test email sending functionality"""
    print("🧪 Testing Email Configuration...")
    print("=" * 50)
    
    # Test email details
    test_email = input("Enter your email address to test: ").strip()
    if not test_email:
        print("❌ No email address provided")
        return
    
    print(f"\n📧 Sending test email to: {test_email}")
    
    try:
        # Test submission confirmation email
        EmailService.send_submission_confirmation(
            email=test_email,
            tracking_id="TEST-123456",
            form_title="Test Form"
        )
        
        print("✅ Email sent successfully!")
        print("📬 Check your inbox (and spam folder)")
        
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your environment variables in .env")
        print("2. Verify your email credentials")
        print("3. Check if 2FA is enabled for Gmail")
        print("4. Ensure app password is correct")

if __name__ == "__main__":
    test_email()





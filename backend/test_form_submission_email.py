#!/usr/bin/env python3
"""
Test script specifically for form submission email
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.email_service import EmailService

def test_form_submission_email():
    """Test form submission email specifically"""
    print("🧪 Testing Form Submission Email...")
    try:
        EmailService.send_submission_confirmation(
            email="test@example.com",
            tracking_id="TRK20241201-TEST1234",
            form_title="Name Change Affidavit",
            user_name="Test User"
        )
        print("✅ Form submission email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Form submission email failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Testing Form Submission Email")
    print("=" * 50)
    
    success = test_form_submission_email()
    
    if success:
        print("\n✅ Form submission email is working!")
    else:
        print("\n❌ Form submission email has issues!")
    
    print("\nNote: Check the console output above for email content.")

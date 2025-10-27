#!/usr/bin/env python3
"""
Create a test token for testing purposes
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from services.auth_service import AuthService
    print("✅ Auth Service loaded successfully!")
except Exception as e:
    print(f"❌ Error loading Auth Service: {e}")
    sys.exit(1)

def create_test_token():
    """Create a test token for testing purposes"""
    print("🔑 Creating Test Token")
    print("=" * 40)
    
    # Create a test token
    token = AuthService.create_token(
        user_id="test_user_123",
        email="test@example.com",
        is_admin=False
    )
    
    print(f"✅ Test Token Created:")
    print(f"Token: {token}")
    print(f"User ID: test_user_123")
    print(f"Email: test@example.com")
    print(f"Admin: False")
    
    # Verify the token
    payload = AuthService.verify_token(token)
    if payload:
        print(f"\n✅ Token Verification Successful:")
        print(f"User ID: {payload.get('user_id')}")
        print(f"Email: {payload.get('email')}")
        print(f"Admin: {payload.get('isAdmin')}")
        print(f"Expires: {payload.get('exp')}")
    else:
        print(f"\n❌ Token Verification Failed")
    
    print(f"\n📝 Use this token in your frontend:")
    print(f"localStorage.setItem('token', '{token}')")
    
    return token

if __name__ == "__main__":
    create_test_token()

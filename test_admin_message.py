#!/usr/bin/env python3
"""
Test admin message sending
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_admin_message():
    """Test admin sending message to user"""
    
    # First, let's try to get an admin token
    print("🔐 Testing admin authentication...")
    
    # Try to login as admin
    admin_login_data = {
        "email": "rahul5g4g3g@gmail.com",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=admin_login_data)
        print(f"Login response status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            admin_data = login_response.json()
            admin_token = admin_data.get("access_token")
            print(f"✅ Admin token obtained: {admin_token[:20]}...")
            
            # Now try to send a message as admin
            print("\n📤 Testing admin message sending...")
            
            message_data = {
                "sender": "admin",
                "text": "Hello from admin!",
                "user_id": "test-user-123"  # Some test user ID
            }
            
            headers = {
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
            
            message_response = requests.post(f"{API_BASE_URL}/chat/messages", 
                                           headers=headers, 
                                           json=message_data)
            
            print(f"Message response status: {message_response.status_code}")
            print(f"Message response: {message_response.text}")
            
            if message_response.status_code == 200:
                print("✅ Admin message sent successfully!")
            else:
                print("❌ Admin message failed")
                
        else:
            print(f"❌ Admin login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_admin_message()

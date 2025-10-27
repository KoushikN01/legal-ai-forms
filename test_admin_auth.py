#!/usr/bin/env python3
"""
Test admin authentication and message sending
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_admin_auth():
    """Test admin authentication"""
    
    print("🔐 Testing admin authentication...")
    
    # Try to login as admin
    admin_login_data = {
        "email": "rahul5g4g3g@gmail.com",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=admin_login_data)
        print(f"Admin login response status: {login_response.status_code}")
        print(f"Admin login response: {login_response.text}")
        
        if login_response.status_code == 200:
            admin_data = login_response.json()
            admin_token = admin_data.get("token")
            print(f"✅ Admin token obtained: {admin_token[:20]}...")
            
            # Test admin message sending
            print("\n📤 Testing admin message sending...")
            
            # First, let's get a user to send message to
            print("Getting users...")
            users_response = requests.get(f"{API_BASE_URL}/admin/messages", 
                                        headers={"Authorization": f"Bearer {admin_token}"})
            print(f"Users response status: {users_response.status_code}")
            print(f"Users response: {users_response.text}")
            
            if users_response.status_code == 200:
                users_data = users_response.json()
                messages = users_data.get("messages", [])
                print(f"Found {len(messages)} messages")
                
                if messages:
                    # Get the first user from messages
                    first_message = messages[0]
                    user_id = first_message.get("user_id") or first_message.get("userId")
                    print(f"Using user ID: {user_id}")
                    
                    # Now try to send a message to this user
                    message_data = {
                        "sender": "admin",
                        "text": "Hello from admin!",
                        "user_id": user_id
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
                    print("❌ No users found to send message to")
            else:
                print("❌ Failed to get users")
                
        else:
            print(f"❌ Admin login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_admin_auth()

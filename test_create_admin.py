#!/usr/bin/env python3
"""
Create admin user and test admin functionality
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def create_admin_user():
    """Create admin user"""
    
    print("👤 Creating admin user...")
    
    # Create admin user
    admin_data = {
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "admin123",
        "phone": "1234567890"
    }
    
    try:
        signup_response = requests.post(f"{API_BASE_URL}/auth/signup", json=admin_data)
        print(f"Admin signup response status: {signup_response.status_code}")
        print(f"Admin signup response: {signup_response.text}")
        
        if signup_response.status_code == 200 or "duplicate key error" in signup_response.text:
            print("✅ Admin user exists (or was created successfully)!")
            
            # Try to login with existing admin
            login_data = {
                "email": "admin@example.com",
                "password": "admin123"
            }
            
            login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=login_data)
            print(f"Admin login response status: {login_response.status_code}")
            print(f"Admin login response: {login_response.text}")
            
            if login_response.status_code == 200:
                admin_info = login_response.json()
                admin_token = admin_info["token"]
                admin_user_id = admin_info["user_id"]
            else:
                print("❌ Admin login failed")
                return
            
            print(f"Admin User ID: {admin_user_id}")
            print(f"Admin Token: {admin_token[:20]}...")
            
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
            print("❌ Admin user creation failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_user()

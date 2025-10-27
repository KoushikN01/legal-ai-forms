#!/usr/bin/env python3
"""
Test user receiving admin messages
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_user_receive_messages():
    """Test user receiving admin messages"""
    
    print("🔍 Testing user receiving admin messages...")
    
    # Create a test user
    timestamp = int(time.time())
    email = f"testuser{timestamp}@example.com"
    
    print(f"👤 Creating test user: {email}")
    
    try:
        # Create user
        user_data = {
            "name": "Test User",
            "email": email,
            "password": "test123",
            "phone": "1234567890"
        }
        
        signup_response = requests.post(f"{API_BASE_URL}/auth/signup", json=user_data)
        print(f"User signup response status: {signup_response.status_code}")
        
        if signup_response.status_code == 200:
            print("✅ Test user created successfully!")
            user_info = signup_response.json()
            user_id = user_info["user"]["user_id"]
            user_token = user_info["token"]
            
            print(f"User ID: {user_id}")
            print(f"User Token: {user_token[:20]}...")
            
            # Login as admin
            print("\n🔐 Logging in as admin...")
            admin_login_data = {
                "email": "admin@example.com",
                "password": "admin123"
            }
            
            admin_login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=admin_login_data)
            print(f"Admin login response status: {admin_login_response.status_code}")
            
            if admin_login_response.status_code == 200:
                admin_info = admin_login_response.json()
                admin_token = admin_info["token"]
                print(f"✅ Admin logged in successfully!")
                
                # Admin sends message to user
                print("\n📤 Admin sending message to user...")
                message_data = {
                    "sender": "admin",
                    "text": f"Hello {email}! This is a test message from admin.",
                    "user_id": user_id
                }
                
                admin_headers = {
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                }
                
                message_response = requests.post(f"{API_BASE_URL}/chat/messages", 
                                               headers=admin_headers, 
                                               json=message_data)
                
                print(f"Admin message response status: {message_response.status_code}")
                print(f"Admin message response: {message_response.text}")
                
                if message_response.status_code == 200:
                    print("✅ Admin message sent successfully!")
                    
                    # Wait a moment
                    time.sleep(2)
                    
                    # User fetches their messages
                    print("\n📥 User fetching their messages...")
                    user_headers = {
                        "Authorization": f"Bearer {user_token}",
                        "Content-Type": "application/json"
                    }
                    
                    user_messages_response = requests.get(f"{API_BASE_URL}/chat/messages", 
                                                        headers=user_headers)
                    
                    print(f"User messages response status: {user_messages_response.status_code}")
                    print(f"User messages response: {user_messages_response.text}")
                    
                    if user_messages_response.status_code == 200:
                        messages_data = user_messages_response.json()
                        messages = messages_data.get("messages", [])
                        print(f"✅ User received {len(messages)} messages")
                        
                        # Check if admin message is in user's messages
                        admin_messages = [msg for msg in messages if msg.get("sender") == "admin"]
                        print(f"📨 Admin messages in user's chat: {len(admin_messages)}")
                        
                        if admin_messages:
                            print("✅ SUCCESS: User received admin message!")
                            for msg in admin_messages:
                                print(f"  - {msg.get('text')} (from {msg.get('sender')})")
                        else:
                            print("❌ FAILED: User did not receive admin message")
                    else:
                        print("❌ User failed to fetch messages")
                else:
                    print("❌ Admin message sending failed")
            else:
                print("❌ Admin login failed")
        else:
            print("❌ Test user creation failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_user_receive_messages()

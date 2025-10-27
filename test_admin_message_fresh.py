#!/usr/bin/env python3
"""
Test admin message sending with fresh user
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_admin_message_fresh():
    """Test admin sending message to fresh user"""
    
    # Create a fresh user first
    timestamp = int(time.time())
    email = f"test{timestamp}@example.com"
    
    print(f"🔍 Creating fresh user: {email}")
    
    try:
        # Create a new user
        print("\n👤 Creating fresh user...")
        user_data = {
            "name": "Fresh Test User",
            "email": email,
            "password": "test123",
            "phone": "1234567890"
        }
        
        signup_response = requests.post(f"{API_BASE_URL}/auth/signup", json=user_data)
        print(f"Signup response status: {signup_response.status_code}")
        
        if signup_response.status_code == 200:
            print("✅ Fresh user created successfully!")
            user_info = signup_response.json()
            user_id = user_info["user"]["user_id"]
            token = user_info["token"]
            
            print(f"User ID: {user_id}")
            print(f"Token: {token[:20]}...")
            
            # Now try to send a message as admin to this user
            print("\n📤 Testing admin message sending to fresh user...")
            message_data = {
                "sender": "admin",
                "text": "Hello from admin to fresh user!",
                "user_id": user_id
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            message_response = requests.post(f"{API_BASE_URL}/chat/messages", 
                                           headers=headers, 
                                           json=message_data)
            
            print(f"Message response status: {message_response.status_code}")
            print(f"Message response: {message_response.text}")
            
            if message_response.status_code == 200:
                print("✅ Admin message sent successfully!")
                
                # Now try to get messages to see if it appears
                print("\n📥 Testing message retrieval...")
                messages_response = requests.get(f"{API_BASE_URL}/chat/messages", 
                                               headers=headers)
                
                print(f"Messages response status: {messages_response.status_code}")
                print(f"Messages response: {messages_response.text}")
                
            else:
                print("❌ Admin message failed")
                
        else:
            print("❌ Fresh user creation failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_admin_message_fresh()

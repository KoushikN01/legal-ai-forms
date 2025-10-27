#!/usr/bin/env python3
"""
Check what users exist in the database
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def check_users():
    """Check what users exist"""
    
    print("🔍 Checking users in database...")
    
    # Try to get all users (this might require admin access)
    try:
        # First, let's try to create a test user
        print("\n👤 Creating test user...")
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "test123",
            "phone": "1234567890"
        }
        
        signup_response = requests.post(f"{API_BASE_URL}/auth/signup", json=user_data)
        print(f"Signup response status: {signup_response.status_code}")
        print(f"Signup response: {signup_response.text}")
        
        if signup_response.status_code == 200 or "duplicate key error" in signup_response.text:
            print("✅ Test user exists (or was created successfully)!")
            
            # Now try to login with test user
            print("\n🔐 Testing user login...")
            login_data = {
                "email": "test@example.com",
                "password": "test123"
            }
            
            login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=login_data)
            print(f"Login response status: {login_response.status_code}")
            print(f"Login response: {login_response.text}")
            
            if login_response.status_code == 200:
                print("✅ User login successful!")
                user_data = login_response.json()
                token = user_data.get("access_token")
                print(f"Token: {token[:20]}...")
                
                # Now try to send a message as this user
                print("\n📤 Testing user message sending...")
                message_data = {
                    "sender": "user",
                    "text": "Hello from test user!"
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
                
        else:
            print("❌ Test user creation failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_users()

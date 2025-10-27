#!/usr/bin/env python3
"""
Test with a fresh user to debug authentication
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_fresh_user():
    """Test with a fresh user"""
    
    # Create a unique email
    timestamp = int(time.time())
    email = f"test{timestamp}@example.com"
    
    print(f"🔍 Testing with fresh user: {email}")
    
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
        print(f"Signup response: {signup_response.text}")
        
        if signup_response.status_code == 200:
            print("✅ Fresh user created successfully!")
            
            # Now try to login with this user
            print("\n🔐 Testing fresh user login...")
            login_data = {
                "email": email,
                "password": "test123"
            }
            
            login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=login_data)
            print(f"Login response status: {login_response.status_code}")
            print(f"Login response: {login_response.text}")
            
            if login_response.status_code == 200:
                print("✅ Fresh user login successful!")
                user_data = login_response.json()
                token = user_data.get("token")
                print(f"Token: {token[:20]}...")
                
                # Now try to send a message as this user
                print("\n📤 Testing user message sending...")
                message_data = {
                    "sender": "user",
                    "text": "Hello from fresh user!"
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
                print("❌ Fresh user login failed")
        else:
            print("❌ Fresh user creation failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_fresh_user()

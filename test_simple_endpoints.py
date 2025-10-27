#!/usr/bin/env python3
"""
Simple test to debug the endpoint issues
"""

import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
ADMIN_PASSWORD = "Rahul@123"

def test_simple_endpoints():
    print("🧪 Testing Simple Endpoints")
    print("=" * 40)
    
    # Step 1: Login as admin
    print("\n1. Logging in as admin...")
    login_response = requests.post(f"{API_BASE_URL}/auth/signin", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
        return False
    
    login_data = login_response.json()
    token = login_data.get("token")
    print(f"✅ Admin login successful")
    print(f"   Token: {token[:50]}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Test chat message with detailed error handling
    print("\n2. Testing chat message creation...")
    try:
        chat_response = requests.post(f"{API_BASE_URL}/chat/messages", 
            json={"sender": "user", "text": "Hello admin, this is a test message"}, 
            headers=headers)
        
        print(f"   Status Code: {chat_response.status_code}")
        print(f"   Response Headers: {dict(chat_response.headers)}")
        print(f"   Response Text: {chat_response.text}")
        
        if chat_response.status_code == 200:
            print("✅ Chat message created successfully")
        else:
            print("❌ Chat message failed")
            
    except Exception as e:
        print(f"❌ Chat message exception: {e}")
    
    # Step 3: Test help ticket with detailed error handling
    print("\n3. Testing help ticket creation...")
    try:
        ticket_response = requests.post(f"{API_BASE_URL}/user/tickets", 
            json={
                "subject": "Test Help Ticket", 
                "description": "This is a test help ticket for admin dashboard", 
                "priority": "high"
            }, 
            headers=headers)
        
        print(f"   Status Code: {ticket_response.status_code}")
        print(f"   Response Headers: {dict(ticket_response.headers)}")
        print(f"   Response Text: {ticket_response.text}")
        
        if ticket_response.status_code == 200:
            print("✅ Help ticket created successfully")
        else:
            print("❌ Help ticket failed")
            
    except Exception as e:
        print(f"❌ Help ticket exception: {e}")
    
    # Step 4: Test feedback with detailed error handling
    print("\n4. Testing feedback creation...")
    try:
        feedback_response = requests.post(f"{API_BASE_URL}/user/feedbacks", 
            json={
                "feedback_type": "general", 
                "message": "This is a test feedback for admin dashboard", 
                "rating": 5
            }, 
            headers=headers)
        
        print(f"   Status Code: {feedback_response.status_code}")
        print(f"   Response Headers: {dict(feedback_response.headers)}")
        print(f"   Response Text: {feedback_response.text}")
        
        if feedback_response.status_code == 200:
            print("✅ Feedback created successfully")
        else:
            print("❌ Feedback failed")
            
    except Exception as e:
        print(f"❌ Feedback exception: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 Simple endpoint test completed!")

if __name__ == "__main__":
    try:
        test_simple_endpoints()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

#!/usr/bin/env python3
"""
Test script to debug user creation endpoints
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
USER_EMAIL = "darlingshivaji7@gmail.com"
USER_PASSWORD = "Shivaji@123"

def test_user_creation():
    print("🧪 Testing User Creation Endpoints")
    print("=" * 50)
    
    # Step 1: Login as regular user
    print("\n1. Logging in as regular user...")
    login_response = requests.post(f"{API_BASE_URL}/auth/signin", json={
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
        return False
    
    login_data = login_response.json()
    token = login_data.get("token")
    user_data = login_data.get("user", {})
    print(f"✅ User login successful")
    print(f"   Token: {token[:50]}...")
    print(f"   User ID: {user_data.get('user_id', user_data.get('id'))}")
    print(f"   User Email: {user_data.get('email')}")
    print(f"   User Name: {user_data.get('name')}")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Test chat message creation
    print("\n2. Testing chat message creation...")
    try:
        chat_response = requests.post(f"{API_BASE_URL}/chat/messages", 
            json={"sender": "user", "text": "Hello admin, this is a test message from user"}, 
            headers=headers)
        
        print(f"   Status Code: {chat_response.status_code}")
        print(f"   Response: {chat_response.text}")
        
        if chat_response.status_code == 200:
            print("✅ Chat message created successfully")
        else:
            print("❌ Chat message failed")
            
    except Exception as e:
        print(f"❌ Chat message exception: {e}")
    
    # Step 3: Test help ticket creation
    print("\n3. Testing help ticket creation...")
    try:
        ticket_response = requests.post(f"{API_BASE_URL}/user/tickets", 
            json={
                "subject": "Test Help Ticket from User", 
                "description": "This is a test help ticket created by user", 
                "priority": "high"
            }, 
            headers=headers)
        
        print(f"   Status Code: {ticket_response.status_code}")
        print(f"   Response: {ticket_response.text}")
        
        if ticket_response.status_code == 200:
            print("✅ Help ticket created successfully")
        else:
            print("❌ Help ticket failed")
            
    except Exception as e:
        print(f"❌ Help ticket exception: {e}")
    
    # Step 4: Test feedback creation
    print("\n4. Testing feedback creation...")
    try:
        feedback_response = requests.post(f"{API_BASE_URL}/user/feedbacks", 
            json={
                "feedback_type": "general", 
                "message": "This is a test feedback from user", 
                "rating": 5
            }, 
            headers=headers)
        
        print(f"   Status Code: {feedback_response.status_code}")
        print(f"   Response: {feedback_response.text}")
        
        if feedback_response.status_code == 200:
            print("✅ Feedback created successfully")
        else:
            print("❌ Feedback failed")
            
    except Exception as e:
        print(f"❌ Feedback exception: {e}")
    
    # Step 5: Test admin endpoints to see if data appears
    print("\n5. Testing admin endpoints...")
    
    # Login as admin
    admin_login_response = requests.post(f"{API_BASE_URL}/auth/signin", json={
        "email": "rahul5g4g3g@gmail.com",
        "password": "Rahul@123"
    })
    
    if admin_login_response.status_code == 200:
        admin_token = admin_login_response.json().get("token")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Check admin messages
        admin_messages_response = requests.get(f"{API_BASE_URL}/admin/messages", headers=admin_headers)
        if admin_messages_response.status_code == 200:
            messages_data = admin_messages_response.json()
            print(f"   ✅ Admin messages: {messages_data.get('count', 0)} messages")
        
        # Check admin tickets
        admin_tickets_response = requests.get(f"{API_BASE_URL}/admin/tickets", headers=admin_headers)
        if admin_tickets_response.status_code == 200:
            tickets_data = admin_tickets_response.json()
            print(f"   ✅ Admin tickets: {tickets_data.get('count', 0)} tickets")
        
        # Check admin feedbacks
        admin_feedbacks_response = requests.get(f"{API_BASE_URL}/admin/feedbacks", headers=admin_headers)
        if admin_feedbacks_response.status_code == 200:
            feedbacks_data = admin_feedbacks_response.json()
            print(f"   ✅ Admin feedbacks: {feedbacks_data.get('count', 0)} feedbacks")
    
    print("\n" + "=" * 50)
    print("🎉 User creation test completed!")

if __name__ == "__main__":
    try:
        test_user_creation()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

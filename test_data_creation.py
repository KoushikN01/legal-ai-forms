#!/usr/bin/env python3
"""
Test script to create test data and verify admin endpoints
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
ADMIN_PASSWORD = "Rahul@123"

def create_test_data():
    print("🧪 Creating Test Data for Admin Dashboard")
    print("=" * 50)
    
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
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Create test chat message
    print("\n2. Creating test chat message...")
    chat_response = requests.post(f"{API_BASE_URL}/chat/messages", 
        json={"sender": "user", "text": "Hello admin, this is a test message"}, 
        headers=headers)
    
    if chat_response.status_code == 200:
        print("✅ Chat message created successfully")
        print(f"   Response: {chat_response.json()}")
    else:
        print(f"❌ Chat message failed: {chat_response.status_code} - {chat_response.text}")
    
    # Step 3: Create test help ticket
    print("\n3. Creating test help ticket...")
    ticket_response = requests.post(f"{API_BASE_URL}/user/tickets", 
        json={
            "subject": "Test Help Ticket", 
            "description": "This is a test help ticket for admin dashboard", 
            "priority": "high"
        }, 
        headers=headers)
    
    if ticket_response.status_code == 200:
        print("✅ Help ticket created successfully")
        print(f"   Response: {ticket_response.json()}")
    else:
        print(f"❌ Help ticket failed: {ticket_response.status_code} - {ticket_response.text}")
    
    # Step 4: Create test feedback
    print("\n4. Creating test feedback...")
    feedback_response = requests.post(f"{API_BASE_URL}/user/feedbacks", 
        json={
            "feedback_type": "general", 
            "message": "This is a test feedback for admin dashboard", 
            "rating": 5
        }, 
        headers=headers)
    
    if feedback_response.status_code == 200:
        print("✅ Feedback created successfully")
        print(f"   Response: {feedback_response.json()}")
    else:
        print(f"❌ Feedback failed: {feedback_response.status_code} - {feedback_response.text}")
    
    # Step 5: Test admin endpoints
    print("\n5. Testing admin endpoints...")
    
    # Test admin messages
    print("\n   Testing admin messages...")
    admin_messages_response = requests.get(f"{API_BASE_URL}/admin/messages", headers=headers)
    if admin_messages_response.status_code == 200:
        messages_data = admin_messages_response.json()
        print(f"   ✅ Admin messages: {messages_data.get('count', 0)} messages")
        if messages_data.get('messages'):
            print(f"   Sample message: {messages_data['messages'][0]}")
    else:
        print(f"   ❌ Admin messages failed: {admin_messages_response.status_code}")
    
    # Test admin tickets
    print("\n   Testing admin tickets...")
    admin_tickets_response = requests.get(f"{API_BASE_URL}/admin/tickets", headers=headers)
    if admin_tickets_response.status_code == 200:
        tickets_data = admin_tickets_response.json()
        print(f"   ✅ Admin tickets: {tickets_data.get('count', 0)} tickets")
        if tickets_data.get('tickets'):
            print(f"   Sample ticket: {tickets_data['tickets'][0]}")
    else:
        print(f"   ❌ Admin tickets failed: {admin_tickets_response.status_code}")
    
    # Test admin feedbacks
    print("\n   Testing admin feedbacks...")
    admin_feedbacks_response = requests.get(f"{API_BASE_URL}/admin/feedbacks", headers=headers)
    if admin_feedbacks_response.status_code == 200:
        feedbacks_data = admin_feedbacks_response.json()
        print(f"   ✅ Admin feedbacks: {feedbacks_data.get('count', 0)} feedbacks")
        if feedbacks_data.get('feedbacks'):
            print(f"   Sample feedback: {feedbacks_data['feedbacks'][0]}")
    else:
        print(f"   ❌ Admin feedbacks failed: {admin_feedbacks_response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎉 Test data creation completed!")
    print("Check the backend logs for detailed debug information.")

if __name__ == "__main__":
    try:
        create_test_data()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

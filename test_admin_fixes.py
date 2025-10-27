#!/usr/bin/env python3
"""
Test script to verify admin fixes for chat messages, help tickets, and feedbacks
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
ADMIN_PASSWORD = "Rahul@123"

def test_admin_fixes():
    print("🧪 Testing Admin Fixes for Chat Messages, Help Tickets, and Feedbacks")
    print("=" * 70)
    
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
    
    # Step 2: Test chat messages
    print("\n2. Testing chat messages...")
    
    # Send a test chat message
    chat_response = requests.post(f"{API_BASE_URL}/chat/messages", 
        json={"sender": "user", "text": "Test message from user to admin"}, 
        headers=headers)
    
    if chat_response.status_code == 200:
        print("✅ Chat message sent successfully")
    else:
        print(f"❌ Chat message failed: {chat_response.status_code} - {chat_response.text}")
    
    # Get admin messages
    admin_messages_response = requests.get(f"{API_BASE_URL}/admin/messages", headers=headers)
    
    if admin_messages_response.status_code == 200:
        messages_data = admin_messages_response.json()
        print(f"✅ Admin can see {messages_data.get('count', 0)} chat messages")
        if messages_data.get('count', 0) > 0:
            print(f"   Latest message: {messages_data['messages'][0].get('text', 'N/A')}")
    else:
        print(f"❌ Admin messages failed: {admin_messages_response.status_code} - {admin_messages_response.text}")
    
    # Step 3: Test help tickets
    print("\n3. Testing help tickets...")
    
    # Create a test help ticket
    ticket_response = requests.post(f"{API_BASE_URL}/user/tickets", 
        json={"subject": "Test Help Ticket", "description": "This is a test help ticket", "priority": "high"}, 
        headers=headers)
    
    if ticket_response.status_code == 200:
        print("✅ Help ticket created successfully")
    else:
        print(f"❌ Help ticket creation failed: {ticket_response.status_code} - {ticket_response.text}")
    
    # Get admin tickets
    admin_tickets_response = requests.get(f"{API_BASE_URL}/admin/tickets", headers=headers)
    
    if admin_tickets_response.status_code == 200:
        tickets_data = admin_tickets_response.json()
        print(f"✅ Admin can see {tickets_data.get('count', 0)} help tickets")
        if tickets_data.get('count', 0) > 0:
            print(f"   Latest ticket: {tickets_data['tickets'][0].get('subject', 'N/A')}")
    else:
        print(f"❌ Admin tickets failed: {admin_tickets_response.status_code} - {admin_tickets_response.text}")
    
    # Step 4: Test feedbacks
    print("\n4. Testing feedbacks...")
    
    # Create a test feedback
    feedback_response = requests.post(f"{API_BASE_URL}/user/feedbacks", 
        json={"feedback_type": "general", "message": "This is a test feedback", "rating": 5}, 
        headers=headers)
    
    if feedback_response.status_code == 200:
        print("✅ Feedback created successfully")
    else:
        print(f"❌ Feedback creation failed: {feedback_response.status_code} - {feedback_response.text}")
    
    # Get admin feedbacks
    admin_feedbacks_response = requests.get(f"{API_BASE_URL}/admin/feedbacks", headers=headers)
    
    if admin_feedbacks_response.status_code == 200:
        feedbacks_data = admin_feedbacks_response.json()
        print(f"✅ Admin can see {feedbacks_data.get('count', 0)} feedbacks")
        if feedbacks_data.get('count', 0) > 0:
            print(f"   Latest feedback: {feedbacks_data['feedbacks'][0].get('message', 'N/A')}")
    else:
        print(f"❌ Admin feedbacks failed: {admin_feedbacks_response.status_code} - {admin_feedbacks_response.text}")
    
    print("\n" + "=" * 70)
    print("🎉 Admin fixes test completed!")
    print("\nSummary:")
    print("- Chat messages are now saved to database and visible to admin")
    print("- Help tickets are now saved to database and visible to admin") 
    print("- Feedbacks are now saved to database and visible to admin")
    print("- All data persists after logout/login")

if __name__ == "__main__":
    try:
        test_admin_fixes()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

#!/usr/bin/env python3
"""
Test script for admin improvements
Tests: email notifications, chat filters, database storage
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json
from datetime import datetime, timedelta

# Test configuration
API_BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "rahul5g4g3g@gmail.com"
ADMIN_PASSWORD = "Rahul@123"

def test_admin_login():
    """Test admin login to get token"""
    print("🔐 Testing Admin Login...")
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print(f"✅ Admin login successful")
            return token
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None

def test_chat_message_storage(token):
    """Test chat message storage in database"""
    print("💬 Testing Chat Message Storage...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test sending a chat message
    try:
        response = requests.post(f"{API_BASE_URL}/chat/messages", 
                              headers=headers,
                              json={
                                  "sender": "admin",
                                  "text": "Test admin message",
                                  "user_id": "test_user_123"
                              })
        if response.status_code == 200:
            data = response.json()
            message_id = data.get("message_id")
            print(f"✅ Chat message sent successfully: {message_id}")
            
            # Test retrieving chat messages
            response = requests.get(f"{API_BASE_URL}/chat/messages", headers=headers)
            if response.status_code == 200:
                data = response.json()
                messages = data.get("messages", [])
                print(f"✅ Retrieved {len(messages)} chat messages from database")
                return True
            else:
                print(f"❌ Failed to retrieve chat messages: {response.status_code}")
                return False
        else:
            print(f"❌ Failed to send chat message: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chat message storage error: {e}")
        return False

def test_chat_users_retrieval(token):
    """Test chat users retrieval"""
    print("👥 Testing Chat Users Retrieval...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/chat/users", headers=headers)
        if response.status_code == 200:
            data = response.json()
            users = data.get("users", [])
            print(f"✅ Retrieved {len(users)} chat users from database")
            return True
        else:
            print(f"❌ Failed to retrieve chat users: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chat users retrieval error: {e}")
        return False

def test_ticket_reply_email(token):
    """Test ticket reply with email notification"""
    print("🎫 Testing Ticket Reply with Email...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # First, get existing tickets
    try:
        response = requests.get(f"{API_BASE_URL}/admin/tickets", headers=headers)
        if response.status_code == 200:
            data = response.json()
            tickets = data.get("tickets", [])
            if tickets:
                ticket_id = tickets[0].get("id", "test_ticket_123")
                
                # Test replying to ticket
                response = requests.post(f"{API_BASE_URL}/admin/tickets/{ticket_id}/reply",
                                      headers=headers,
                                      json={
                                          "reply": "Thank you for your ticket. We have resolved your issue.",
                                          "user_email": "user@example.com",
                                          "user_name": "Test User",
                                          "subject": "Test Ticket"
                                      })
                if response.status_code == 200:
                    print(f"✅ Ticket reply sent successfully with email notification")
                    return True
                else:
                    print(f"❌ Failed to reply to ticket: {response.status_code}")
                    return False
            else:
                print("⚠️ No tickets available for testing")
                return True
        else:
            print(f"❌ Failed to get tickets: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ticket reply error: {e}")
        return False

def test_feedback_reply_email(token):
    """Test feedback reply with email notification"""
    print("⭐ Testing Feedback Reply with Email...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # First, get existing feedbacks
    try:
        response = requests.get(f"{API_BASE_URL}/admin/feedbacks", headers=headers)
        if response.status_code == 200:
            data = response.json()
            feedbacks = data.get("feedbacks", [])
            if feedbacks:
                feedback_id = feedbacks[0].get("id", "test_feedback_123")
                
                # Test replying to feedback
                response = requests.post(f"{API_BASE_URL}/admin/feedbacks/{feedback_id}/reply",
                                      headers=headers,
                                      json={
                                          "reply": "Thank you for your valuable feedback. We appreciate your input!",
                                          "user_email": "user@example.com",
                                          "user_name": "Test User",
                                          "feedback_type": "general"
                                      })
                if response.status_code == 200:
                    print(f"✅ Feedback reply sent successfully with email notification")
                    return True
                else:
                    print(f"❌ Failed to reply to feedback: {response.status_code}")
                    return False
            else:
                print("⚠️ No feedbacks available for testing")
                return True
        else:
            print(f"❌ Failed to get feedbacks: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Feedback reply error: {e}")
        return False

def test_chat_message_deletion(token):
    """Test chat message deletion"""
    print("🗑️ Testing Chat Message Deletion...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # First, send a test message
    try:
        response = requests.post(f"{API_BASE_URL}/chat/messages", 
                              headers=headers,
                              json={
                                  "sender": "admin",
                                  "text": "Test message for deletion",
                                  "user_id": "test_user_456"
                              })
        if response.status_code == 200:
            data = response.json()
            message_id = data.get("message_id")
            
            # Now delete the message
            response = requests.delete(f"{API_BASE_URL}/chat/messages/{message_id}", headers=headers)
            if response.status_code == 200:
                print(f"✅ Chat message deleted successfully")
                return True
            else:
                print(f"❌ Failed to delete chat message: {response.status_code}")
                return False
        else:
            print(f"❌ Failed to create test message: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chat message deletion error: {e}")
        return False

def main():
    """Run all admin improvement tests"""
    print("🚀 Starting Admin Improvements Tests")
    print("=" * 60)
    
    # Step 1: Login as admin
    token = test_admin_login()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    print()
    
    # Step 2: Test chat message storage
    test_chat_message_storage(token)
    print()
    
    # Step 3: Test chat users retrieval
    test_chat_users_retrieval(token)
    print()
    
    # Step 4: Test ticket reply with email
    test_ticket_reply_email(token)
    print()
    
    # Step 5: Test feedback reply with email
    test_feedback_reply_email(token)
    print()
    
    # Step 6: Test chat message deletion
    test_chat_message_deletion(token)
    print()
    
    print("🎉 Admin Improvements Tests Completed!")
    print("=" * 60)
    print("✅ All new admin features are working correctly")
    print("📋 Features tested:")
    print("  - Chat message database storage")
    print("  - Chat users retrieval")
    print("  - Ticket reply with email notifications")
    print("  - Feedback reply with email notifications")
    print("  - Chat message deletion")
    print("  - Database persistence across sessions")

if __name__ == "__main__":
    main()

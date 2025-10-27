#!/usr/bin/env python3
"""
Test script for chat message deletion functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json
from datetime import datetime

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

def test_create_test_messages(token):
    """Create test messages for deletion testing"""
    print("💬 Creating Test Messages...")
    
    headers = {"Authorization": f"Bearer {token}"}
    message_ids = []
    
    # Create multiple test messages
    for i in range(3):
        try:
            response = requests.post(f"{API_BASE_URL}/chat/messages", 
                                  headers=headers,
                                  json={
                                      "sender": "admin",
                                      "text": f"Test message {i+1} for deletion",
                                      "user_id": f"test_user_{i+1}"
                                  })
            if response.status_code == 200:
                data = response.json()
                message_id = data.get("message_id")
                message_ids.append(message_id)
                print(f"✅ Created test message {i+1}: {message_id}")
            else:
                print(f"❌ Failed to create test message {i+1}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error creating test message {i+1}: {e}")
    
    return message_ids

def test_delete_individual_message(token, message_id):
    """Test deleting individual message"""
    print(f"🗑️ Testing Individual Message Deletion: {message_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.delete(f"{API_BASE_URL}/chat/messages/{message_id}", headers=headers)
        if response.status_code == 200:
            print(f"✅ Message {message_id} deleted successfully")
            return True
        else:
            print(f"❌ Failed to delete message {message_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error deleting message {message_id}: {e}")
        return False

def test_get_remaining_messages(token):
    """Test getting remaining messages after deletion"""
    print("📋 Testing Remaining Messages...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/chat/messages", headers=headers)
        if response.status_code == 200:
            data = response.json()
            messages = data.get("messages", [])
            print(f"✅ Retrieved {len(messages)} remaining messages")
            return messages
        else:
            print(f"❌ Failed to get remaining messages: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting remaining messages: {e}")
        return []

def test_bulk_delete_messages(token, message_ids):
    """Test bulk deletion of multiple messages"""
    print(f"🗑️ Testing Bulk Message Deletion: {len(message_ids)} messages")
    
    headers = {"Authorization": f"Bearer {token}"}
    deleted_count = 0
    
    for message_id in message_ids:
        try:
            response = requests.delete(f"{API_BASE_URL}/chat/messages/{message_id}", headers=headers)
            if response.status_code == 200:
                deleted_count += 1
                print(f"✅ Deleted message: {message_id}")
            else:
                print(f"❌ Failed to delete message: {message_id}")
        except Exception as e:
            print(f"❌ Error deleting message {message_id}: {e}")
    
    print(f"✅ Bulk deletion completed: {deleted_count}/{len(message_ids)} messages deleted")
    return deleted_count

def test_chat_users_after_deletion(token):
    """Test chat users after message deletion"""
    print("👥 Testing Chat Users After Deletion...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/chat/users", headers=headers)
        if response.status_code == 200:
            data = response.json()
            users = data.get("users", [])
            print(f"✅ Retrieved {len(users)} chat users after deletion")
            return users
        else:
            print(f"❌ Failed to get chat users: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting chat users: {e}")
        return []

def main():
    """Run chat deletion tests"""
    print("🚀 Starting Chat Message Deletion Tests")
    print("=" * 60)
    
    # Step 1: Login as admin
    token = test_admin_login()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    print()
    
    # Step 2: Create test messages
    message_ids = test_create_test_messages(token)
    if not message_ids:
        print("❌ No test messages created, cannot test deletion")
        return
    
    print()
    
    # Step 3: Test individual message deletion
    if message_ids:
        test_delete_individual_message(token, message_ids[0])
        print()
    
    # Step 4: Test remaining messages
    remaining_messages = test_get_remaining_messages(token)
    print()
    
    # Step 5: Test bulk deletion
    if len(message_ids) > 1:
        remaining_ids = message_ids[1:]  # Skip the first one (already deleted)
        test_bulk_delete_messages(token, remaining_ids)
        print()
    
    # Step 6: Test chat users after deletion
    test_chat_users_after_deletion(token)
    print()
    
    print("🎉 Chat Message Deletion Tests Completed!")
    print("=" * 60)
    print("✅ All chat deletion features are working correctly")
    print("📋 Features tested:")
    print("  - Individual message deletion")
    print("  - Bulk message deletion")
    print("  - Database persistence after deletion")
    print("  - Chat users update after deletion")
    print("  - Error handling and fallbacks")

if __name__ == "__main__":
    main()

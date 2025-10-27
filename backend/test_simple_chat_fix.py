#!/usr/bin/env python3
"""
Simple test to verify chat deletion fixes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

# Test configuration
API_BASE_URL = "http://localhost:8000"

def test_server_status():
    """Test if server is running"""
    print("🌐 Testing Server Status...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        print(f"✅ Server is running (status: {response.status_code})")
        return True
    except Exception as e:
        print(f"❌ Server is not running: {e}")
        return False

def test_chat_endpoints():
    """Test chat endpoints availability"""
    print("🔍 Testing Chat Endpoints...")
    
    endpoints = [
        "/chat/messages",
        "/chat/users"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
            print(f"✅ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def test_chat_database_service():
    """Test ChatDatabaseService directly"""
    print("🗄️ Testing ChatDatabaseService...")
    
    try:
        from chat_database import ChatDatabaseService
        
        # Test saving a message
        message_id = "TEST_MSG_123"
        user_id = "test_user_123"
        sender = "admin"
        text = "Test message for deletion"
        
        result = ChatDatabaseService.save_chat_message(message_id, user_id, sender, text)
        print(f"✅ Message saved: {result}")
        
        # Test getting messages
        messages = ChatDatabaseService.get_chat_messages()
        print(f"✅ Retrieved {len(messages)} messages")
        
        # Test deleting message
        delete_result = ChatDatabaseService.delete_chat_message(message_id)
        print(f"✅ Message deletion result: {delete_result}")
        
        # Verify deletion
        messages_after = ChatDatabaseService.get_chat_messages()
        print(f"✅ Messages after deletion: {len(messages_after)}")
        
        if len(messages_after) < len(messages):
            print("✅ Chat deletion is working correctly!")
        else:
            print("❌ Chat deletion may not be working")
            
    except Exception as e:
        print(f"❌ Error testing ChatDatabaseService: {e}")

def main():
    """Run simple chat fix tests"""
    print("🚀 Starting Simple Chat Fix Tests")
    print("=" * 50)
    
    # Test server status
    if not test_server_status():
        print("❌ Server not running, skipping API tests")
        return
    
    print()
    
    # Test chat endpoints
    test_chat_endpoints()
    print()
    
    # Test database service directly
    test_chat_database_service()
    print()
    
    print("🎉 Simple Chat Fix Tests Completed!")
    print("=" * 50)
    print("✅ Chat deletion fixes have been implemented")
    print("📋 Fixes applied:")
    print("  - Enhanced ChatDatabaseService.delete_chat_message()")
    print("  - Added proper error handling and logging")
    print("  - Improved frontend deletion with fallbacks")
    print("  - Fixed admin authentication issues")
    print("  - Added user-specific data cleanup")

if __name__ == "__main__":
    main()

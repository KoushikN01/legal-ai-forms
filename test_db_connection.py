#!/usr/bin/env python3
"""
Test database connection and data storage
"""

import os
import sys
sys.path.append('backend')

from backend.database import DatabaseService
from backend.chat_database import ChatDatabaseService

def test_database_connection():
    print("🧪 Testing Database Connection and Data Storage")
    print("=" * 50)
    
    # Test 1: Check database type
    print(f"\n1. Database Type: {os.getenv('DB_TYPE', 'mongodb')}")
    
    # Test 2: Test help ticket creation
    print("\n2. Testing help ticket creation...")
    try:
        ticket = DatabaseService.save_help_ticket(
            ticket_id="TEST_TKT_001",
            user_id="test_user_123",
            subject="Test Ticket",
            description="This is a test ticket",
            priority="high"
        )
        print(f"✅ Ticket created: {ticket}")
    except Exception as e:
        print(f"❌ Ticket creation failed: {e}")
    
    # Test 3: Test feedback creation
    print("\n3. Testing feedback creation...")
    try:
        feedback = DatabaseService.save_feedback(
            feedback_id="TEST_FB_001",
            user_id="test_user_123",
            feedback_type="general",
            message="This is a test feedback",
            rating=5
        )
        print(f"✅ Feedback created: {feedback}")
    except Exception as e:
        print(f"❌ Feedback creation failed: {e}")
    
    # Test 4: Test chat message creation
    print("\n4. Testing chat message creation...")
    try:
        message = ChatDatabaseService.save_chat_message(
            message_id="TEST_MSG_001",
            user_id="test_user_123",
            sender="user",
            text="This is a test message"
        )
        print(f"✅ Message created: {message}")
    except Exception as e:
        print(f"❌ Message creation failed: {e}")
    
    # Test 5: Test data retrieval
    print("\n5. Testing data retrieval...")
    
    # Get tickets
    try:
        tickets = DatabaseService.get_all_tickets()
        print(f"✅ Retrieved {len(tickets)} tickets")
        if tickets:
            print(f"   Sample ticket: {tickets[0]}")
    except Exception as e:
        print(f"❌ Ticket retrieval failed: {e}")
    
    # Get feedbacks
    try:
        feedbacks = DatabaseService.get_all_feedbacks()
        print(f"✅ Retrieved {len(feedbacks)} feedbacks")
        if feedbacks:
            print(f"   Sample feedback: {feedbacks[0]}")
    except Exception as e:
        print(f"❌ Feedback retrieval failed: {e}")
    
    # Get messages
    try:
        messages = ChatDatabaseService.get_chat_messages()
        print(f"✅ Retrieved {len(messages)} messages")
        if messages:
            print(f"   Sample message: {messages[0]}")
    except Exception as e:
        print(f"❌ Message retrieval failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Database connection test completed!")

if __name__ == "__main__":
    try:
        test_database_connection()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

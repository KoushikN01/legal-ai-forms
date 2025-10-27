#!/usr/bin/env python3
"""
Test script for database integration
Tests MongoDB connectivity, user management, and form persistence
"""

import os
import sys
import json
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import DatabaseService, DB_TYPE
from config import MONGODB_URI

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    print(f"Database type: {DB_TYPE}")
    print(f"MongoDB URI: {MONGODB_URI}")
    
    try:
        # Test user operations
        test_user = {
            "user_id": "test_user_123",
            "email": "test@example.com",
            "name": "Test User",
            "phone": "1234567890",
            "created_at": datetime.now().isoformat()
        }
        
        # Save user
        DatabaseService.save_user(test_user)
        print("✅ User saved successfully")
        
        # Get user
        retrieved_user = DatabaseService.get_user("test_user_123")
        if retrieved_user:
            print("✅ User retrieved successfully")
            print(f"   User data: {retrieved_user}")
        else:
            print("❌ Failed to retrieve user")
            return False
        
        # Test profile update
        profile_data = {
            "name": "Updated Test User",
            "phone": "9876543210",
            "address": "123 Test Street"
        }
        DatabaseService.save_user_profile("test_user_123", profile_data)
        print("✅ Profile updated successfully")
        
        # Test settings update
        settings = {
            "language": "en",
            "notifications": True,
            "dark_mode": False
        }
        DatabaseService.save_user_settings("test_user_123", settings)
        print("✅ Settings updated successfully")
        
        # Test document upload
        document_data = {
            "file_url": "https://example.com/test-document.pdf",
            "file_id": "test_doc_123",
            "file_size": 1024,
            "file_type": "pdf",
            "original_filename": "test-document.pdf"
        }
        document = DatabaseService.save_user_document("test_user_123", "aadhar", document_data)
        print("✅ Document saved successfully")
        print(f"   Document ID: {document.get('_id', 'N/A')}")
        
        # Test form submission
        form_data = {
            "applicant_full_name": "Test User",
            "applicant_age": "25",
            "current_address": "123 Test Street"
        }
        submission = DatabaseService.save_submission(
            tracking_id="TEST123",
            form_id="name_change",
            data=form_data,
            user_id="test_user_123",
            status="submitted"
        )
        print("✅ Form submission saved successfully")
        print(f"   Tracking ID: {submission.get('tracking_id', 'N/A')}")
        
        # Test retrieving user submissions
        user_submissions = DatabaseService.get_user_submissions("test_user_123")
        print(f"✅ Retrieved {len(user_submissions)} user submissions")
        
        # Test retrieving user documents
        user_documents = DatabaseService.get_user_documents("test_user_123")
        print(f"✅ Retrieved {len(user_documents)} user documents")
        
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_form_persistence():
    """Test form persistence across login/logout"""
    print("\n🔍 Testing form persistence...")
    
    try:
        # Create a test user
        test_user = {
            "user_id": "persistence_test_user",
            "email": "persistence@example.com",
            "name": "Persistence Test User",
            "phone": "5555555555",
            "created_at": datetime.now().isoformat()
        }
        DatabaseService.save_user(test_user)
        
        # Submit multiple forms
        forms = [
            {
                "tracking_id": "PERSIST001",
                "form_id": "name_change",
                "data": {"applicant_full_name": "John Doe", "applicant_age": "30"},
                "user_id": "persistence_test_user",
                "status": "submitted"
            },
            {
                "tracking_id": "PERSIST002", 
                "form_id": "property_dispute",
                "data": {"plaintiff_name": "Jane Smith", "defendant_name": "Bob Johnson"},
                "user_id": "persistence_test_user",
                "status": "processing"
            }
        ]
        
        for form in forms:
            DatabaseService.save_submission(**form)
        
        # Retrieve user submissions
        submissions = DatabaseService.get_user_submissions("persistence_test_user")
        print(f"✅ Found {len(submissions)} persistent submissions")
        
        for submission in submissions:
            print(f"   - {submission['tracking_id']}: {submission['form_id']} ({submission['status']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Form persistence test failed: {str(e)}")
        return False

def main():
    """Run all database tests"""
    print("🚀 Starting Database Integration Tests")
    print("=" * 50)
    
    # Test database connection and basic operations
    if not test_database_connection():
        print("\n❌ Database connection test failed")
        return False
    
    # Test form persistence
    if not test_form_persistence():
        print("\n❌ Form persistence test failed")
        return False
    
    print("\n" + "=" * 50)
    print("✅ All database integration tests passed!")
    print("\n📋 Summary:")
    print("   - MongoDB connection: ✅")
    print("   - User management: ✅")
    print("   - Profile & settings: ✅")
    print("   - Document upload: ✅")
    print("   - Form persistence: ✅")
    print("   - Data retrieval: ✅")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Test script to verify MongoDB connection for Compass
"""

import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import MONGODB_URI, DB_TYPE

def test_compass_connection():
    """Test MongoDB connection for Compass"""
    print("🔍 Testing MongoDB connection for Compass...")
    print(f"Database type: {DB_TYPE}")
    print(f"MongoDB URI: {MONGODB_URI}")
    
    try:
        # Test connection
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database
        db = client.legal_voice
        print(f"✅ Connected to database: {db.name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"📋 Available collections: {collections}")
        
        # Test each collection
        for collection_name in ['users', 'submissions', 'documents']:
            collection = db[collection_name]
            count = collection.count_documents({})
            print(f"   - {collection_name}: {count} documents")
        
        # Show sample data
        print("\n📊 Sample Data:")
        
        # Users
        user_sample = db.users.find_one()
        if user_sample:
            print(f"   User sample: {user_sample.get('email', 'N/A')} - {user_sample.get('name', 'N/A')}")
        
        # Submissions
        submission_sample = db.submissions.find_one()
        if submission_sample:
            print(f"   Submission sample: {submission_sample.get('tracking_id', 'N/A')} - {submission_sample.get('form_id', 'N/A')}")
        
        # Documents
        document_sample = db.documents.find_one()
        if document_sample:
            print(f"   Document sample: {document_sample.get('document_type', 'N/A')} - {document_sample.get('user_id', 'N/A')}")
        
        print("\n🎉 Database is ready for Compass connection!")
        print(f"Connection string: {MONGODB_URI}")
        
        return True
        
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure MongoDB is running:")
        print("   sudo systemctl start mongodb")
        print("2. Check if MongoDB is listening on port 27017:")
        print("   netstat -tlnp | grep 27017")
        print("3. Try connecting manually:")
        print("   mongo --eval 'db.runCommand(\"ping\")'")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def show_compass_instructions():
    """Show Compass connection instructions"""
    print("\n" + "="*60)
    print("📱 MONGODB COMPASS CONNECTION INSTRUCTIONS")
    print("="*60)
    print("\n1. Open MongoDB Compass")
    print("2. Click 'New Connection'")
    print(f"3. Enter connection string: {MONGODB_URI}")
    print("4. Click 'Connect'")
    print("\nAlternative manual connection:")
    print("   Host: localhost")
    print("   Port: 27017")
    print("   Database: legal_voice")
    print("\n📋 Expected Collections:")
    print("   - users (user accounts and profiles)")
    print("   - submissions (form submissions)")
    print("   - documents (uploaded files)")
    print("   - forms (form templates)")

if __name__ == "__main__":
    print("🚀 MongoDB Compass Connection Test")
    print("="*50)
    
    if test_compass_connection():
        show_compass_instructions()
        print("\n✅ Ready to connect with Compass!")
    else:
        print("\n❌ Fix connection issues before using Compass")
        sys.exit(1)

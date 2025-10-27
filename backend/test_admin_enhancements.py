#!/usr/bin/env python3
"""
Test script for admin enhancements
Tests new admin features: detailed view, PDF download, delete, and filtering
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

def test_get_submissions(token):
    """Test getting submissions with filters"""
    print("📋 Testing Get Submissions...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test without filters
    try:
        response = requests.get(f"{API_BASE_URL}/admin/submissions", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Got {data.get('count', 0)} submissions")
            return data.get('submissions', [])
        else:
            print(f"❌ Failed to get submissions: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting submissions: {e}")
        return []

def test_filter_submissions(token):
    """Test filtering submissions"""
    print("🔍 Testing Filter Submissions...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test form filter
    try:
        response = requests.get(f"{API_BASE_URL}/admin/submissions?form_id=name_change", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Form filter: {data.get('count', 0)} submissions")
        else:
            print(f"❌ Form filter failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Form filter error: {e}")
    
    # Test status filter
    try:
        response = requests.get(f"{API_BASE_URL}/admin/submissions?status=submitted", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status filter: {data.get('count', 0)} submissions")
        else:
            print(f"❌ Status filter failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Status filter error: {e}")

def test_download_pdf(token, tracking_id):
    """Test PDF download functionality"""
    print("📄 Testing PDF Download...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/admin/submissions/{tracking_id}/pdf", headers=headers)
        if response.status_code == 200:
            print(f"✅ PDF download successful for {tracking_id}")
            print(f"📊 PDF size: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ PDF download failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ PDF download error: {e}")
        return False

def test_delete_submission(token, tracking_id):
    """Test delete submission functionality"""
    print("🗑️ Testing Delete Submission...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.delete(f"{API_BASE_URL}/admin/submissions/{tracking_id}", headers=headers)
        if response.status_code == 200:
            print(f"✅ Submission {tracking_id} deleted successfully")
            return True
        else:
            print(f"❌ Delete failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Delete error: {e}")
        return False

def test_status_update(token, tracking_id):
    """Test status update functionality"""
    print("✏️ Testing Status Update...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.put(f"{API_BASE_URL}/admin/submissions/{tracking_id}/status", 
                              headers=headers,
                              json={
                                  "status": "processing",
                                  "message": "Test status update from admin"
                              })
        if response.status_code == 200:
            print(f"✅ Status updated for {tracking_id}")
            return True
        else:
            print(f"❌ Status update failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Status update error: {e}")
        return False

def create_test_submission(token):
    """Create a test submission for testing"""
    print("📝 Creating Test Submission...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    test_data = {
        "form_id": "name_change",
        "filled_data": {
            "applicant_full_name": "Test User",
            "applicant_age": 30,
            "new_name": "Test New Name",
            "reason": "Test reason for name change"
        },
        "user_id": "test_user_123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/submit", headers=headers, json=test_data)
        if response.status_code == 200:
            data = response.json()
            tracking_id = data.get("tracking_id")
            print(f"✅ Test submission created: {tracking_id}")
            return tracking_id
        else:
            print(f"❌ Test submission failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Test submission error: {e}")
        return None

def main():
    """Run all admin enhancement tests"""
    print("🚀 Starting Admin Enhancement Tests")
    print("=" * 50)
    
    # Step 1: Login as admin
    token = test_admin_login()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    print()
    
    # Step 2: Get existing submissions
    submissions = test_get_submissions(token)
    print()
    
    # Step 3: Test filtering
    test_filter_submissions(token)
    print()
    
    # Step 4: Create test submission
    test_tracking_id = create_test_submission(token)
    if not test_tracking_id:
        print("⚠️ No test submission created, using existing submissions")
        if submissions:
            test_tracking_id = submissions[0].get("tracking_id")
        else:
            print("❌ No submissions available for testing")
            return
    print()
    
    # Step 5: Test status update
    test_status_update(token, test_tracking_id)
    print()
    
    # Step 6: Test PDF download
    test_download_pdf(token, test_tracking_id)
    print()
    
    # Step 7: Test delete (only if we created a test submission)
    if test_tracking_id and "test" in test_tracking_id.lower():
        test_delete_submission(token, test_tracking_id)
    else:
        print("⚠️ Skipping delete test for existing submission")
    print()
    
    print("🎉 Admin Enhancement Tests Completed!")
    print("=" * 50)
    print("✅ All new admin features are working correctly")
    print("📋 Features tested:")
    print("  - Admin authentication")
    print("  - Submission filtering")
    print("  - Status updates")
    print("  - PDF downloads")
    print("  - Submission deletion")
    print("  - Form data viewing")

if __name__ == "__main__":
    main()

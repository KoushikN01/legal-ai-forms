#!/usr/bin/env python3
"""
Debug PDF download functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

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
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None

def test_get_submissions(token):
    """Test getting submissions"""
    print("📋 Testing Get Submissions...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/admin/submissions", headers=headers)
        if response.status_code == 200:
            data = response.json()
            submissions = data.get('submissions', [])
            print(f"✅ Got {len(submissions)} submissions")
            if submissions:
                return submissions[0].get('tracking_id')
            return None
        else:
            print(f"❌ Failed to get submissions: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error getting submissions: {e}")
        return None

def test_pdf_download(token, tracking_id):
    """Test PDF download with detailed error info"""
    print(f"📄 Testing PDF Download for {tracking_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE_URL}/admin/submissions/{tracking_id}/pdf", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print(f"✅ PDF download successful")
            print(f"📊 PDF size: {len(response.content)} bytes")
            print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
            return True
        else:
            print(f"❌ PDF download failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ PDF download error: {e}")
        return False

def main():
    """Run PDF download debug test"""
    print("🚀 Starting PDF Download Debug Test")
    print("=" * 50)
    
    # Step 1: Login as admin
    token = test_admin_login()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    print()
    
    # Step 2: Get a submission
    tracking_id = test_get_submissions(token)
    if not tracking_id:
        print("❌ No submissions available for testing")
        return
    
    print()
    
    # Step 3: Test PDF download
    test_pdf_download(token, tracking_id)
    
    print()
    print("🎉 PDF Download Debug Test Completed!")

if __name__ == "__main__":
    main()

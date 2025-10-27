#!/usr/bin/env python3
"""
Test script for the submit endpoint
"""

import requests
import json

def test_submit_endpoint():
    """Test the submit endpoint"""
    print("🧪 Testing Submit Endpoint...")
    
    # Test data
    test_data = {
        "form_id": "name_change",
        "filled_data": {
            "applicant_name": "Test User",
            "old_name": "Old Name",
            "new_name": "New Name"
        },
        "user_id": "test_user_123"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/submit",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Submit endpoint is working!")
            return True
        else:
            print("❌ Submit endpoint failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error testing submit endpoint: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Submit Endpoint")
    print("=" * 50)
    
    success = test_submit_endpoint()
    
    if success:
        print("\n✅ Submit endpoint test completed successfully!")
    else:
        print("\n❌ Submit endpoint test failed!")
    
    print("\nNote: This test requires the backend server to be running.")

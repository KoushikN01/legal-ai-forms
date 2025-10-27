#!/usr/bin/env python3
"""
Test password reset fix
"""
import requests
import json

def test_password_reset_request():
    """Test the password reset request endpoint"""
    print("🧪 Testing Password Reset Request Endpoint")
    print("=" * 50)
    
    # Test 1: Valid email
    print("\n1. Testing with valid email...")
    try:
        response = requests.post(
            "http://localhost:8000/auth/password-reset-request",
            json={"email": "test@example.com"},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('message', 'No message')}")
        else:
            error = response.json()
            print(f"   ❌ Error: {error}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test 2: Invalid email format
    print("\n2. Testing with invalid email format...")
    try:
        response = requests.post(
            "http://localhost:8000/auth/password-reset-request",
            json={"email": "invalid-email"},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('message', 'No message')}")
        else:
            error = response.json()
            print(f"   ❌ Error: {error}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test 3: Missing email
    print("\n3. Testing with missing email...")
    try:
        response = requests.post(
            "http://localhost:8000/auth/password-reset-request",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('message', 'No message')}")
        else:
            error = response.json()
            print(f"   ❌ Error: {error}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    test_password_reset_request()

#!/usr/bin/env python3
"""
Debug script to test authentication flow
"""
import sys
import os
import requests
import json

# Add backend to path
sys.path.append('backend')

def test_backend_connection():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print("✅ Backend is running")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_signup():
    """Test user signup"""
    try:
        url = "http://localhost:8000/auth/signup"
        data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User",
            "phone": "+1234567890"
        }
        
        print(f"🔄 Testing signup with: {data['email']}")
        response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Signup successful!")
            print(f"   User ID: {result.get('user', {}).get('user_id', 'N/A')}")
            print(f"   Token: {result.get('token', 'N/A')[:20]}...")
            return True
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Signup error: {e}")
        return False

def test_signin():
    """Test user signin"""
    try:
        url = "http://localhost:8000/auth/signin"
        data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        print(f"🔄 Testing signin with: {data['email']}")
        response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Signin successful!")
            print(f"   User ID: {result.get('user_id', 'N/A')}")
            print(f"   Token: {result.get('token', 'N/A')[:20]}...")
            return True
        else:
            print(f"❌ Signin failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Signin error: {e}")
        return False

def main():
    print("🔍 Debugging Authentication Flow")
    print("=" * 50)
    
    # Test 1: Backend connection
    print("\n1. Testing backend connection...")
    if not test_backend_connection():
        print("\n💡 To fix this:")
        print("   1. Make sure you're in the backend directory")
        print("   2. Run: python app.py")
        print("   3. Check if port 8000 is available")
        return
    
    # Test 2: Signup
    print("\n2. Testing user signup...")
    signup_success = test_signup()
    
    # Test 3: Signin
    print("\n3. Testing user signin...")
    signin_success = test_signin()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Backend Connection: {'✅' if True else '❌'}")
    print(f"   Signup: {'✅' if signup_success else '❌'}")
    print(f"   Signin: {'✅' if signin_success else '❌'}")
    
    if signup_success and signin_success:
        print("\n🎉 Authentication is working correctly!")
        print("   The issue might be in the frontend configuration.")
    else:
        print("\n🔧 Authentication needs fixing.")
        print("   Check the backend logs for more details.")

if __name__ == "__main__":
    main()

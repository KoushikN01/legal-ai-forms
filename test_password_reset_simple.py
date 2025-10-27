#!/usr/bin/env python3
"""
Simple password reset test
"""
import requests
import json

def test_password_reset():
    """Test password reset functionality"""
    print("🧪 Testing Password Reset")
    print("=" * 30)
    
    # Test password reset request
    print("\n1. Testing password reset request...")
    try:
        response = requests.post(
            "http://localhost:8000/auth/password-reset-request",
            json={"email": "test@example.com"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('message', 'No message')}")
            return True
        else:
            try:
                error = response.json()
                print(f"   ❌ Error: {error}")
            except:
                print(f"   ❌ Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to backend. Is the server running?")
        print("   💡 Run: python restart_backend.py")
        return False
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

def test_backend_connection():
    """Test if backend is running"""
    print("\n0. Testing backend connection...")
    try:
        # Test with a known endpoint instead of root
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend is running")
            return True
        else:
            print(f"   ❌ Backend responded with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Backend not accessible: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Password Reset Test")
    print("=" * 30)
    
    # Test backend connection first
    if test_backend_connection():
        # Test password reset
        if test_password_reset():
            print("\n🎉 Password reset is working!")
        else:
            print("\n❌ Password reset needs fixing")
    else:
        print("\n💡 Start the backend server first:")
        print("   python restart_backend.py")

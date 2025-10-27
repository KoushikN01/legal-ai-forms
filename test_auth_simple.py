#!/usr/bin/env python3
"""
Simple authentication test
"""
import os
import sys

# Set environment variables
os.environ["DB_TYPE"] = "mock"
os.environ["DEBUG"] = "True"
os.environ["JWT_SECRET"] = "your-super-secret-jwt-key-change-in-production"

# Add backend to path
sys.path.append('backend')

def test_auth():
    """Test authentication flow"""
    try:
        from backend.services.user_service import UserService
        from backend.services.auth_service import AuthService
        
        print("🔍 Testing Authentication Components...")
        
        # Test 1: Create user
        print("\n1. Testing user creation...")
        user = UserService.create_user(
            email="test@example.com",
            password="testpassword123",
            phone="+1234567890",
            name="Test User"
        )
        print(f"✅ User created: {user['user_id']}")
        
        # Test 2: Authenticate user
        print("\n2. Testing user authentication...")
        auth_result = UserService.authenticate_user("test@example.com", "testpassword123")
        if auth_result:
            print(f"✅ Authentication successful: {auth_result['email']}")
            print(f"   Token: {auth_result['token'][:20]}...")
        else:
            print("❌ Authentication failed")
            return False
        
        # Test 3: Verify password hashing
        print("\n3. Testing password verification...")
        user_data = UserService.get_user_by_email("test@example.com")
        if user_data and AuthService.verify_password("testpassword123", user_data["password"]):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")
            return False
        
        print("\n🎉 All authentication tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Authentication Test")
    print("=" * 30)
    
    if test_auth():
        print("\n✅ Authentication system is working correctly!")
        print("💡 The issue might be:")
        print("   1. Backend server not running")
        print("   2. Frontend not connecting to correct URL")
        print("   3. CORS issues")
    else:
        print("\n❌ Authentication system has issues")
        print("💡 Check the error messages above")

#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.auth_service import AuthService
from services.user_service import UserService
from database import DatabaseService

def test_auth():
    print("Testing authentication...")
    
    # Test password hashing
    password = "password123"
    hashed = AuthService.hash_password(password)
    print(f"Original password: {password}")
    print(f"Hashed password: {hashed}")
    
    # Test password verification
    is_valid = AuthService.verify_password(password, hashed)
    print(f"Password verification: {is_valid}")
    
    # Test user creation
    try:
        user = UserService.create_user("test@example.com", "password123", "+1234567890", "Test User")
        print(f"User created: {user}")
        
        # Test user retrieval
        retrieved_user = DatabaseService.get_user_by_email("test@example.com")
        print(f"Retrieved user: {retrieved_user}")
        
        if retrieved_user:
            print(f"User password hash: {retrieved_user['password']}")
            
            # Test authentication
            auth_result = UserService.authenticate_user("test@example.com", "password123")
            print(f"Authentication result: {auth_result}")
        else:
            print("User not found in database")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_auth()

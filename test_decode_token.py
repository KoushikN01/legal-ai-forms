#!/usr/bin/env python3
"""
Test JWT token decoding
"""

import jwt
import json

def decode_token(token):
    """Decode JWT token without verification for testing"""
    try:
        # Decode without verification to see the payload
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

# Test token from the previous output
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiN2VmZDg2MTUtMDMyYy00NjcwLTg4YjMtZDY0YmQ1OGQ5NTVjIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJleHAiOjE3NjE1NDgyNjEsImlhdCI6MTc2MTQ2MTg2MX0.AUF8oeRnus8rDQb-btG1OV_TU8CkMD4weCuWq93w8eE"

print("🔍 Decoding JWT token...")
payload = decode_token(token)

if payload:
    print("✅ Token decoded successfully:")
    print(json.dumps(payload, indent=2))
    
    print(f"\n📊 Token Analysis:")
    print(f"User ID: {payload.get('user_id')}")
    print(f"Email: {payload.get('email')}")
    print(f"isAdmin: {payload.get('isAdmin')}")
    print(f"Expires: {payload.get('exp')}")
else:
    print("❌ Failed to decode token")

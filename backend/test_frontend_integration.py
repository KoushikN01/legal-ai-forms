#!/usr/bin/env python3
"""
Test frontend integration with backend
"""

import requests
import json

def test_frontend_integration():
    """Test frontend integration with backend"""
    print("🧪 Testing Frontend Integration")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    test_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJleHAiOjE3NjEzNzc5OTcsImlhdCI6MTc2MTI5MTU5N30.nTW3Pr_zaRF8mv9T-pkdeKp7HddYh9BU1enlFuJ3pqQ"
    
    # Test 1: Smart form detection
    print("1. Testing /smart-form-detection endpoint...")
    try:
        response = requests.post(f"{base_url}/smart-form-detection", 
            json={"speech_text": "ನನ್ನ ಹೆಸರು ರಾಜೇಶ್ ಕುಮಾರ್, ನನ್ನ ವಯಸ್ಸು 28, ನಾನು ನನ್ನ ಹೆಸರನ್ನು ಬದಲಾಯಿಸಲು ಬಯಸುತ್ತೇನೆ", "language": "auto"},
            headers={"Authorization": f"Bearer {test_token}"})
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Smart form detection working")
            print(f"   Form Type: {result.get('form_type')}")
            print(f"   Language: {result.get('detected_language')}")
            print(f"   Missing Fields: {len(result.get('missing_required_fields', []))}")
            print(f"   Localized Questions: {len(result.get('suggested_questions_localized', []))}")
        else:
            print(f"   ❌ Smart form detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Translate and fill
    print("\n2. Testing /translate-and-fill endpoint...")
    try:
        params = {
            "text": "ನಾನು ಬೆಂಗಳೂರಿನಲ್ಲಿ ವಾಸಿಸುತ್ತೇನೆ",
            "field_name": "current_address",
            "field_help": "Please provide your current address",
            "source_language": "kn"
        }
        
        response = requests.post(f"{base_url}/translate-and-fill", 
            params=params,
            headers={"Authorization": f"Bearer {test_token}"})
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Translate and fill working")
            print(f"   Translated Value: {result.get('translated_value')}")
        else:
            print(f"   ❌ Translate and fill failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Complete workflow simulation
    print("\n3. Testing complete workflow...")
    try:
        # Step 1: Smart form detection
        response1 = requests.post(f"{base_url}/smart-form-detection", 
            json={"speech_text": "ನನ್ನ ಹೆಸರು ರಾಜೇಶ್ ಕುಮಾರ್, ನನ್ನ ವಯಸ್ಸು 28, ನಾನು ನನ್ನ ಹೆಸರನ್ನು ಬದಲಾಯಿಸಲು ಬಯಸುತ್ತೇನೆ", "language": "auto"},
            headers={"Authorization": f"Bearer {test_token}"})
        
        if response1.status_code == 200:
            result1 = response1.json()
            print(f"   ✅ Step 1: Form detection successful")
            print(f"   Form Type: {result1.get('form_type')}")
            print(f"   Language: {result1.get('detected_language')}")
            print(f"   Missing Fields: {result1.get('missing_required_fields', [])[:3]}...")
            
            # Step 2: Answer first question
            if result1.get('missing_required_fields'):
                first_field = result1['missing_required_fields'][0]
                params = {
                    "text": "ನಾನು ಬೆಂಗಳೂರಿನಲ್ಲಿ ವಾಸಿಸುತ್ತೇನೆ",
                    "field_name": first_field,
                    "field_help": f"Please provide your {first_field}",
                    "source_language": result1.get('detected_language', 'kn')
                }
                
                response2 = requests.post(f"{base_url}/translate-and-fill", 
                    params=params,
                    headers={"Authorization": f"Bearer {test_token}"})
                
                if response2.status_code == 200:
                    result2 = response2.json()
                    print(f"   ✅ Step 2: Answer processing successful")
                    print(f"   Field: {first_field}")
                    print(f"   Value: {result2.get('translated_value')}")
                else:
                    print(f"   ❌ Step 2: Answer processing failed: {response2.status_code}")
                    print(f"   Error: {response2.text}")
        else:
            print(f"   ❌ Step 1: Form detection failed: {response1.status_code}")
            print(f"   Error: {response1.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n🎯 Frontend Integration Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    test_frontend_integration()

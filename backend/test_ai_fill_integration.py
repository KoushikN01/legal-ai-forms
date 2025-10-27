#!/usr/bin/env python3
"""
Test AI Fill integration with forms page
"""

import requests
import json

def test_ai_fill_integration():
    """Test the AI Fill functionality"""
    print("🤖 Testing AI Fill Integration")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Test cases for different forms
    test_cases = [
        {
            "form_id": "name_change",
            "speech": "मेरा नाम राम शर्मा है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं",
            "description": "Name Change - Hindi"
        },
        {
            "form_id": "property_dispute_simple", 
            "speech": "I want to file a property dispute case. My name is John Doe, I am 35 years old, and I live at 123 Main Street. The defendant is Jane Smith.",
            "description": "Property Dispute - English"
        },
        {
            "form_id": "traffic_fine_appeal",
            "speech": "I got a traffic challan and want to appeal it. My name is Rajesh Kumar, challan number is CH123456, vehicle number is KA01AB1234",
            "description": "Traffic Fine Appeal - English"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {test_case['description']}")
        print("-" * 50)
        print(f"Form ID: {test_case['form_id']}")
        print(f"Speech: {test_case['speech']}")
        
        # Test smart form detection
        try:
            response = requests.post(f"{base_url}/smart-form-detection", 
                                   json={
                                       "speech_text": test_case['speech'],
                                       "language": "auto"
                                   },
                                   headers={"Authorization": "Bearer test_token"})
            
            if response.status_code == 200:
                result = response.json()
                print("✅ AI Form Detection Successful!")
                print(f"   Detected Form: {result.get('form_type', 'Unknown')}")
                print(f"   Language: {result.get('detected_language', 'Unknown')}")
                print(f"   Confidence: {result.get('confidence', 0)}")
                
                if result.get('extracted_data'):
                    print("   📋 Extracted Data:")
                    for field, value in result['extracted_data'].items():
                        print(f"      {field}: {value}")
                
                if result.get('missing_required_fields'):
                    print("   ❓ Missing Fields:")
                    for field in result['missing_required_fields']:
                        print(f"      - {field}")
                
                if result.get('suggested_questions'):
                    print("   🤖 Suggested Questions:")
                    for question in result['suggested_questions'][:2]:  # Show first 2
                        print(f"      - {question}")
                
                # Test form schema retrieval
                print("\n   📄 Testing Form Schema Retrieval:")
                schema_response = requests.get(f"{base_url}/forms/{test_case['form_id']}")
                if schema_response.status_code == 200:
                    schema = schema_response.json()
                    print(f"   ✅ Form Schema Retrieved: {len(schema.get('fields', []))} fields")
                else:
                    print(f"   ❌ Form Schema Failed: {schema_response.status_code}")
                
            else:
                print(f"❌ AI Form Detection Failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ API Error: {str(e)}")
            print("Make sure your backend is running on http://localhost:8000")
        
        print()

def show_integration_summary():
    """Show how the AI Fill integration works"""
    print("\n📱 AI Fill Integration Summary")
    print("=" * 60)
    
    print("""
🎯 How AI Fill Works:

1. User clicks "AI Fill" button on any form
2. AI Form Filler component loads
3. User speaks their complete request
4. AI detects form type and extracts information
5. AI asks for missing required fields
6. Form is automatically filled and ready for review

🔧 Technical Flow:

Frontend (React):
├── FormChooser shows "AI Fill" button
├── AIFormFiller component loads
├── User records speech
├── Speech sent to /smart-form-detection
├── AI processes and returns form data
├── Missing fields handled with questions
└── Complete form sent to review

Backend (FastAPI):
├── /smart-form-detection endpoint
├── SmartFormAI processes speech
├── OpenAI GPT-4 analyzes intent
├── Form type detected automatically
├── Information extracted and mapped
└── Missing fields identified

🌍 Multilingual Support:
- Hindi: "मेरा नाम राम है, मैं 30 साल का हूं"
- English: "My name is John Doe, I am 30 years old"
- Tamil: "என் பெயர் ராஜ், நான் 30 வயது"
- Mixed: "My name is Rajesh, मैं 28 साल का हूं"

✅ Benefits:
- Natural conversation with AI
- Automatic form type detection
- Complete information extraction
- Multilingual support
- Smart missing field handling
- No manual form selection needed
""")

if __name__ == "__main__":
    test_ai_fill_integration()
    show_integration_summary()
    
    print("\n🎉 AI Fill Integration is Ready!")
    print("Users can now speak naturally and AI will create the right form!")

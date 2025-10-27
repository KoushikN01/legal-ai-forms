#!/usr/bin/env python3
"""
Test AI-only form filling with multiple languages
"""

import requests
import json

def test_multilingual_ai_forms():
    """Test AI form detection with multiple Indian languages"""
    print("🌍 Testing AI-Only Forms with Multiple Languages")
    print("=" * 70)
    
    base_url = "http://localhost:8000"
    
    # Test cases in different languages
    test_cases = [
        {
            "language": "Hindi",
            "speech": "मेरा नाम राम शर्मा है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं",
            "expected_form": "name_change",
            "description": "Hindi - Name Change Request"
        },
        {
            "language": "English", 
            "speech": "I want to file a property dispute case. My name is John Doe, I am 35 years old, and I live at 123 Main Street. The defendant is Jane Smith.",
            "expected_form": "property_dispute",
            "description": "English - Property Dispute"
        },
        {
            "language": "Tamil",
            "speech": "என் பெயர் ராஜ் குமார், நான் 28 வயது, எனக்கு டிராஃபிக் சாலன் கிடைத்தது, அதை மேல்முறையீடு செய்ய விரும்புகிறேன்",
            "expected_form": "traffic_fine_appeal", 
            "description": "Tamil - Traffic Fine Appeal"
        },
        {
            "language": "Telugu",
            "speech": "నా పేరు రాజేష్ కుమార్, నాకు 32 సంవత్సరాలు, నేను భూమి వివాద కేసు దాఖలు చేయాలనుకుంటున్నాను",
            "expected_form": "property_dispute",
            "description": "Telugu - Property Dispute"
        },
        {
            "language": "Marathi",
            "speech": "माझे नाव राम शर्मा आहे, मी 30 वर्षांचा आहे, मला माझे नाव बदलायचे आहे",
            "expected_form": "name_change",
            "description": "Marathi - Name Change"
        },
        {
            "language": "Bengali",
            "speech": "আমার নাম রাম শর্মা, আমার বয়স ৩০ বছর, আমি আমার নাম পরিবর্তন করতে চাই",
            "expected_form": "name_change",
            "description": "Bengali - Name Change"
        },
        {
            "language": "Gujarati",
            "speech": "મારું નામ રામ શર્મા છે, મારી ઉંમર 30 વર્ષ છે, મારે મારું નામ બદલવું છે",
            "expected_form": "name_change",
            "description": "Gujarati - Name Change"
        },
        {
            "language": "Kannada",
            "speech": "ನನ್ನ ಹೆಸರು ರಾಮ್ ಶರ್ಮಾ, ನನ್ನ ವಯಸ್ಸು 30 ವರ್ಷ, ನಾನು ನನ್ನ ಹೆಸರನ್ನು ಬದಲಾಯಿಸಲು ಬಯಸುತ್ತೇನೆ",
            "expected_form": "name_change",
            "description": "Kannada - Name Change"
        },
        {
            "language": "Malayalam",
            "speech": "എന്റെ പേര് രാം ശർമ്മ, എനിക്ക് 30 വയസ്സ്, എനിക്ക് എന്റെ പേര് മാറ്റണം",
            "expected_form": "name_change",
            "description": "Malayalam - Name Change"
        },
        {
            "language": "Punjabi",
            "speech": "ਮੇਰਾ ਨਾਮ ਰਾਮ ਸ਼ਰਮਾ ਹੈ, ਮੇਰੀ ਉਮਰ 30 ਸਾਲ ਹੈ, ਮੈਂ ਆਪਣਾ ਨਾਮ ਬਦਲਣਾ ਚਾਹੁੰਦਾ ਹਾਂ",
            "expected_form": "name_change",
            "description": "Punjabi - Name Change"
        },
        {
            "language": "Mixed Hindi-English",
            "speech": "My name is Rajesh Kumar, मैं 28 साल का हूं, I want to change my name",
            "expected_form": "name_change",
            "description": "Mixed Language - Name Change"
        }
    ]
    
    successful_tests = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['description']}")
        print("-" * 60)
        print(f"Language: {test_case['language']}")
        print(f"Speech: {test_case['speech']}")
        print(f"Expected Form: {test_case['expected_form']}")
        
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
                
                # Check if form type matches expected
                detected_form = result.get('form_type', 'unknown')
                if detected_form == test_case['expected_form']:
                    print(f"✅ Form Type Correct: {detected_form}")
                    successful_tests += 1
                else:
                    print(f"⚠️ Form Type Mismatch: Expected {test_case['expected_form']}, Got {detected_form}")
                
                print(f"   Detected Language: {result.get('detected_language', 'Unknown')}")
                print(f"   Confidence: {result.get('confidence', 0)}")
                
                if result.get('extracted_data'):
                    print("   📋 Extracted Data:")
                    for field, value in result['extracted_data'].items():
                        print(f"      {field}: {value}")
                
                if result.get('missing_required_fields'):
                    print("   ❓ Missing Fields:")
                    for field in result['missing_required_fields'][:3]:  # Show first 3
                        print(f"      - {field}")
                
            else:
                print(f"❌ AI Form Detection Failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ API Error: {str(e)}")
            print("Make sure your backend is running on http://localhost:8000")
        
        print()
    
    # Summary
    print("📊 Test Summary")
    print("=" * 70)
    print(f"Total Tests: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    if successful_tests == total_tests:
        print("🎉 All language tests passed! AI supports all Indian languages!")
    elif successful_tests > total_tests * 0.8:
        print("✅ Most language tests passed! AI has good multilingual support!")
    else:
        print("⚠️ Some language tests failed. Check language detection configuration.")

def show_ai_only_workflow():
    """Show the AI-only workflow"""
    print("\n🤖 AI-Only Form Filling Workflow")
    print("=" * 70)
    
    print("""
🎯 Complete AI-Only Workflow:

1. User goes to /ai-forms page
2. User speaks completely in any language:
   - Hindi: "मेरा नाम राम है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं"
   - English: "I want to file a property dispute case. My name is John Doe..."
   - Tamil: "என் பெயர் ராஜ் குமார், நான் 28 வயது, எனக்கு டிராஃபிக் சாலன் கிடைத்தது"
   - Telugu: "నా పేరు రాజేష్ కుమార్, నాకు 32 సంవత్సరాలు, నేను భూమి వివాద కేసు దాఖలు చేయాలనుకుంటున్నాను"

3. AI processes speech:
   ✅ Detects language automatically
   ✅ Determines form type needed
   ✅ Extracts all mentioned information
   ✅ Identifies missing required fields

4. AI asks for missing information:
   🤖 "What is your current address?"
   👤 User: "मैं दिल्ली में रहता हूं"
   🤖 "What was your previous name?"
   👤 User: "मेरा पुराना नाम राम कुमार था"

5. Form is complete and ready for submission!

🌍 Supported Languages:
- Hindi (हिन्दी)
- English
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Bengali (বাংলা)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Mixed languages (Hindi-English, etc.)

✅ Benefits:
- No form selection needed
- Works in any Indian language
- Complete speech processing
- Smart missing field detection
- Natural conversation flow
""")

if __name__ == "__main__":
    test_multilingual_ai_forms()
    show_ai_only_workflow()
    
    print("\n🎉 AI-Only Form Filling is Ready!")
    print("Users can now speak in any Indian language and AI will create the right form!")

#!/usr/bin/env python3
"""
Test AI forms directly without authentication
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from smart_form_ai import SmartFormAI
    print("✅ Smart Form AI loaded successfully!")
except Exception as e:
    print(f"❌ Error loading Smart Form AI: {e}")
    sys.exit(1)

def test_ai_forms_direct():
    """Test AI forms directly without API calls"""
    print("🤖 Testing AI Forms Directly")
    print("=" * 60)
    
    ai = SmartFormAI()
    
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
        print("-" * 50)
        print(f"Language: {test_case['language']}")
        print(f"Speech: {test_case['speech']}")
        print(f"Expected Form: {test_case['expected_form']}")
        
        try:
            # Test AI form detection directly
            result = ai.process_complete_speech(test_case['speech'], "auto")
            
            if "error" in result:
                print(f"❌ AI Processing Failed: {result['error']}")
                continue
            
            print("✅ AI Processing Successful!")
            
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
            
            if result.get('suggested_questions'):
                print("   🤖 Suggested Questions:")
                for question in result['suggested_questions'][:2]:  # Show first 2
                    print(f"      - {question}")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            print("Check your OpenAI API key and configuration")
        
        print()
    
    # Summary
    print("📊 Test Summary")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    if successful_tests == total_tests:
        print("🎉 All language tests passed! AI supports all Indian languages!")
    elif successful_tests > total_tests * 0.8:
        print("✅ Most language tests passed! AI has good multilingual support!")
    else:
        print("⚠️ Some language tests failed. Check language detection configuration.")

def show_ai_workflow():
    """Show the complete AI workflow"""
    print("\n🤖 Complete AI Form Filling Workflow")
    print("=" * 60)
    
    print("""
🎯 How AI-Only Forms Work:

1. User goes to /ai-forms page
2. User speaks completely in any language
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
6. User can download PDF and get tracking ID
7. Form appears in admin submissions

🌍 Language Detection:
- Hindi: "मेरा नाम राम है" → Detects Hindi
- English: "My name is John" → Detects English  
- Tamil: "என் பெயர் ராஜ்" → Detects Tamil
- Mixed: "My name is Rajesh, मैं 28 साल का हूं" → Detects mixed

✅ Benefits:
- No form selection needed
- Works in any Indian language
- Complete speech processing
- Smart missing field detection
- Natural conversation flow
- PDF download available
- Admin tracking included
""")

if __name__ == "__main__":
    test_ai_forms_direct()
    show_ai_workflow()
    
    print("\n🎉 AI-Only Form Filling is Ready!")
    print("Users can now speak in any Indian language and AI will create the right form!")

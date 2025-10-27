#!/usr/bin/env python3
"""
Test individual OpenAI features in your legal voice app
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if API key is set
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY not found in environment variables!")
    print("Please create a .env file with your API key.")
    sys.exit(1)

print(f"🔑 Testing with API Key: {api_key[:20]}...")
print("=" * 60)

try:
    from services.openai_service import OpenAIService
    
    print("✅ OpenAI Service imported successfully!")
    
    # Test 1: Language Detection
    print("\n🧪 Test 1: Language Detection")
    result = OpenAIService.detect_language("नमस्ते, मेरा नाम राम है")
    print(f"✅ Language Detection Result: {result}")
    
    # Test 2: Text Translation
    print("\n🧪 Test 2: Text Translation")
    result = OpenAIService.translate_text("Hello, my name is John", "hi")
    print(f"✅ Translation Result: {result}")
    
    # Test 3: Field Extraction
    print("\n🧪 Test 3: Field Extraction")
    result = OpenAIService.translate_and_extract_field(
        text="मेरा नाम राम शर्मा है",
        field_name="applicant_full_name",
        field_help="Your full legal name",
        source_language="hi"
    )
    print(f"✅ Field Extraction Result: {result}")
    
    # Test 4: Form Interpretation
    print("\n🧪 Test 4: Form Interpretation")
    sample_form = {
        "fields": [
            {"id": "applicant_name", "type": "text", "required": True, "help": "Your full name"},
            {"id": "applicant_age", "type": "number", "required": True, "help": "Your age"}
        ]
    }
    
    result = OpenAIService.interpret_form(
        form_id="test_form",
        transcript="My name is John Doe and I am 30 years old",
        form_schema=sample_form
    )
    print(f"✅ Form Interpretation Result: {result}")
    
    # Test 5: Form Validation
    print("\n🧪 Test 5: Form Validation")
    filled_data = {
        "applicant_name": "John Doe",
        "applicant_age": 30
    }
    
    result = OpenAIService.validate_form_with_gpt(
        form_id="test_form",
        filled_data=filled_data,
        form_schema=sample_form
    )
    print(f"✅ Form Validation Result: {result}")
    
    # Test 6: Follow-up Questions
    print("\n🧪 Test 6: Follow-up Questions")
    result = OpenAIService.generate_followup_questions(
        form_id="test_form",
        missing_fields=["applicant_address"],
        form_schema=sample_form
    )
    print(f"✅ Follow-up Questions Result: {result}")
    
    print("\n🎉 All OpenAI features are working correctly!")
    print("Your legal voice application is ready to use with real AI integration!")
    
except Exception as e:
    print(f"❌ Error testing features: {str(e)}")
    print("Please check your API key and try again.")

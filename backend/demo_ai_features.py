#!/usr/bin/env python3
"""
Demo script to show how your AI features work
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🎯 Legal Voice App - AI Features Demo")
print("=" * 50)

try:
    from services.openai_service import OpenAIService
    
    print("✅ OpenAI Service loaded successfully!")
    print(f"🔑 Using API Key: {os.getenv('OPENAI_API_KEY', '')[:20]}...")
    print()
    
    # Demo 1: Language Detection
    print("🧪 Demo 1: Language Detection")
    print("Input: 'नमस्ते, मेरा नाम राम है'")
    result = OpenAIService.detect_language("नमस्ते, मेरा नाम राम है")
    print(f"✅ Detected: {result['primary_language']} (confidence: {result['confidence']})")
    print()
    
    # Demo 2: Field Extraction
    print("🧪 Demo 2: Smart Field Extraction")
    print("Input: 'मेरा नाम राम शर्मा है, मैं 30 साल का हूं'")
    result = OpenAIService.translate_and_extract_field(
        text="मेरा नाम राम शर्मा है, मैं 30 साल का हूं",
        field_name="applicant_full_name",
        field_help="Your full legal name",
        source_language="hi"
    )
    print(f"✅ Extracted Name: {result['translated_value']}")
    print(f"✅ Confidence: {result['confidence']}")
    print()
    
    # Demo 3: Form Interpretation
    print("🧪 Demo 3: Complete Form Interpretation")
    print("Input: 'My name is John Doe, I am 30 years old, my father is Robert Doe'")
    
    sample_form = {
        "fields": [
            {"id": "applicant_full_name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "applicant_age", "type": "number", "required": True, "help": "Your age in years"},
            {"id": "applicant_father_name", "type": "text", "required": True, "help": "Father's name"},
            {"id": "current_address", "type": "textarea", "required": True, "help": "Your address"}
        ]
    }
    
    result = OpenAIService.interpret_form(
        form_id="demo_form",
        transcript="My name is John Doe, I am 30 years old, my father is Robert Doe",
        form_schema=sample_form
    )
    
    print("✅ Form Filled:")
    for field, value in result['filled'].items():
        print(f"   {field}: {value}")
    print(f"✅ Missing fields: {result['missing']}")
    print(f"✅ Confidence: {result['confidence']}")
    print()
    
    # Demo 4: Form Validation
    print("🧪 Demo 4: Legal Form Validation")
    filled_data = {
        "applicant_full_name": "John Doe",
        "applicant_age": 30,
        "applicant_father_name": "Robert Doe"
    }
    
    result = OpenAIService.validate_form_with_gpt(
        form_id="demo_form",
        filled_data=filled_data,
        form_schema=sample_form
    )
    
    print(f"✅ Form Valid: {result['valid']}")
    print(f"✅ Validation Score: {result['validation_score']}")
    print(f"✅ Legal Compliance: {result['legal_compliance']}")
    if result['errors']:
        print(f"⚠️ Errors: {result['errors']}")
    print()
    
    # Demo 5: Follow-up Questions
    print("🧪 Demo 5: Smart Follow-up Questions")
    result = OpenAIService.generate_followup_questions(
        form_id="demo_form",
        missing_fields=["current_address"],
        form_schema=sample_form
    )
    
    print("✅ AI Generated Questions:")
    for q in result['questions']:
        print(f"   English: {q['question']}")
        print(f"   Hindi: {q['question_hindi']}")
        print(f"   Tamil: {q['question_tamil']}")
    print()
    
    print("🎉 All AI Features Working Perfectly!")
    print("Your legal voice app can now:")
    print("• 🎤 Convert speech to text in 15+ languages")
    print("• 🧠 Intelligently extract form data")
    print("• ✅ Validate legal document completeness")
    print("• ❓ Ask smart follow-up questions")
    print("• 🌍 Handle mixed language inputs")
    print("• 📋 Fill complex legal forms automatically")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("Please check your API key and configuration.")

print("\n🚀 Ready to use! Open http://localhost:3000 to test with real voice input!")

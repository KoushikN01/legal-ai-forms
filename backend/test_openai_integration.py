#!/usr/bin/env python3
"""
Test script for OpenAI API integration with premium features
Tests multilingual support and validation capabilities
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.openai_service import OpenAIService
from config import OPENAI_API_KEY, GPT_MODEL
import json

def test_language_detection():
    """Test language detection capabilities"""
    print("🔍 Testing Language Detection...")
    
    test_cases = [
        "Hello, my name is John Smith",
        "नमस्ते, मेरा नाम राम शर्मा है",
        "வணக்கம், என் பெயர் குமார்",
        "నమస్కారం, నా పేరు రాజు",
        "Hello, मेरा नाम John है",  # Mixed language
        "I want to file a complaint about my property dispute"
    ]
    
    for text in test_cases:
        result = OpenAIService.detect_language(text)
        print(f"Text: {text[:50]}...")
        print(f"Detected: {result.get('primary_language', 'Unknown')} ({result.get('language_code', 'unknown')})")
        print(f"Confidence: {result.get('confidence', 0):.2f}")
        print(f"Mixed Language: {result.get('is_mixed_language', False)}")
        print("-" * 50)

def test_translation():
    """Test translation capabilities"""
    print("🌐 Testing Translation...")
    
    test_cases = [
        ("Hello, I want to file a name change application", "hi"),
        ("मेरा नाम बदलना है", "en"),
        ("I need help with property dispute", "ta"),
        ("I want to apply for divorce", "te")
    ]
    
    for text, target_lang in test_cases:
        result = OpenAIService.translate_text(text, target_lang)
        print(f"Original: {text}")
        print(f"Translated ({target_lang}): {result.get('translated_text', 'Error')}")
        print(f"Confidence: {result.get('confidence', 0):.2f}")
        print("-" * 50)

def test_field_extraction():
    """Test field extraction and translation"""
    print("📝 Testing Field Extraction...")
    
    test_cases = [
        ("My name is राम कुमार शर्मा", "applicant_full_name", "Your full legal name", "hi"),
        ("मेरी उम्र 35 साल है", "applicant_age", "Your age in years", "hi"),
        ("I live at 123 Main Street, Mumbai, 400001", "current_address", "Your complete address", "en"),
        ("मेरा पिता का नाम श्री राम शर्मा है", "applicant_father_name", "Father's full name", "hi")
    ]
    
    for text, field_name, field_help, source_lang in test_cases:
        result = OpenAIService.translate_and_extract_field(text, field_name, field_help, source_lang)
        print(f"Input: {text}")
        print(f"Field: {field_name}")
        print(f"Extracted: {result.get('translated_value', 'Error')}")
        print(f"Confidence: {result.get('confidence', 0):.2f}")
        print(f"Detected Language: {result.get('detected_language', 'Unknown')}")
        print("-" * 50)

def test_form_interpretation():
    """Test form interpretation"""
    print("📋 Testing Form Interpretation...")
    
    # Mock form schema
    form_schema = {
        "fields": [
            {"id": "applicant_full_name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "applicant_age", "type": "number", "required": True, "help": "Your age in years"},
            {"id": "current_address", "type": "textarea", "required": True, "help": "Your complete address"},
            {"id": "reason", "type": "textarea", "required": True, "help": "Reason for name change"}
        ]
    }
    
    test_transcripts = [
        "Hello, I am राम कुमार शर्मा, I am 35 years old, I live in Mumbai at 123 Main Street, and I want to change my name because of marriage",
        "नमस्ते, मेरा नाम सुनीता देवी है, मैं 28 साल की हूं, मैं दिल्ली में रहती हूं, और मैं अपना नाम बदलना चाहती हूं क्योंकि मेरी शादी हो गई है"
    ]
    
    for transcript in test_transcripts:
        result = OpenAIService.interpret_form("name_change", transcript, form_schema)
        print(f"Transcript: {transcript[:100]}...")
        print(f"Detected Language: {result.get('detected_language', 'Unknown')}")
        print(f"Filled Fields: {list(result.get('filled', {}).keys())}")
        print(f"Missing Fields: {result.get('missing', [])}")
        print(f"Confidence: {result.get('confidence', 0):.2f}")
        print("-" * 50)

def test_form_validation():
    """Test form validation"""
    print("✅ Testing Form Validation...")
    
    form_schema = {
        "fields": [
            {"id": "applicant_full_name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "applicant_age", "type": "number", "required": True, "help": "Your age in years"},
            {"id": "current_address", "type": "textarea", "required": True, "help": "Your complete address"},
            {"id": "phone", "type": "tel", "required": True, "help": "Your phone number"}
        ]
    }
    
    test_data = [
        {
            "applicant_full_name": "Ram Kumar Sharma",
            "applicant_age": "35",
            "current_address": "123 Main Street, Mumbai, Maharashtra 400001",
            "phone": "+91-9876543210"
        },
        {
            "applicant_full_name": "John",  # Incomplete name
            "applicant_age": "150",  # Invalid age
            "current_address": "Mumbai",  # Incomplete address
            "phone": "123"  # Invalid phone
        }
    ]
    
    for i, data in enumerate(test_data):
        result = OpenAIService.validate_form_with_gpt("name_change", data, form_schema)
        print(f"Test Case {i+1}:")
        print(f"Valid: {result.get('valid', False)}")
        print(f"Errors: {len(result.get('errors', []))}")
        print(f"Warnings: {len(result.get('warnings', []))}")
        print(f"Validation Score: {result.get('validation_score', 0):.2f}")
        print(f"Legal Compliance: {result.get('legal_compliance', 'Unknown')}")
        print("-" * 50)

def test_followup_questions():
    """Test followup question generation"""
    print("❓ Testing Followup Questions...")
    
    form_schema = {
        "fields": [
            {"id": "applicant_full_name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "applicant_age", "type": "number", "required": True, "help": "Your age in years"},
            {"id": "current_address", "type": "textarea", "required": True, "help": "Your complete address"}
        ]
    }
    
    missing_fields = ["applicant_full_name", "current_address"]
    result = OpenAIService.generate_followup_questions("name_change", missing_fields, form_schema)
    
    print(f"Missing Fields: {missing_fields}")
    print(f"Generated Questions: {len(result.get('questions', []))}")
    for q in result.get('questions', []):
        print(f"- {q.get('field', 'Unknown')}: {q.get('question', 'No question')}")
    print("-" * 50)

def main():
    """Run all tests"""
    print("🚀 Testing OpenAI API Integration with Premium Features")
    print("=" * 60)
    print(f"API Key: {OPENAI_API_KEY[:20]}..." if OPENAI_API_KEY else "No API Key")
    print(f"Model: {GPT_MODEL}")
    print("=" * 60)
    
    try:
        test_language_detection()
        test_translation()
        test_field_extraction()
        test_form_interpretation()
        test_form_validation()
        test_followup_questions()
        
        print("✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


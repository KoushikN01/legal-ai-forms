#!/usr/bin/env python3
"""
Test script to verify language detection is working properly
"""

from services.openai_service import OpenAIService

def test_language_detection():
    """Test language detection with different inputs"""
    
    test_cases = [
        ("I want to file a property dispute case", "en"),
        ("मैं एक संपत्ति विवाद का मामला दायर करना चाहता हूं", "hi"),
        ("నేను ఒక ఆస్తి వివాద కేసును దాఖలు చేయాలనుకుంటున్నాను", "te"),
        ("நான் ஒரு சொத்து வழக்கை தாக்கல் செய்ய விரும்புகிறேன்", "ta"),
        ("আমি একটি সম্পত্তি বিরোধের মামলা দায়ের করতে চাই", "bn")
    ]
    
    print("Testing Language Detection...")
    print("=" * 50)
    
    for text, expected_lang in test_cases:
        print(f"\nInput: {text}")
        print(f"Expected: {expected_lang}")
        
        try:
            result = OpenAIService.detect_language(text)
            detected = result.get('language_code', 'unknown')
            confidence = result.get('confidence', 0.0)
            
            print(f"Detected: {detected}")
            print(f"Confidence: {confidence}")
            
            if detected == expected_lang:
                print("✅ CORRECT")
            else:
                print("❌ INCORRECT")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Language detection test completed!")

if __name__ == "__main__":
    test_language_detection()
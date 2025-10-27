#!/usr/bin/env python3
"""
Test the Smart Form AI API endpoints
"""

import requests
import json
import time

def test_smart_form_api():
    """Test the smart form AI API endpoints"""
    print("🤖 Testing Smart Form AI API")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Test cases
    test_cases = [
        {
            "speech": "मेरा नाम राम शर्मा है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं",
            "language": "hi",
            "description": "Hindi - Name Change Request"
        },
        {
            "speech": "I want to file a property dispute case. My name is John Doe, I am 35 years old, and I live at 123 Main Street. The defendant is Jane Smith who lives at 456 Oak Avenue.",
            "language": "en",
            "description": "English - Property Dispute"
        },
        {
            "speech": "I got a traffic challan and want to appeal it. My name is Rajesh Kumar, challan number is CH123456, vehicle number is KA01AB1234",
            "language": "en",
            "description": "English - Traffic Fine Appeal"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {test_case['description']}")
        print("-" * 50)
        print(f"👤 User: {test_case['speech']}")
        
        # Test smart form detection
        try:
            response = requests.post(f"{base_url}/smart-form-detection", 
                                   json={
                                       "speech_text": test_case['speech'],
                                       "language": test_case['language']
                                   },
                                   headers={"Authorization": "Bearer test_token"})
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Smart Form Detection Successful!")
                print(f"   Form Type: {result.get('form_type', 'Unknown')}")
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
                    for question in result['suggested_questions'][:3]:  # Show first 3
                        print(f"      - {question}")
                
                if result.get('form_summary'):
                    summary = result['form_summary']
                    print(f"   📊 Completion: {summary.get('completion_percentage', 0)}%")
                
            else:
                print(f"❌ Smart Form Detection Failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ API Error: {str(e)}")
            print("Make sure your backend is running on http://localhost:8000")
        
        print()

def show_usage_examples():
    """Show how to use the smart form AI API"""
    print("\n📱 Smart Form AI API Usage")
    print("=" * 60)
    
    print("""
🔧 API Endpoints:

1. Smart Form Detection:
   POST /smart-form-detection
   Body: {
     "speech_text": "मेरा नाम राम है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं",
     "language": "hi"
   }
   Response: {
     "form_type": "name_change",
     "detected_language": "hi",
     "confidence": 0.95,
     "extracted_data": {
       "applicant_full_name": "राम",
       "applicant_age": 30
     },
     "missing_required_fields": ["current_address", "previous_name", "new_name"],
     "suggested_questions": ["आपका वर्तमान पता क्या है?", "आपका पिछला नाम क्या था?"]
   }

2. Process Complete Speech:
   POST /process-complete-speech
   Body: {
     "speech_text": "I want to file a property dispute case...",
     "language": "auto"
   }
   Response: {
     "form_type": "property_dispute",
     "form_schema": { ... },
     "extracted_data": { ... },
     "missing_required_fields": [ ... ]
   }
""")

def show_frontend_integration():
    """Show how to integrate with frontend"""
    print("\n🌐 Frontend Integration Example")
    print("=" * 60)
    
    print("""
📱 React Component Example:

```javascript
const SmartFormAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formResult, setFormResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const processCompleteSpeech = async (speechText) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/smart-form-detection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          speech_text: speechText,
          language: 'auto'
        })
      });
      
      const result = await response.json();
      setFormResult(result);
      
      if (result.missing_required_fields.length > 0) {
        // Show missing field questions
        speakQuestions(result.suggested_questions);
      } else {
        // Form is complete, show review
        showFormReview(result);
      }
      
    } catch (error) {
      console.error('Error processing speech:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakQuestions = (questions) => {
    if (questions && questions.length > 0) {
      const firstQuestion = questions[0];
      speakText(firstQuestion);
    }
  };

  return (
    <div className="smart-form-ai">
      <h2>Speak Your Legal Request</h2>
      
      {!isProcessing ? (
        <div>
          <button 
            onClick={startRecording}
            className="record-btn"
            disabled={isRecording}
          >
            {isRecording ? '🎤 Recording...' : '🎤 Start Speaking'}
          </button>
          
          <p>Speak naturally in any language. AI will understand and create the right form.</p>
        </div>
      ) : (
        <div className="processing">
          <div className="spinner" />
          <p>AI is analyzing your request...</p>
        </div>
      )}
      
      {formResult && (
        <div className="form-result">
          <h3>Detected Form: {formResult.form_type}</h3>
          <p>Confidence: {formResult.confidence * 100}%</p>
          
          <div className="extracted-data">
            <h4>Extracted Information:</h4>
            {Object.entries(formResult.extracted_data).map(([field, value]) => (
              <div key={field}>
                <strong>{field}:</strong> {value}
              </div>
            ))}
          </div>
          
          {formResult.missing_required_fields.length > 0 && (
            <div className="missing-fields">
              <h4>Missing Information:</h4>
              <ul>
                {formResult.suggested_questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```
""")

if __name__ == "__main__":
    test_smart_form_api()
    show_usage_examples()
    show_frontend_integration()
    
    print("\n🎉 Smart Form AI is ready!")
    print("Your users can now speak naturally and AI will create the right form!")

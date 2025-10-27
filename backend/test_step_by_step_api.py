#!/usr/bin/env python3
"""
Test the step-by-step form API endpoints
"""

import requests
import json
import time

def test_step_by_step_api():
    """Test the step-by-step form API"""
    print("🧪 Testing Step-by-Step Form API")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Start form session
    print("1️⃣ Testing: Start Form Session")
    try:
        response = requests.post(f"{base_url}/start-form-session", 
                               json={"form_id": "name_change"},
                               headers={"Authorization": "Bearer test_token"})
        
        if response.status_code == 200:
            session_data = response.json()
            print("✅ Form session started successfully!")
            print(f"   Session ID: {session_data['session_id']}")
            print(f"   Question: {session_data['question']}")
            print(f"   Hindi: {session_data['question_hindi']}")
            print(f"   Progress: {session_data['progress']['current']}/{session_data['progress']['total']} ({session_data['progress']['percentage']}%)")
            
            # Test 2: Answer question
            print("\n2️⃣ Testing: Answer Question")
            answer_response = requests.post(f"{base_url}/answer-question",
                                         json={
                                             "session_id": session_data['session_id'],
                                             "answer": "My name is John Doe",
                                             "language": "en"
                                         },
                                         headers={"Authorization": "Bearer test_token"})
            
            if answer_response.status_code == 200:
                answer_data = answer_response.json()
                print("✅ Answer processed successfully!")
                print(f"   Extracted: {answer_data['extracted_value']}")
                print(f"   Confidence: {answer_data['confidence']}")
                print(f"   Next Question: {answer_data['next_question']['question']}")
                print(f"   Next Hindi: {answer_data['next_question']['question_hindi']}")
                print(f"   Progress: {answer_data['progress']['current']}/{answer_data['progress']['total']} ({answer_data['progress']['percentage']}%)")
            else:
                print(f"❌ Answer failed: {answer_response.status_code}")
                print(f"   Error: {answer_response.text}")
        else:
            print(f"❌ Session start failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        print("Make sure your backend is running on http://localhost:8000")

def show_usage_examples():
    """Show how to use the step-by-step API"""
    print("\n📱 How to Use Step-by-Step Form API")
    print("=" * 50)
    
    print("""
🔧 API Endpoints:

1. Start Form Session:
   POST /start-form-session
   Body: {"form_id": "name_change"}
   Response: {
     "session_id": "session_abc123",
     "question": "What is your full name?",
     "question_hindi": "आपका पूरा नाम क्या है?",
     "progress": {"current": 1, "total": 6, "percentage": 17}
   }

2. Answer Question:
   POST /answer-question
   Body: {
     "session_id": "session_abc123",
     "answer": "My name is John Doe",
     "language": "en"
   }
   Response: {
     "status": "success",
     "extracted_value": "John Doe",
     "confidence": 0.95,
     "next_question": {
       "question": "What is your age?",
       "question_hindi": "आपकी उम्र क्या है?"
     },
     "progress": {"current": 2, "total": 6, "percentage": 33}
   }
""")

def show_frontend_integration():
    """Show how to integrate with frontend"""
    print("\n🌐 Frontend Integration Example")
    print("=" * 50)
    
    print("""
📱 React Component Example:

```javascript
const StepByStepForm = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);

  const startForm = async (formId) => {
    const response = await fetch('/start-form-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_id: formId })
    });
    const data = await response.json();
    setSessionId(data.session_id);
    setCurrentQuestion(data);
    setProgress(data.progress.percentage);
  };

  const answerQuestion = async (answer) => {
    const response = await fetch('/answer-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        answer: answer,
        language: 'en'
      })
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.current_field]: data.extracted_value
      }));
      setCurrentQuestion(data.next_question);
      setProgress(data.progress.percentage);
    }
  };

  return (
    <div>
      <h3>{currentQuestion?.question}</h3>
      <p>Hindi: {currentQuestion?.question_hindi}</p>
      <VoiceRecorder onTranscript={answerQuestion} />
      <ProgressBar value={progress} />
    </div>
  );
};
```
""")

if __name__ == "__main__":
    test_step_by_step_api()
    show_usage_examples()
    show_frontend_integration()
    
    print("\n🎉 Step-by-step form API is ready!")
    print("Your users can now have conversational form filling!")

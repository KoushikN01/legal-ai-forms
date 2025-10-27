#!/usr/bin/env python3
"""
Step-by-step form filling with AI conversation
"""

import os
import sys
from dotenv import load_dotenv
from typing import Dict, List, Optional
import json

# Load environment variables
load_dotenv()

try:
    from services.openai_service import OpenAIService
    print("✅ OpenAI Service loaded successfully!")
except Exception as e:
    print(f"❌ Error loading OpenAI service: {e}")
    sys.exit(1)

class StepByStepFormFiller:
    """Handles step-by-step form filling with AI conversation"""
    
    def __init__(self, form_id: str, form_schema: Dict):
        self.form_id = form_id
        self.form_schema = form_schema
        self.filled_data = {}
        self.current_field_index = 0
        self.fields = form_schema.get('fields', [])
        self.required_fields = [f['id'] for f in self.fields if f.get('required', False)]
        
    def get_current_question(self) -> Dict:
        """Get the current question to ask"""
        if self.current_field_index >= len(self.fields):
            return {"status": "complete", "message": "All fields completed!"}
        
        current_field = self.fields[self.current_field_index]
        
        # Generate AI-powered question
        question_result = OpenAIService.generate_followup_questions(
            form_id=self.form_id,
            missing_fields=[current_field['id']],
            form_schema=self.form_schema
        )
        
        if 'questions' in question_result and question_result['questions']:
            ai_question = question_result['questions'][0]
            return {
                "status": "question",
                "field_id": current_field['id'],
                "field_label": current_field['label'],
                "field_type": current_field['type'],
                "question": ai_question.get('question', f"What is your {current_field['label']}?"),
                "question_hindi": ai_question.get('question_hindi', f"आपका {current_field['label']} क्या है?"),
                "question_tamil": ai_question.get('question_tamil', f"உங்கள் {current_field['label']} என்ன?"),
                "question_telugu": ai_question.get('question_telugu', f"మీ {current_field['label']} ఏమిటి?"),
                "help_text": current_field.get('help', ''),
                "is_required": current_field.get('required', False),
                "progress": {
                    "current": self.current_field_index + 1,
                    "total": len(self.fields),
                    "percentage": round(((self.current_field_index + 1) / len(self.fields)) * 100)
                }
            }
        else:
            # Fallback question
            return {
                "status": "question",
                "field_id": current_field['id'],
                "field_label": current_field['label'],
                "field_type": current_field['type'],
                "question": f"What is your {current_field['label']}?",
                "question_hindi": f"आपका {current_field['label']} क्या है?",
                "question_tamil": f"உங்கள் {current_field['label']} என்ன?",
                "question_telugu": f"మీ {current_field['label']} ఏమిటి?",
                "help_text": current_field.get('help', ''),
                "is_required": current_field.get('required', False),
                "progress": {
                    "current": self.current_field_index + 1,
                    "total": len(self.fields),
                    "percentage": round(((self.current_field_index + 1) / len(self.fields)) * 100)
                }
            }
    
    def process_answer(self, answer: str, language: str = "en") -> Dict:
        """Process user's answer and extract field value"""
        current_field = self.fields[self.current_field_index]
        
        # Use AI to extract and translate the answer
        extraction_result = OpenAIService.translate_and_extract_field(
            text=answer,
            field_name=current_field['id'],
            field_help=current_field.get('help', ''),
            source_language=language
        )
        
        if 'translated_value' in extraction_result:
            # Save the extracted value
            self.filled_data[current_field['id']] = extraction_result['translated_value']
            
            # Move to next field
            self.current_field_index += 1
            
            return {
                "status": "success",
                "extracted_value": extraction_result['translated_value'],
                "confidence": extraction_result.get('confidence', 0.8),
                "next_question": self.get_current_question(),
                "progress": {
                    "current": self.current_field_index + 1,
                    "total": len(self.fields),
                    "percentage": round(((self.current_field_index + 1) / len(self.fields)) * 100)
                }
            }
        else:
            return {
                "status": "error",
                "message": "Could not extract value from your answer. Please try again.",
                "suggestion": f"Try saying something like: 'My {current_field['label']} is...'"
            }
    
    def get_completion_status(self) -> Dict:
        """Get the completion status of the form"""
        missing_required = [f for f in self.required_fields if f not in self.filled_data]
        
        return {
            "status": "complete" if not missing_required else "incomplete",
            "filled_fields": len(self.filled_data),
            "total_fields": len(self.fields),
            "missing_required": missing_required,
            "completion_percentage": round((len(self.filled_data) / len(self.fields)) * 100),
            "filled_data": self.filled_data
        }
    
    def validate_form(self) -> Dict:
        """Validate the completed form"""
        return OpenAIService.validate_form_with_gpt(
            form_id=self.form_id,
            filled_data=self.filled_data,
            form_schema=self.form_schema
        )

def demo_step_by_step_form():
    """Demo the step-by-step form filling"""
    print("🎯 Step-by-Step Form Filling Demo")
    print("=" * 50)
    
    # Sample form schema
    sample_form = {
        "id": "name_change",
        "title": "Name Change Affidavit",
        "fields": [
            {"id": "applicant_full_name", "label": "Full Name", "type": "text", "required": True, "help": "Your current full legal name"},
            {"id": "applicant_age", "label": "Age", "type": "number", "required": True, "help": "Your age in years"},
            {"id": "applicant_father_name", "label": "Father's Name", "type": "text", "required": True, "help": "Father or guardian's full name"},
            {"id": "current_address", "label": "Current Address", "type": "textarea", "required": True, "help": "Full residential address with PIN code"},
            {"id": "previous_name", "label": "Previous Name", "type": "text", "required": True, "help": "The name you used earlier"},
            {"id": "new_name", "label": "New Name", "type": "text", "required": True, "help": "The new name you want officially"}
        ]
    }
    
    # Create form filler
    form_filler = StepByStepFormFiller("name_change", sample_form)
    
    print("✅ Form filler created successfully!")
    print(f"📋 Form: {sample_form['title']}")
    print(f"📝 Total fields: {len(sample_form['fields'])}")
    print()
    
    # Demo the conversation flow
    print("🗣️ AI Conversation Flow:")
    print("-" * 30)
    
    # Get first question
    question = form_filler.get_current_question()
    print(f"🤖 AI: {question['question']}")
    print(f"   (Hindi: {question['question_hindi']})")
    print(f"   Progress: {question['progress']['current']}/{question['progress']['total']} ({question['progress']['percentage']}%)")
    print()
    
    # Simulate user answers
    demo_answers = [
        ("My name is John Doe", "en"),
        ("I am 30 years old", "en"),
        ("My father's name is Robert Doe", "en"),
        ("I live at 123 Main Street, New York, 10001", "en"),
        ("My previous name was Johnny Doe", "en"),
        ("I want to change my name to John Smith", "en")
    ]
    
    for i, (answer, language) in enumerate(demo_answers):
        print(f"👤 User: {answer}")
        
        # Process the answer
        result = form_filler.process_answer(answer, language)
        
        if result['status'] == 'success':
            print(f"✅ AI: Extracted '{result['extracted_value']}' (confidence: {result['confidence']})")
            
            # Check if there's a next question
            if result['next_question']['status'] == 'question':
                print(f"🤖 AI: {result['next_question']['question']}")
                print(f"   (Hindi: {result['next_question']['question_hindi']})")
                print(f"   Progress: {result['next_question']['progress']['current']}/{result['next_question']['progress']['total']} ({result['next_question']['progress']['percentage']}%)")
            else:
                print("🎉 All questions completed!")
        else:
            print(f"❌ AI: {result['message']}")
        
        print()
    
    # Show completion status
    completion = form_filler.get_completion_status()
    print("📊 Completion Status:")
    print(f"   Filled: {completion['filled_fields']}/{completion['total_fields']} fields")
    print(f"   Completion: {completion['completion_percentage']}%")
    print(f"   Status: {completion['status']}")
    print()
    
    # Show filled data
    print("📋 Filled Form Data:")
    for field, value in completion['filled_data'].items():
        print(f"   {field}: {value}")
    print()
    
    # Validate the form
    print("🔍 Form Validation:")
    validation = form_filler.validate_form()
    print(f"   Valid: {validation['valid']}")
    print(f"   Score: {validation['validation_score']}")
    print(f"   Compliance: {validation['legal_compliance']}")
    
    if validation['errors']:
        print("   Errors:")
        for error in validation['errors']:
            print(f"     - {error['message']}")
    
    print("\n🎉 Step-by-step form filling demo completed!")
    print("This is how your legal voice app will work with real users!")

if __name__ == "__main__":
    demo_step_by_step_form()

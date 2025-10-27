#!/usr/bin/env python3
"""
Advanced AI-powered form detection and auto-filling
"""

import os
import sys
from dotenv import load_dotenv
from typing import Dict, List, Optional, Tuple
import json
import re

# Load environment variables
load_dotenv()

try:
    from services.openai_service import OpenAIService
    print("✅ OpenAI Service loaded successfully!")
except Exception as e:
    print(f"❌ Error loading OpenAI service: {e}")
    sys.exit(1)

class SmartFormAI:
    """Advanced AI for smart form detection and auto-filling"""
    
    def __init__(self):
        self.available_forms = {
            "name_change": {
                "keywords": ["name change", "change name", "नाम बदलना", "பெயர் மாற்றம்", "పేరు మార్చడం"],
                "required_fields": ["applicant_full_name", "applicant_age", "applicant_father_name", "current_address", "previous_name", "new_name", "reason", "date_of_declaration", "place", "id_proof_type", "id_proof_number"],
                "optional_fields": []
            },
            "property_dispute_simple": {
                "keywords": ["property dispute", "land dispute", "जमीन का विवाद", "பொருள் வழக்கு", "భూమి వివాదం"],
                "required_fields": ["plaintiff_name", "plaintiff_address", "defendant_name", "defendant_address", "property_description", "nature_of_claim", "value_of_claim", "facts_of_case", "relief_sought", "verification_declaration"],
                "optional_fields": ["date_of_incident", "evidence_list"]
            },
            "traffic_fine_appeal": {
                "keywords": ["traffic fine", "challan", "traffic challan", "ट्रैफिक चालान", "போக்குவரத்து அபராதம்", "ట్రాఫిక్ జరిమానా"],
                "required_fields": ["appellant_name", "appellant_address", "challan_number", "vehicle_number", "date_of_challan", "offence_details", "explanation"],
                "optional_fields": ["police_station", "attachments"]
            },
            "mutual_divorce_petition": {
                "keywords": ["divorce", "mutual divorce", "तलाक", "விவாகரத்து", "విడాకులు"],
                "required_fields": ["husband_full_name", "wife_full_name", "marriage_date", "marriage_place", "residential_address_husband", "residential_address_wife", "reason_for_divorce", "mutual_agreement", "date_of_affidavit", "attachments"],
                "optional_fields": ["children", "maintenance_terms"]
            },
            "affidavit_general": {
                "keywords": ["affidavit", "declaration", "शपथ पत्र", "உறுதிமொழி", "శపథ పత్రం"],
                "required_fields": ["deponent_name", "deponent_age", "deponent_address", "statement_text", "place_of_sworn", "date_of_sworn"],
                "optional_fields": ["notary_name", "attachments"]
            }
        }
    
    def detect_form_type_and_extract_info(self, speech_text: str, language: str = "auto") -> Dict:
        """Detect form type and extract all information from speech"""
        
        # First, detect the language if auto
        if language == "auto":
            # Enhanced language detection with better accuracy
            lang_result = OpenAIService.detect_language(speech_text)
            detected_language = lang_result.get('language_code', 'en')
            
            # Enhanced validation for language detection
            if detected_language == 'hi' and not any(char in speech_text for char in 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'):
                # If no Hindi characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Hindi characters found, defaulting to English")
            elif detected_language == 'ta' and not any(char in speech_text for char in 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநபமயரலவஶஷஸஹ'):
                # If no Tamil characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Tamil characters found, defaulting to English")
            elif detected_language == 'te' and not any(char in speech_text for char in 'అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహ'):
                # If no Telugu characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Telugu characters found, defaulting to English")
            elif detected_language == 'bn' and not any(char in speech_text for char in 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলবশষসহ'):
                # If no Bengali characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Bengali characters found, defaulting to English")
            elif detected_language == 'gu' and not any(char in speech_text for char in 'અઆઇઈઉઊઋએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહ'):
                # If no Gujarati characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Gujarati characters found, defaulting to English")
            elif detected_language == 'kn' and not any(char in speech_text for char in 'ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹ೦೧೨೩೪೫೬೭೮೯'):
                # If no Kannada characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Kannada characters found, defaulting to English")
            elif detected_language == 'ml' and not any(char in speech_text for char in 'അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരലവശഷസഹ'):
                # If no Malayalam characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Malayalam characters found, defaulting to English")
            elif detected_language == 'pa' and not any(char in speech_text for char in 'ਅਆਇਈਉਊ਋ਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸ਼਷ਸਹ'):
                # If no Punjabi characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Punjabi characters found, defaulting to English")
            elif detected_language == 'mr' and not any(char in speech_text for char in 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'):
                # If no Marathi characters found, likely English
                detected_language = 'en'
                print(f"[DEBUG] No Marathi characters found, defaulting to English")
            
            print(f"[DEBUG] Language detection result: {lang_result}")
            print(f"[DEBUG] Detected language: {detected_language}")
            print(f"[DEBUG] Speech text: '{speech_text}'")
            print(f"[DEBUG] Speech text length: {len(speech_text)}")
            
            # Enhanced debugging for all languages
            print(f"[DEBUG] Full language result: {lang_result}")
            print(f"[DEBUG] Original detected language: {detected_language}")
            
            # Check for Kannada
            if 'kn' in str(lang_result).lower() or 'kannada' in str(lang_result).lower():
                print(f"[DEBUG] Kannada detected in language result")
                kannada_chars = [char for char in speech_text if char in 'ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹ೦೧೨೩೪೫೬೭೮೯']
                print(f"[DEBUG] Kannada characters found: {kannada_chars}")
                if kannada_chars:
                    detected_language = 'kn'
                    print(f"[DEBUG] Setting language to Kannada based on character detection")
            
            # Check for Tamil
            tamil_chars = [char for char in speech_text if char in 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநபமயரலவஶஷஸஹ']
            if tamil_chars:
                detected_language = 'ta'
                print(f"[DEBUG] Tamil characters found: {tamil_chars}, setting language to Tamil")
            
            # Check for Telugu
            telugu_chars = [char for char in speech_text if char in 'అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహ']
            if telugu_chars:
                detected_language = 'te'
                print(f"[DEBUG] Telugu characters found: {telugu_chars}, setting language to Telugu")
            
            # Check for Bengali
            bengali_chars = [char for char in speech_text if char in 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলবশষসহ']
            if bengali_chars:
                detected_language = 'bn'
                print(f"[DEBUG] Bengali characters found: {bengali_chars}, setting language to Bengali")
            
            # Check for Gujarati
            gujarati_chars = [char for char in speech_text if char in 'અઆઇઈઉઊઋએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહ']
            if gujarati_chars:
                detected_language = 'gu'
                print(f"[DEBUG] Gujarati characters found: {gujarati_chars}, setting language to Gujarati")
            
            # Check for Malayalam
            malayalam_chars = [char for char in speech_text if char in 'അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരലവശഷസഹ']
            if malayalam_chars:
                detected_language = 'ml'
                print(f"[DEBUG] Malayalam characters found: {malayalam_chars}, setting language to Malayalam")
            
            # Check for Punjabi
            punjabi_chars = [char for char in speech_text if char in 'ਅਆਇਈਉਊ਋ਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸ਼਷ਸਹ']
            if punjabi_chars:
                detected_language = 'pa'
                print(f"[DEBUG] Punjabi characters found: {punjabi_chars}, setting language to Punjabi")
            
            # Check for Marathi
            marathi_chars = [char for char in speech_text if char in 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह']
            if marathi_chars:
                detected_language = 'mr'
                print(f"[DEBUG] Marathi characters found: {marathi_chars}, setting language to Marathi")
            
            print(f"[DEBUG] Final detected language: {detected_language}")
        else:
            detected_language = language
        
        # Create comprehensive prompt for form detection and extraction
        prompt = f"""You are an expert legal form AI assistant. Analyze the user's speech and:

1. DETECT FORM TYPE: Determine which legal form they need based on their intent
2. EXTRACT ALL INFORMATION: Pull out all mentioned details
3. IDENTIFY MISSING FIELDS: Find what required information is missing

USER SPEECH: "{speech_text}"
DETECTED LANGUAGE: {detected_language}

IMPORTANT: 
- If the user spoke in English, generate questions in English
- If the user spoke in Hindi, generate questions in Hindi
- If the user spoke in Tamil, generate questions in Tamil
- If the user spoke in Telugu, generate questions in Telugu
- Always match the language of the user's initial speech

AVAILABLE FORM TYPES:
- name_change: For changing legal name
- property_dispute_simple: For property/land disputes  
- traffic_fine_appeal: For appealing traffic challans
- mutual_divorce_petition: For mutual consent divorce
- affidavit_general: For general affidavits

FORM FIELDS REFERENCE:
- name_change REQUIRED: applicant_full_name, applicant_age, applicant_father_name, current_address, previous_name, new_name, reason, date_of_declaration, place, id_proof_type, id_proof_number
- property_dispute_simple REQUIRED: plaintiff_name, plaintiff_address, defendant_name, defendant_address, property_description, nature_of_claim, value_of_claim, facts_of_case, relief_sought, verification_declaration
- traffic_fine_appeal REQUIRED: appellant_name, appellant_address, challan_number, vehicle_number, date_of_challan, offence_details, explanation
- mutual_divorce_petition REQUIRED: husband_full_name, wife_full_name, marriage_date, marriage_place, residential_address_husband, residential_address_wife, reason_for_divorce, mutual_agreement, date_of_affidavit, attachments
- affidavit_general REQUIRED: deponent_name, deponent_age, deponent_address, statement_text, place_of_sworn, date_of_sworn

TASK:
1. Determine the most appropriate form type
2. Extract ALL mentioned information with proper field mapping
3. Identify missing required fields
4. Provide confidence scores
5. Handle mixed language inputs
6. ALWAYS process and store extracted data in English - convert all values to English
7. IMPORTANT: All extracted_data values must be in English, regardless of input language
8. For each form type, only ask for the REQUIRED fields listed above
9. IMPORTANT: Only return missing_required_fields if there are actually missing fields
10. If all required fields are present, set missing_required_fields to empty array

CRITICAL LANGUAGE INSTRUCTIONS:
- If detected language is 'en' (English), generate questions in English
- If detected language is 'hi' (Hindi), generate questions in Hindi
- If detected language is 'te' (Telugu), generate questions in Telugu
- If detected language is 'ta' (Tamil), generate questions in Tamil
- If detected language is 'bn' (Bengali), generate questions in Bengali
- If detected language is 'gu' (Gujarati), generate questions in Gujarati
- If detected language is 'kn' (Kannada), generate questions in Kannada
- If detected language is 'ml' (Malayalam), generate questions in Malayalam
- If detected language is 'pa' (Punjabi), generate questions in Punjabi
- If detected language is 'mr' (Marathi), generate questions in Marathi

CRITICAL: Generate suggested_questions in the EXACT SAME language as detected_language:
- If detected_language is 'en': Generate questions in English
- If detected_language is 'hi': Generate questions in Hindi  
- If detected_language is 'te': Generate questions in Telugu
- If detected_language is 'ta': Generate questions in Tamil
- If detected_language is 'bn': Generate questions in Bengali
- If detected_language is 'gu': Generate questions in Gujarati
- If detected_language is 'kn': Generate questions in Kannada
- If detected_language is 'ml': Generate questions in Malayalam
- If detected_language is 'pa': Generate questions in Punjabi
- If detected_language is 'mr': Generate questions in Marathi

EXAMPLES FOR EACH LANGUAGE:
- English (en): "What is your name?", "What is your address?"
- Hindi (hi): "आपका नाम क्या है?", "आपका पता क्या है?"
- Telugu (te): "మీ పేరు ఏమిటి?", "మీ చిరునామా ఏమిటి?"
- Tamil (ta): "உங்கள் பெயர் என்ன?", "உங்கள் முகவரி என்ன?"
- Bengali (bn): "আপনার নাম কি?", "আপনার ঠিকানা কি?"
- Gujarati (gu): "તમારું નામ શું છે?", "તમારું સરનામું શું છે?"
- Kannada (kn): "ನಿಮ್ಮ ಹೆಸರು ಏನು?", "ನಿಮ್ಮ ವಿಳಾಸ ಏನು?"
- Malayalam (ml): "നിങ്ങളുടെ പേര് എന്താണ്?", "നിങ്ങളുടെ വിലാസം എന്താണ്?"
- Punjabi (pa): "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?", "ਤੁਹਾਡਾ ਪਤਾ ਕੀ ਹੈ?"
- Marathi (mr): "तुमचे नाव काय आहे?", "तुमचा पत्ता काय आहे?"

MANDATORY: The suggested_questions array MUST contain questions in the detected_language only!

Return JSON:
{{
  "detected_language": "{detected_language}",
  "form_type": "property_dispute_simple",
  "confidence": 0.95,
  "extracted_data": {{
    "plaintiff_name": "Kaushik",
    "plaintiff_address": "123 Main Street"
  }},
  "missing_required_fields": ["defendant_name", "defendant_address", "property_description"],
  "missing_optional_fields": ["nature_of_claim", "value_of_claim"],
  "intent_analysis": "User wants to file a property dispute case",
  "suggested_questions": [
    "Generate questions in {detected_language} for missing fields",
    "Questions should match the detected language exactly",
    "Use the language examples provided above"
  ],
  "language_notes": "User spoke in {detected_language}, questions generated in {detected_language}"
}}"""
        
        try:
            from services.openai_service import client
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a legal form AI expert. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1500
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            
            # Ensure detected_language is set correctly
            if "detected_language" not in result:
                result["detected_language"] = detected_language
            
            print(f"[DEBUG] Final result: {result}")
            return result
            
        except Exception as e:
            return {
                "error": str(e),
                "detected_language": detected_language,
                "form_type": "name_change",
                "confidence": 0.3,
                "extracted_data": {},
                "missing_required_fields": [],
                "missing_optional_fields": [],
                "intent_analysis": "Could not analyze speech",
                "suggested_questions": []
            }
    
    def generate_missing_field_questions(self, form_type: str, missing_fields: List[str], language: str = "en") -> Dict:
        """Generate questions for missing fields in user's preferred language"""
        
        form_info = self.available_forms.get(form_type, {})
        if not form_info:
            return {"error": "Form type not found"}
        
        # Get field descriptions
        field_descriptions = {}
        for field in missing_fields:
            if field in ["applicant_full_name", "plaintiff_name", "appellant_name", "husband_name", "wife_name"]:
                field_descriptions[field] = "Your full legal name"
            elif field in ["applicant_age"]:
                field_descriptions[field] = "Your age in years"
            elif field in ["applicant_father_name"]:
                field_descriptions[field] = "Your father's full name"
            elif field in ["current_address", "plaintiff_address", "appellant_address"]:
                field_descriptions[field] = "Your complete address with PIN code"
            elif field in ["previous_name"]:
                field_descriptions[field] = "Your previous name"
            elif field in ["new_name"]:
                field_descriptions[field] = "Your new desired name"
            elif field in ["challan_number"]:
                field_descriptions[field] = "Your challan number"
            elif field in ["vehicle_number"]:
                field_descriptions[field] = "Your vehicle number"
            else:
                field_descriptions[field] = f"Information about {field.replace('_', ' ')}"
        
        # Generate questions in multiple languages
        questions = []
        for i, field in enumerate(missing_fields):
            question_data = {
                "field": field,
                "priority": i + 1,
                "question": f"What is your {field.replace('_', ' ')}?",
                "question_hindi": f"आपका {field.replace('_', ' ')} क्या है?",
                "question_tamil": f"உங்கள் {field.replace('_', ' ')} என்ன?",
                "question_telugu": f"మీ {field.replace('_', ' ')} ఏమిటి?",
                "help_text": field_descriptions.get(field, ""),
                "is_required": True
            }
            questions.append(question_data)
        
        return {
            "form_type": form_type,
            "missing_fields": missing_fields,
            "questions": questions,
            "total_missing": len(missing_fields),
            "language": language
        }
    
    def process_complete_speech(self, speech_text: str, language: str = "auto") -> Dict:
        """Complete processing of user speech - detect form, extract info, identify missing fields"""
        
        print(f"🎤 Processing speech: {speech_text[:50]}...")
        
        # Step 1: Detect form type and extract information
        analysis_result = self.detect_form_type_and_extract_info(speech_text, language)
        
        if "error" in analysis_result:
            return analysis_result
        
        # Step 2: Generate questions for missing fields
        missing_fields = analysis_result.get("missing_required_fields", [])
        if missing_fields:
            questions_result = self.generate_missing_field_questions(
                analysis_result["form_type"], 
                missing_fields, 
                analysis_result["detected_language"]
            )
            analysis_result["missing_field_questions"] = questions_result
        
        # Step 3: Create form summary
        analysis_result["form_summary"] = {
            "form_type": analysis_result["form_type"],
            "extracted_count": len(analysis_result.get("extracted_data", {})),
            "missing_count": len(missing_fields),
            "completion_percentage": round((len(analysis_result.get("extracted_data", {})) / 
                                          (len(analysis_result.get("extracted_data", {})) + len(missing_fields)) * 100) if 
                                          (len(analysis_result.get("extracted_data", {})) + len(missing_fields)) > 0 else 100, 2)
        }
        
        return analysis_result

def demo_smart_form_ai():
    """Demo the smart form AI functionality"""
    print("🤖 Smart Form AI Demo")
    print("=" * 60)
    
    ai = SmartFormAI()
    
    # Test cases
    test_cases = [
        {
            "speech": "मेरा नाम राम शर्मा है, मैं 30 साल का हूं, मैं अपना नाम बदलना चाहता हूं",
            "language": "hi",
            "description": "Hindi - Name Change Request"
        },
        {
            "speech": "I want to file a property dispute case. My name is John Doe, I am 35 years old, and I live at 123 Main Street. The defendant is Jane Smith who lives at 456 Oak Avenue. The property is located at 789 Pine Street.",
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
        
        # Process the speech
        result = ai.process_complete_speech(test_case['speech'], test_case['language'])
        
        if "error" in result:
            print(f"❌ Error: {result['error']}")
            continue
        
        print(f"✅ Form Type: {result['form_type']}")
        print(f"✅ Language: {result['detected_language']}")
        print(f"✅ Confidence: {result['confidence']}")
        
        # Show extracted data
        if result.get('extracted_data'):
            print("📋 Extracted Information:")
            for field, value in result['extracted_data'].items():
                print(f"   {field}: {value}")
        
        # Show missing fields
        if result.get('missing_required_fields'):
            print("❓ Missing Required Fields:")
            for field in result['missing_required_fields']:
                print(f"   - {field}")
        
        # Show suggested questions
        if result.get('suggested_questions'):
            print("🤖 AI Suggested Questions:")
            for question in result['suggested_questions']:
                print(f"   - {question}")
        
        # Show completion status
        if result.get('form_summary'):
            summary = result['form_summary']
            print(f"📊 Completion: {summary['completion_percentage']}% ({summary['extracted_count']} fields filled, {summary['missing_count']} missing)")
        
        print()

if __name__ == "__main__":
    demo_smart_form_ai()

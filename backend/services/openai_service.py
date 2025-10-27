import openai
from typing import Dict, List, Optional
from config import OPENAI_API_KEY, GPT_MODEL, WHISPER_MODEL
import json
import re

# Initialize OpenAI client with new API format
client = openai.OpenAI(api_key=OPENAI_API_KEY)

class OpenAIService:
    """Service for OpenAI API interactions"""
    
    @staticmethod
    def transcribe_audio(audio_path: str) -> Dict:
        """Transcribe audio using Whisper with enhanced multilingual support"""
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model=WHISPER_MODEL,
                    file=audio_file,
                    language="auto",  # Let Whisper auto-detect language
                    response_format="verbose_json"  # Get more detailed response
                )
            
            # Extract language from response if available
            detected_language = transcript.get("language", "en")
            confidence = transcript.get("confidence", 0.95)
            
            return {
                "transcript": transcript["text"],
                "language": detected_language,
                "confidence": confidence,
                "detected_language": detected_language
            }
        except Exception as e:
            return {"error": str(e), "transcript": "", "language": "en", "confidence": 0.0}
    
    @staticmethod
    def translate_and_extract_field(text: str, field_name: str, field_help: str, source_language: str) -> Dict:
        """Translate user's voice input and extract field value with enhanced multilingual support"""
        
        # Enhanced language mapping with more Indian languages
        language_map = {
            "en": "English",
            "hi": "Hindi (हिन्दी)",
            "ta": "Tamil (தமிழ்)",
            "te": "Telugu (తెలుగు)",
            "mr": "Marathi (मराठी)",
            "bn": "Bengali (বাংলা)",
            "gu": "Gujarati (ગુજરાતી)",
            "kn": "Kannada (ಕನ್ನಡ)",
            "ml": "Malayalam (മലയാളം)",
            "pa": "Punjabi (ਪੰਜਾਬੀ)",
            "or": "Odia (ଓଡ଼ିଆ)",
            "as": "Assamese (অসমীয়া)",
            "ne": "Nepali (नेपाली)",
            "ur": "Urdu (اردو)",
            "en-US": "English",
            "hi-IN": "Hindi (हिन्दी)",
            "ta-IN": "Tamil (தமிழ்)",
            "te-IN": "Telugu (తెలుగు)",
            "mr-IN": "Marathi (मराठी)",
            "bn-IN": "Bengali (বাংলা)",
            "gu-IN": "Gujarati (ગુજરાતી)",
            "kn-IN": "Kannada (ಕನ್ನಡ)",
            "ml-IN": "Malayalam (മലയാളം)",
            "pa-IN": "Punjabi (ਪੰਜਾਬੀ)",
            "or-IN": "Odia (ଓଡ଼ିଆ)",
            "as-IN": "Assamese (অসমীয়া)",
            "ne-IN": "Nepali (नेपाली)",
            "ur-IN": "Urdu (اردو)"
        }
        
        source_lang = language_map.get(source_language, "English")
        
        # Enhanced prompt with better context understanding
        prompt = f"""You are an expert multilingual legal form assistant specializing in Indian languages and legal documentation.

USER SAID (in {source_lang}): "{text}"

FIELD: {field_name}
DESCRIPTION: {field_help}

TASK:
1. Detect the exact language spoken (even if it's a mix of languages)
2. Translate the user's response to clear English
3. Extract the relevant value for this specific field
4. Format it appropriately for legal documents:
   - Names: Proper capitalization, full names
   - Dates: YYYY-MM-DD format
   - Addresses: Complete with PIN code
   - Phone: +91 format
   - Numbers: Proper formatting
5. Handle mixed language inputs (e.g., Hindi-English mix)
6. Provide confidence score based on clarity

Return ONLY valid JSON:
{{
  "original_text": "{text}",
  "detected_language": "exact language detected",
  "translated_text": "clear English translation",
  "translated_value": "properly formatted value for the field",
  "confidence": 0.95,
  "is_mixed_language": true/false,
  "language_notes": "any special language considerations"
}}"""
        
        try:
            response = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a multilingual legal form assistant with expertise in Indian languages. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Lower temperature for more consistent results
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response to ensure valid JSON
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            return result
        except json.JSONDecodeError as json_err:
            # Fallback parsing if JSON is malformed
            try:
                # Try to extract JSON from the response
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
            except:
                pass
            return {
                "error": f"JSON parsing error: {str(json_err)}",
                "original_text": text,
                "translated_text": text,
                "translated_value": text,
                "confidence": 0.5
            }
        except Exception as e:
            return {
                "error": str(e),
                "original_text": text,
                "translated_text": text,
                "translated_value": text,
                "confidence": 0.3
            }
    
    @staticmethod
    def interpret_form(form_id: str, transcript: str, form_schema: Dict) -> Dict:
        """Use GPT-4 to interpret transcript and fill form fields with enhanced multilingual support"""
        
        # Build detailed field list for prompt
        fields_description = "\n".join([
            f"- {field['id']} ({field['type']}): {field.get('help', '')} {'[REQUIRED]' if field.get('required', False) else '[OPTIONAL]'}"
            for field in form_schema.get('fields', [])
        ])
        
        prompt = f"""You are an expert multilingual legal form assistant specializing in Indian legal documentation. Extract and interpret information from the transcript to fill form fields.

FORM: {form_id}
AVAILABLE FIELDS:
{fields_description}

USER TRANSCRIPT: "{transcript}"

TASK:
1. Detect the primary language spoken (English, Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, etc.)
2. Extract values for each field from the transcript
3. Handle mixed language inputs (e.g., Hindi-English mix)
4. Format extracted data appropriately:
   - Names: Proper capitalization, full names
   - Dates: Convert to YYYY-MM-DD format
   - Addresses: Include PIN codes, proper formatting
   - Phone numbers: +91 format
   - Numbers: Proper formatting
5. If you cannot find a field value, leave it empty and add to "missing"
6. Provide confidence scores for each extracted field
7. Identify any ambiguous or unclear information

Return JSON in this exact format:
{{
  "form_id": "{form_id}",
  "detected_language": "primary language detected",
  "is_mixed_language": true/false,
  "filled": {{ "field_id": "properly formatted value" }},
  "missing": ["field_id", ...],
  "confidence": 0.85,
  "field_confidences": {{ "field_id": 0.9, ... }},
  "ambiguous_fields": ["field_id", ...],
  "language_notes": "any special language considerations"
}}"""
        
        try:
            response = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a multilingual legal form assistant with expertise in Indian languages and legal documentation. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1500
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response to ensure valid JSON
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            return result
        except json.JSONDecodeError as json_err:
            # Fallback parsing if JSON is malformed
            try:
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
            except:
                pass
            return {
                "error": f"JSON parsing error: {str(json_err)}",
                "form_id": form_id,
                "filled": {},
                "missing": [field['id'] for field in form_schema.get('fields', [])],
                "confidence": 0.3
            }
        except Exception as e:
            return {
                "error": str(e),
                "form_id": form_id,
                "filled": {},
                "missing": [field['id'] for field in form_schema.get('fields', [])],
                "confidence": 0.3
            }
    
    @staticmethod
    def validate_form_with_gpt(form_id: str, filled_data: Dict, form_schema: Dict) -> Dict:
        """Use GPT-4 to validate form data with enhanced legal validation"""
        
        # Get required fields from schema
        required_fields = [field['id'] for field in form_schema.get('fields', []) if field.get('required', False)]
        
        prompt = f"""You are an expert legal form validator specializing in Indian legal documentation. Validate this filled form data for legal correctness, completeness, and compliance.

FORM: {form_id}
FILLED DATA: {json.dumps(filled_data, indent=2)}

REQUIRED FIELDS: {required_fields}

VALIDATION CRITERIA:
1. **Required Fields**: All mandatory fields must be present and non-empty
2. **Data Format**: 
   - Names: Proper capitalization, no special characters
   - Dates: Valid YYYY-MM-DD format, reasonable dates
   - Phone: Valid Indian mobile format (+91 or 10 digits)
   - Email: Valid email format
   - Addresses: Complete with PIN code
   - Numbers: Valid numeric values where applicable
3. **Legal Context**: 
   - Names should be realistic and properly formatted
   - Dates should be logical (birth dates, marriage dates, etc.)
   - Addresses should be complete and valid
   - Phone numbers should be valid Indian numbers
4. **Consistency**: 
   - Related fields should be consistent (e.g., age and birth date)
   - No contradictory information
5. **Completeness**: 
   - All required fields filled
   - No obviously incomplete data

Return JSON:
{{
  "valid": true/false,
  "errors": [{{"field": "field_id", "message": "specific error message", "severity": "error"}}],
  "warnings": [{{"field": "field_id", "message": "warning message", "severity": "warning"}}],
  "suggestions": [{{"field": "field_id", "message": "improvement suggestion", "severity": "info"}}],
  "missing_required": ["field_id", ...],
  "validation_score": 0.85,
  "legal_compliance": "compliant/needs_review/non_compliant"
}}"""
        
        try:
            response = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a legal form validator with expertise in Indian legal documentation. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response to ensure valid JSON
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            return result
        except json.JSONDecodeError as json_err:
            # Fallback parsing if JSON is malformed
            try:
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
            except:
                pass
            return {
                "error": f"JSON parsing error: {str(json_err)}",
                "valid": False,
                "errors": [{"field": "general", "message": "Validation service temporarily unavailable", "severity": "error"}],
                "warnings": [],
                "suggestions": [],
                "validation_score": 0.0
            }
        except Exception as e:
            return {
                "error": str(e),
                "valid": False,
                "errors": [{"field": "general", "message": f"Validation error: {str(e)}", "severity": "error"}],
                "warnings": [],
                "suggestions": [],
                "validation_score": 0.0
            }
    
    @staticmethod
    def generate_followup_questions(form_id: str, missing_fields: List[str], form_schema: Dict) -> Dict:
        """Generate follow-up questions for missing fields with multilingual support"""
        
        field_descriptions = {f['id']: f['help'] for f in form_schema.get('fields', [])}
        field_types = {f['id']: f['type'] for f in form_schema.get('fields', [])}
        
        prompt = f"""You are a multilingual legal form assistant. Generate short, clear voice questions for missing form fields that users can answer in 3-8 words.

MISSING FIELDS: {missing_fields}

FIELD DESCRIPTIONS:
{json.dumps(field_descriptions, indent=2)}

FIELD TYPES:
{json.dumps(field_types, indent=2)}

TASK:
1. Create one short, clear question per missing field
2. Questions should be easy to answer in 3-8 words
3. Make questions natural and conversational
4. Consider the field type (text, number, date, etc.)
5. Generate questions in multiple Indian languages for better accessibility
6. Prioritize the most important missing fields first

Return JSON:
{{
  "questions": [
    {{
      "field": "field_id",
      "question": "Short English question?",
      "question_hindi": "हिंदी में प्रश्न?",
      "question_tamil": "தமிழில் கேள்வி?",
      "question_telugu": "తెలుగులో ప్రశ్న?",
      "priority": 1,
      "field_type": "text",
      "expected_length": "3-8 words"
    }}
  ],
  "total_missing": {len(missing_fields)},
  "priority_order": ["field_id", ...]
}}"""
        
        try:
            response = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a multilingual legal form assistant. Generate short, clear voice questions. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=800
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response to ensure valid JSON
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            return result
        except json.JSONDecodeError as json_err:
            # Fallback parsing if JSON is malformed
            try:
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
            except:
                pass
            return {
                "error": f"JSON parsing error: {str(json_err)}",
                "questions": [{"field": field, "question": f"What is your {field.replace('_', ' ')}?"} for field in missing_fields],
                "total_missing": len(missing_fields)
            }
        except Exception as e:
            return {
                "error": str(e),
                "questions": [{"field": field, "question": f"What is your {field.replace('_', ' ')}?"} for field in missing_fields],
                "total_missing": len(missing_fields)
            }
    
    @staticmethod
    def detect_language(text: str) -> Dict:
        """Detect the primary language of the input text"""
        prompt = f"""Detect the primary language of this text and provide language information.

TEXT: "{text}"

IMPORTANT LANGUAGE DETECTION RULES:
1. ENGLISH (en): Contains only English letters (a-z, A-Z) and common English words
2. HINDI (hi): Contains Devanagari characters (अ-ह) or Hindi words
3. TAMIL (ta): Contains Tamil characters (அ-ஹ) or Tamil words
4. TELUGU (te): Contains Telugu characters (అ-హ) or Telugu words
5. BENGALI (bn): Contains Bengali characters (অ-হ) or Bengali words
6. GUJARATI (gu): Contains Gujarati characters (અ-હ) or Gujarati words
7. KANNADA (kn): Contains Kannada characters (ಅ-ಹ) or Kannada words
8. MALAYALAM (ml): Contains Malayalam characters (അ-ഹ) or Malayalam words
9. PUNJABI (pa): Contains Punjabi characters (ਅ-ਹ) or Punjabi words
10. MARATHI (mr): Contains Marathi characters (अ-ह) or Marathi words

CHARACTER VALIDATION:
- Hindi/Marathi: अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह
- Tamil: அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநபமயரலவஶஷஸஹ
- Telugu: అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహ
- Bengali: অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলবশষসহ
- Gujarati: અઆઇઈઉઊઋએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહ
- Kannada: ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹ೦೧೨೩೪೫೬೭೮೯
- Malayalam: അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരലവശഷസഹ
- Punjabi: ਅਆਇਈਉਊ਋ਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸ਼਷ਸਹ

DETECTION PRIORITY:
1. Check for specific language characters first
2. If no specific characters found, check for common words
3. If mixed language, detect the primary language
4. Default to English only if no other language detected

Return JSON:
{{
  "primary_language": "language name",
  "language_code": "language_code",
  "confidence": 0.95,
  "is_mixed_language": true/false,
  "detected_languages": ["language1", "language2"],
  "language_notes": "any special considerations"
}}"""
        
        try:
            response = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a language detection expert. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=200
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            return result
        except Exception as e:
            return {
                "error": str(e),
                "primary_language": "English",
                "language_code": "en",
                "confidence": 0.5,
                "is_mixed_language": False
            }
    
    @staticmethod
    def translate_text(text: str, target_language: str = "en") -> Dict:
        """Translate text to target language"""
        prompt = f"""Translate this text to {target_language}. Maintain the original meaning and context.

TEXT: "{text}"
TARGET LANGUAGE: {target_language}

Return JSON:
{{
  "original_text": "{text}",
  "translated_text": "translated text",
  "target_language": "{target_language}",
  "confidence": 0.95
}}"""
        
        try:
            response = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a professional translator. Always return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean up the response
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            result = json.loads(result_text)
            return result
        except Exception as e:
            return {
                "error": str(e),
                "original_text": text,
                "translated_text": text,
                "target_language": target_language,
                "confidence": 0.3
            }

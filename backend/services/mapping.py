import re

def map_transcript_to_form(form: dict, transcript: str) -> dict:
    """
    Map transcript text to form fields using keyword matching.
    """
    filled = {field['id']: "" for field in form['fields']}
    
    # Simple keyword-based mapping
    keywords_map = {
        'full_name': ['name is', 'my name', 'i am'],
        'old_name': ['old name', 'previous name', 'was'],
        'reason': ['reason', 'because', 'want to change'],
        'phone': [r'\d{10}', r'\+91\d{10}'],
        'property_address': ['address', 'property', 'located'],
        'dispute_type': ['dispute', 'boundary', 'ownership'],
        'claimant_name': ['name is', 'my name', 'i am'],
        'petitioner_name': ['name is', 'my name', 'i am'],
        'spouse_name': ['spouse', 'husband', 'wife'],
        'marriage_date': [r'\d{1,2}[/-]\d{1,2}[/-]\d{4}', r'\d{4}'],
        'grounds': ['grounds', 'reason', 'because'],
    }
    
    transcript_lower = transcript.lower()
    
    for field_id, keywords in keywords_map.items():
        for keyword in keywords:
            if re.search(keyword, transcript_lower):
                # Extract text after keyword
                match = re.search(f"{keyword}\\s+([^,.!?]*)", transcript_lower)
                if match:
                    filled[field_id] = match.group(1).strip()
                    break
    
    return filled

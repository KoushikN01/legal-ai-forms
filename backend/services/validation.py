import re

def validate_form_data(form: dict, data: dict) -> list:
    """
    Validate form data against field requirements.
    Returns list of validation errors.
    """
    errors = []
    
    for field in form['fields']:
        field_id = field['id']
        value = data.get(field_id, "").strip()
        
        # Check required fields
        if field['required'] and not value:
            errors.append({
                "field_id": field_id,
                "message": f"{field['label']} is required"
            })
            continue
        
        if not value:
            continue
        
        # Type-specific validation
        if field['type'] == 'tel':
            if not re.match(r'^[6-9]\d{9}$', value.replace('+91', '')):
                errors.append({
                    "field_id": field_id,
                    "message": "Invalid phone number format"
                })
        
        elif field['type'] == 'date':
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', value):
                errors.append({
                    "field_id": field_id,
                    "message": "Invalid date format (use YYYY-MM-DD)"
                })
        
        elif field['type'] == 'text':
            if len(value) < 3:
                errors.append({
                    "field_id": field_id,
                    "message": f"{field['label']} must be at least 3 characters"
                })
    
    return errors

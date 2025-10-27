#!/usr/bin/env python3
"""
Analyze form requirements from the actual form schemas
"""

import json
import sys
import os

# Add the parent directory to the path to import form schemas
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def analyze_form_requirements():
    """Analyze the actual form requirements"""
    print("📋 Analyzing Form Requirements")
    print("=" * 60)
    
    # Form requirements based on the actual schemas
    form_requirements = {
        "name_change": {
            "required_fields": [
                "applicant_full_name",
                "applicant_age", 
                "applicant_father_name",
                "current_address",
                "previous_name",
                "new_name",
                "reason",
                "date_of_declaration",
                "place",
                "id_proof_type",
                "id_proof_number"
            ],
            "optional_fields": [],
            "total_required": 11
        },
        "property_dispute_simple": {
            "required_fields": [
                "plaintiff_name",
                "plaintiff_address",
                "defendant_name", 
                "defendant_address",
                "property_description",
                "nature_of_claim",
                "value_of_claim",
                "facts_of_case",
                "relief_sought",
                "verification_declaration"
            ],
            "optional_fields": ["date_of_incident", "evidence_list"],
            "total_required": 10
        },
        "traffic_fine_appeal": {
            "required_fields": [
                "appellant_name",
                "appellant_address",
                "challan_number",
                "vehicle_number",
                "date_of_challan",
                "offence_details",
                "explanation"
            ],
            "optional_fields": ["police_station", "attachments"],
            "total_required": 7
        },
        "mutual_divorce_petition": {
            "required_fields": [
                "husband_full_name",
                "wife_full_name",
                "marriage_date",
                "marriage_place",
                "residential_address_husband",
                "residential_address_wife",
                "reason_for_divorce",
                "mutual_agreement",
                "date_of_affidavit",
                "attachments"
            ],
            "optional_fields": ["children", "maintenance_terms"],
            "total_required": 10
        },
        "affidavit_general": {
            "required_fields": [
                "deponent_name",
                "deponent_age",
                "deponent_address",
                "statement_text",
                "place_of_sworn",
                "date_of_sworn"
            ],
            "optional_fields": ["notary_name", "attachments"],
            "total_required": 6
        }
    }
    
    print("📊 Form Requirements Analysis:")
    print("-" * 60)
    
    for form_id, requirements in form_requirements.items():
        print(f"\n📝 {form_id.upper().replace('_', ' ')}")
        print(f"   Required Fields: {requirements['total_required']}")
        print(f"   Optional Fields: {len(requirements['optional_fields'])}")
        print(f"   Total Fields: {requirements['total_required'] + len(requirements['optional_fields'])}")
        
        print("   Required:")
        for field in requirements['required_fields']:
            print(f"     - {field}")
        
        if requirements['optional_fields']:
            print("   Optional:")
            for field in requirements['optional_fields']:
                print(f"     - {field}")
    
    print("\n🎯 Key Findings:")
    print("-" * 60)
    print("❌ Current AI forms only ask for 3 fields")
    print("✅ Actual forms require 6-11 fields each")
    print("🔧 Need to update AI to ask for ALL required fields")
    print("📋 Each form has different requirements")
    
    print("\n🔧 Required Updates:")
    print("-" * 60)
    print("1. Update smart_form_ai.py with correct field requirements")
    print("2. Add back button functionality")
    print("3. Ensure AI asks for ALL required fields")
    print("4. Match manual form requirements exactly")
    
    return form_requirements

if __name__ == "__main__":
    analyze_form_requirements()

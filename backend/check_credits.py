#!/usr/bin/env python3
"""
Check OpenAI API credits and functionality
"""

import openai
import os
from dotenv import load_dotenv

load_dotenv()

# Get API key from environment
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY environment variable not set")
    exit(1)

print("🔍 Checking OpenAI API Credits and Access...")
print("=" * 50)
print(f"API Key: {api_key[:20]}...")

try:
    # Initialize client
    client = openai.OpenAI(api_key=api_key)
    print("✅ Client initialized successfully")
    
    # Test 1: Basic GPT-3.5 access
    print("\n🧪 Test 1: Basic GPT-3.5 Access")
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'API working'"}],
        max_tokens=10
    )
    print(f"✅ GPT-3.5 Response: {response.choices[0].message.content}")
    
    # Test 2: GPT-4 access
    print("\n🧪 Test 2: GPT-4 Access")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Say 'GPT-4 working'"}],
        max_tokens=10
    )
    print(f"✅ GPT-4 Response: {response.choices[0].message.content}")
    
    # Test 3: Multilingual test
    print("\n🧪 Test 3: Multilingual Support")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a multilingual assistant. Respond in the same language as the user."},
            {"role": "user", "content": "नमस्ते, मेरा नाम राम है"}
        ],
        max_tokens=20
    )
    print(f"✅ Multilingual Response: {response.choices[0].message.content}")
    
    # Test 4: Legal form validation
    print("\n🧪 Test 4: Legal Form Validation")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a legal form validator. Return only JSON."},
            {"role": "user", "content": 'Validate this data: {"name": "John Doe", "age": "25", "phone": "9876543210"}. Return JSON with validation results.'}
        ],
        max_tokens=100
    )
    print(f"✅ Legal Validation Response: {response.choices[0].message.content}")
    
    print("\n🎉 All tests passed! Your OpenAI credits are working perfectly!")
    print("✅ GPT-3.5: Working")
    print("✅ GPT-4: Working") 
    print("✅ Multilingual: Working")
    print("✅ Legal Validation: Working")
    
except Exception as e:
    print(f"❌ Error: {e}")
    
    if "quota" in str(e).lower() or "insufficient" in str(e).lower():
        print("\n💳 Credits Issue:")
        print("- Your API key is valid but has insufficient credits")
        print("- Please add credits to your OpenAI account")
        print("- Visit: https://platform.openai.com/account/billing")
    elif "invalid" in str(e).lower():
        print("\n🔑 API Key Issue:")
        print("- Your API key might be invalid or expired")
        print("- Please check your API key in the OpenAI dashboard")
    else:
        print(f"\n🔧 Technical Issue: {e}")
        print("- This might be a network or configuration issue")


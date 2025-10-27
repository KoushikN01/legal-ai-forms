#!/usr/bin/env python3
"""
Test your OpenAI API key with credits
"""

import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get your API key
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("❌ No API key found in environment variables!")
    print("Please create a .env file with: OPENAI_API_KEY=your_key_here")
    exit(1)

print(f"🔑 Testing API Key: {api_key[:20]}...")
print("=" * 50)

try:
    # Initialize OpenAI client
    client = openai.OpenAI(api_key=api_key)
    print("✅ OpenAI client initialized successfully")
    
    # Test 1: Basic GPT-3.5 access (cheaper)
    print("\n🧪 Test 1: Basic GPT-3.5 Access")
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'API working'"}],
        max_tokens=10
    )
    print(f"✅ GPT-3.5 Response: {response.choices[0].message.content}")
    
    # Test 2: GPT-4 access (if you have access)
    print("\n🧪 Test 2: GPT-4 Access")
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": "Say 'GPT-4 working'"}],
            max_tokens=10
        )
        print(f"✅ GPT-4 Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"⚠️ GPT-4 not available: {str(e)}")
    
    # Test 3: Multilingual test (for your legal app)
    print("\n🧪 Test 3: Multilingual Support")
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a multilingual assistant. Respond in the same language as the user."},
            {"role": "user", "content": "नमस्ते, मेरा नाम राम है"}
        ],
        max_tokens=20
    )
    print(f"✅ Multilingual Response: {response.choices[0].message.content}")
    
    # Test 4: Legal form validation test
    print("\n🧪 Test 4: Legal Form Processing")
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a legal form assistant. Extract information from user input."},
            {"role": "user", "content": "My name is John Doe, I am 30 years old, and I live at 123 Main Street, New York."}
        ],
        max_tokens=50
    )
    print(f"✅ Legal Processing Response: {response.choices[0].message.content}")
    
    print("\n🎉 All tests passed! Your API key is working correctly!")
    print("You can now use your legal voice application with real OpenAI integration.")
    
except Exception as e:
    print(f"❌ API Error: {str(e)}")
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. Insufficient credits")
    print("3. Model access restrictions")
    print("4. Network connectivity issues")
    print("\nPlease check your API key and credits at: https://platform.openai.com/account/api-keys")

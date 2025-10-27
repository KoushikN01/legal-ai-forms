#!/usr/bin/env python3
"""
Simple test for OpenAI API
"""

import openai
import os

# Get API key from environment
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY environment variable not set")
    exit(1)

print(f"Testing with API Key: {api_key[:20]}...")

try:
    # Simple test
    client = openai.OpenAI(api_key=api_key)
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'Hello World'"}],
        max_tokens=10
    )
    
    print("✅ Success!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Error type: {type(e)}")


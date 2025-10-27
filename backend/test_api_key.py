#!/usr/bin/env python3
"""
Simple test to verify OpenAI API key and model access
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

print(f"Testing API Key: {api_key[:20]}...")

# Set the API key
openai.api_key = api_key

try:
    # Initialize client
    client = openai.OpenAI(api_key=api_key)
    
    # Test with a simple completion
    print("Testing basic API access...")
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # Use a more basic model first
        messages=[
            {"role": "user", "content": "Hello, respond with 'API working'"}
        ],
        max_tokens=10
    )
    
    print("✅ Basic API access successful!")
    print(f"Response: {response.choices[0].message.content}")
    
    # Test with GPT-4
    print("\nTesting GPT-4 access...")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": "Hello, respond with 'GPT-4 working'"}
        ],
        max_tokens=10
    )
    
    print("✅ GPT-4 access successful!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ API Error: {str(e)}")
    print("This might be due to:")
    print("1. Invalid API key")
    print("2. Insufficient credits")
    print("3. Model access restrictions")
    print("4. Network connectivity issues")

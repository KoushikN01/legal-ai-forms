#!/usr/bin/env python3
"""
Test OpenAI API with explicit configuration
"""

import openai
import os

# Clear any proxy environment variables
for key in list(os.environ.keys()):
    if 'proxy' in key.lower():
        del os.environ[key]

# Get API key from environment
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY environment variable not set")
    exit(1)

try:
    # Create client with explicit configuration
    client = openai.OpenAI(
        api_key=api_key,
        http_client=None  # Use default HTTP client
    )
    
    print("✅ Client created successfully")
    
    # Test API call
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'Hello World'"}],
        max_tokens=10
    )
    
    print("✅ API call successful!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Error type: {type(e)}")
    
    # Try alternative approach
    try:
        print("\nTrying alternative approach...")
        import httpx
        
        # Create custom HTTP client
        http_client = httpx.Client()
        client = openai.OpenAI(
            api_key=api_key,
            http_client=http_client
        )
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'Hello World'"}],
            max_tokens=10
        )
        
        print("✅ Alternative approach successful!")
        print(f"Response: {response.choices[0].message.content}")
        
    except Exception as e2:
        print(f"❌ Alternative approach also failed: {e2}")


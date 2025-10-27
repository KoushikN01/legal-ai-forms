#!/usr/bin/env python3
"""
Start the Legal Voice Application with OpenAI integration
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if API key is set
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY not found in environment variables!")
    print("Please create a .env file with your API key.")
    sys.exit(1)

print(f"🔑 Using API Key: {api_key[:20]}...")
print("🚀 Starting Legal Voice Application...")
print("=" * 50)

# Import and start the app
try:
    from app import app
    import uvicorn
    
    print("✅ Application loaded successfully!")
    print("🌐 Starting server on http://localhost:8000")
    print("📱 Frontend should be running on http://localhost:3000")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    
except Exception as e:
    print(f"❌ Error starting application: {str(e)}")
    print("Please check your configuration and try again.")

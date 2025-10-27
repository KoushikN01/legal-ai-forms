#!/usr/bin/env python3
"""
Backend startup script with proper configuration
"""
import os
import sys

# Set environment variables for testing
os.environ["DB_TYPE"] = "mongodb"  # Use MongoDB database
os.environ["DEBUG"] = "True"
os.environ["JWT_SECRET"] = "your-super-secret-jwt-key-change-in-production"
os.environ["ADMIN_EMAIL"] = "rahul5g4g3g@gmail.com"
os.environ["FRONTEND_URL"] = "http://localhost:3000"

# Add backend to path
sys.path.append('backend')

if __name__ == "__main__":
    print("🚀 Starting Legal Voice Backend...")
    print("📊 Database: MongoDB")
    print("🔧 Debug: Enabled")
    print("🌐 Frontend URL: http://localhost:3000")
    print("=" * 50)
    
    try:
        # Import and run the app
        from backend.app import app
        import uvicorn
        
        print("✅ Backend started successfully!")
        print("🔗 API available at: http://localhost:8000")
        print("📖 API docs at: http://localhost:8000/docs")
        print("\nPress Ctrl+C to stop the server")
        
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you have all dependencies installed:")
        print("   pip install fastapi uvicorn python-dotenv")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        print("💡 Check if port 8000 is available")

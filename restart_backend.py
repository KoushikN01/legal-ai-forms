#!/usr/bin/env python3
"""
Restart backend with proper configuration
"""
import os
import sys
import subprocess
import time

def restart_backend():
    """Restart the backend server"""
    print("🔄 Restarting Backend Server...")
    print("=" * 40)
    
    # Set environment variables
    os.environ["DB_TYPE"] = "mongodb"  # Use MongoDB
    os.environ["DEBUG"] = "True"
    os.environ["JWT_SECRET"] = "your-super-secret-jwt-key-change-in-production"
    os.environ["ADMIN_EMAIL"] = "rahul5g4g3g@gmail.com"
    os.environ["FRONTEND_URL"] = "http://localhost:3000"
    
    print("📊 Database: MongoDB")
    print("🔧 Debug: Enabled")
    print("🌐 Frontend URL: http://localhost:3000")
    print("=" * 40)
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        # Start the backend server
        print("🚀 Starting backend server...")
        print("💡 Press Ctrl+C to stop the server")
        print("🔗 API available at: http://localhost:8000")
        print("📖 API docs at: http://localhost:8000/docs")
        print("=" * 40)
        
        # Run the app
        subprocess.run([sys.executable, "app.py"])
        
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    restart_backend()

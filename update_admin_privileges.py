#!/usr/bin/env python3
"""
Update admin user privileges
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set database type
os.environ["DB_TYPE"] = "mongodb"

try:
    import sys
    sys.path.append('backend')
    from database import DatabaseService
    print("✅ Database Service loaded successfully!")
except Exception as e:
    print(f"❌ Error loading Database Service: {e}")
    sys.exit(1)

def update_admin_privileges():
    """Update admin user privileges"""
    
    print("🔧 Updating admin privileges...")
    
    # Get admin user by email
    admin_user = DatabaseService.get_user_by_email("admin@example.com")
    
    if admin_user:
        print(f"✅ Found admin user: {admin_user['email']}")
        print(f"User ID: {admin_user['user_id']}")
        
        # Update user to have admin privileges
        updates = {
            "is_admin": True,
            "admin": True,
            "role": "admin"
        }
        
        result = DatabaseService.update_user(admin_user["user_id"], updates)
        print(f"✅ Admin privileges updated: {result}")
        
        # Verify the update
        updated_user = DatabaseService.get_user(admin_user["user_id"])
        print(f"✅ Updated user: {updated_user}")
        
    else:
        print("❌ Admin user not found")

if __name__ == "__main__":
    update_admin_privileges()

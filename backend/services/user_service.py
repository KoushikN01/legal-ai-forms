from database import DatabaseService
from services.auth_service import AuthService
from typing import Optional, Dict
import uuid
from datetime import datetime

class UserService:
    """Service for user management"""
    
    @staticmethod
    def create_user(email: str, password: str, phone: str, name: str) -> Dict:
        """Create new user"""
        user_id = str(uuid.uuid4())
        hashed_password = AuthService.hash_password(password)
        
        user = {
            "user_id": user_id,
            "email": email,
            "password": hashed_password,
            "phone": phone,
            "name": name,
            "created_at": datetime.now().isoformat(),
            "verified": False,
            "language": "en"
        }
        
        # Save to database
        DatabaseService.save_user(user)
        
        return {
            "user_id": user_id,
            "email": email,
            "name": name
        }
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[Dict]:
        """Authenticate user with email and password"""
        user = DatabaseService.get_user_by_email(email)
        
        if not user:
            return None
        
        if not AuthService.verify_password(password, user["password"]):
            return None
        
        token = AuthService.create_token(user["user_id"], user["email"])
        
        return {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "token": token
        }
    
    @staticmethod
    def get_user(user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        return DatabaseService.get_user(user_id)
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Get user by email"""
        return DatabaseService.get_user_by_email(email)
    
    @staticmethod
    def update_user(user_id: str, updates: Dict) -> Dict:
        """Update user information"""
        return DatabaseService.update_user(user_id, updates)
    
    @staticmethod
    def create_or_update_google_user(google_id: str, email: str, name: str, picture: str = None) -> Dict:
        """Create or update user from Google OAuth"""
        # Check if user exists by email
        existing_user = DatabaseService.get_user_by_email(email)
        
        if existing_user:
            # Update existing user with Google info
            updates = {
                "google_id": google_id,
                "picture": picture,
                "verified": True
            }
            DatabaseService.update_user(existing_user["user_id"], updates)
            return existing_user
        
        # Create new user
        user_id = str(uuid.uuid4())
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "google_id": google_id,
            "picture": picture,
            "created_at": datetime.now().isoformat(),
            "verified": True,
            "language": "en",
            "login_method": "google"
        }
        
        # Save to database
        DatabaseService.save_user(user)
        
        return {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture
        }

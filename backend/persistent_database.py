"""
Persistent file-based database for Legal Voice App
Stores data in JSON files for persistence across sessions
"""

import json
import os
from typing import Optional, Dict, List
from datetime import datetime
from pathlib import Path

class PersistentDatabase:
    """File-based persistent database"""
    
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # File paths
        self.submissions_file = self.data_dir / "submissions.json"
        self.users_file = self.data_dir / "users.json"
        self.forms_file = self.data_dir / "forms.json"
        
        # Initialize files if they don't exist
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialize JSON files if they don't exist"""
        if not self.submissions_file.exists():
            with open(self.submissions_file, 'w', encoding='utf-8') as f:
                json.dump({}, f)
        
        if not self.users_file.exists():
            with open(self.users_file, 'w', encoding='utf-8') as f:
                json.dump({}, f)
        
        if not self.forms_file.exists():
            with open(self.forms_file, 'w', encoding='utf-8') as f:
                json.dump({}, f)
    
    def _load_data(self, file_path: Path) -> dict:
        """Load data from JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_data(self, file_path: Path, data: dict):
        """Save data to JSON file"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def save_submission(self, tracking_id: str, form_id: str, data: dict, user_id: str = None, status: str = "submitted"):
        """Save submission to persistent storage"""
        submissions = self._load_data(self.submissions_file)
        
        submission = {
            "tracking_id": tracking_id,
            "form_id": form_id,
            "data": data,
            "user_id": user_id,
            "status": status,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "history": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "message": "Form submitted successfully"
                }
            ]
        }
        
        submissions[tracking_id] = submission
        self._save_data(self.submissions_file, submissions)
        
        print(f"[PERSISTENT DB] Saved submission: {tracking_id}")
        return submission
    
    def get_submission(self, tracking_id: str) -> Optional[dict]:
        """Get submission by tracking ID"""
        submissions = self._load_data(self.submissions_file)
        return submissions.get(tracking_id)
    
    def update_submission_status(self, tracking_id: str, status: str, message: str):
        """Update submission status"""
        submissions = self._load_data(self.submissions_file)
        
        if tracking_id not in submissions:
            return None
        
        submissions[tracking_id]["status"] = status
        submissions[tracking_id]["updated_at"] = datetime.now().isoformat()
        submissions[tracking_id]["history"].append({
            "timestamp": datetime.now().isoformat(),
            "message": message
        })
        
        self._save_data(self.submissions_file, submissions)
        return submissions[tracking_id]
    
    def get_all_submissions(self, form_id: Optional[str] = None, status: Optional[str] = None) -> List[dict]:
        """Get all submissions with optional filters"""
        submissions = self._load_data(self.submissions_file)
        results = list(submissions.values())
        
        if form_id:
            results = [r for r in results if r.get("form_id") == form_id]
        if status:
            results = [r for r in results if r.get("status") == status]
        
        return results
    
    def get_user_submissions(self, user_id: str) -> List[dict]:
        """Get all submissions for a specific user"""
        submissions = self._load_data(self.submissions_file)
        return [s for s in submissions.values() if s.get("user_id") == user_id]
    
    def save_user(self, user: dict):
        """Save user to persistent storage"""
        users = self._load_data(self.users_file)
        users[user["user_id"]] = user
        self._save_data(self.users_file, users)
        print(f"[PERSISTENT DB] Saved user: {user['user_id']}")
    
    def get_user(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        users = self._load_data(self.users_file)
        return users.get(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        users = self._load_data(self.users_file)
        for user in users.values():
            if user.get("email") == email:
                return user
        return None
    
    def update_user(self, user_id: str, updates: dict) -> Optional[dict]:
        """Update user information"""
        users = self._load_data(self.users_file)
        
        if user_id in users:
            users[user_id].update(updates)
            users[user_id]["updated_at"] = datetime.now().isoformat()
            self._save_data(self.users_file, users)
            return users[user_id]
        return None
    
    def get_all_users(self) -> List[dict]:
        """Get all users"""
        users = self._load_data(self.users_file)
        return list(users.values())
    
    def save_form(self, form_id: str, form_data: dict):
        """Save form template"""
        forms = self._load_data(self.forms_file)
        forms[form_id] = form_data
        self._save_data(self.forms_file, forms)
        print(f"[PERSISTENT DB] Saved form: {form_id}")
    
    def get_form(self, form_id: str) -> Optional[dict]:
        """Get form template"""
        forms = self._load_data(self.forms_file)
        return forms.get(form_id)
    
    def get_all_forms(self) -> List[dict]:
        """Get all form templates"""
        forms = self._load_data(self.forms_file)
        return list(forms.values())

# Global instance
persistent_db = PersistentDatabase()

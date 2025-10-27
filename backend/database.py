"""
Database connection and models for Legal Voice App
Supports MongoDB and PostgreSQL
"""

import os
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum

# Database type from environment
DB_TYPE = os.getenv("DB_TYPE", "mongodb")  # Options: mock, mongodb, postgresql, persistent

# ============ MongoDB Setup ============
if DB_TYPE == "mongodb":
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure
    
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    
    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command('ping')
        db = mongo_client.legal_voice
        submissions_collection = db.submissions
        forms_collection = db.forms
        users_collection = db.users  # Add users collection
        print("[DB] Connected to MongoDB")
    except ConnectionFailure:
        print("[DB] MongoDB connection failed - using mock database")
        DB_TYPE = "mock"

# ============ PostgreSQL Setup ============
elif DB_TYPE == "postgresql":
    from sqlalchemy import create_engine, Column, String, DateTime, JSON
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/legal_voice")
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    class SubmissionModel(Base):
        __tablename__ = "submissions"
        
        tracking_id = Column(String, primary_key=True)
        form_id = Column(String)
        data = Column(JSON)
        user_id = Column(String)  # Added user_id field
        status = Column(String)
        created_at = Column(DateTime)
        history = Column(JSON)
    
    Base.metadata.create_all(bind=engine)
    print("[DB] Connected to PostgreSQL")

# ============ Persistent Database ============
elif DB_TYPE == "persistent":
    from persistent_database import persistent_db
    print("[DB] Using persistent file-based database")

# ============ Mock Database (Default) ============
submissions_db = {}
forms_db = {}
users_db = {}  # Add users mock database

class SubmissionStatus(str, Enum):
    SUBMITTED = "submitted"
    PROCESSING = "processing"
    APPROVED = "approved"
    REJECTED = "rejected"

class DatabaseService:
    """Unified database service for all operations"""
    
    @staticmethod
    def save_submission(tracking_id: str, form_id: str, data: dict, user_id: str = None, status: str = "submitted"):
        """Save submission to database"""
        submission = {
            "tracking_id": tracking_id,
            "form_id": form_id,
            "data": data,
            "user_id": user_id,  # Added user_id field
            "status": status,
            "created_at": datetime.now().isoformat(),
            "history": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "message": "Form submitted successfully"
                }
            ]
        }
        
        if DB_TYPE == "mongodb":
            submissions_collection.insert_one(submission)
        elif DB_TYPE == "postgresql":
            db_session = SessionLocal()
            db_submission = SubmissionModel(
                tracking_id=tracking_id,
                form_id=form_id,
                data=data,
                user_id=user_id,  # Added user_id field
                status=status,
                created_at=datetime.now(),
                history=submission["history"]
            )
            db_session.add(db_submission)
            db_session.commit()
            db_session.close()
        elif DB_TYPE == "persistent":
            return persistent_db.save_submission(tracking_id, form_id, data, user_id, status)
        else:  # mock
            submissions_db[tracking_id] = submission
        
        return submission
    
    @staticmethod
    def get_submission(tracking_id: str) -> Optional[dict]:
        """Get submission by tracking ID"""
        if DB_TYPE == "mongodb":
            submission = submissions_collection.find_one({"tracking_id": tracking_id})
            if submission:
                submission_dict = dict(submission)
                if "_id" in submission_dict:
                    submission_dict["_id"] = str(submission_dict["_id"])
                return submission_dict
            return None
        elif DB_TYPE == "postgresql":
            db_session = SessionLocal()
            result = db_session.query(SubmissionModel).filter(
                SubmissionModel.tracking_id == tracking_id
            ).first()
            db_session.close()
            if result:
                return {
                    "tracking_id": result.tracking_id,
                    "form_id": result.form_id,
                    "data": result.data,
                    "user_id": result.user_id,  # Added user_id field
                    "status": result.status,
                    "created_at": result.created_at.isoformat(),
                    "history": result.history
                }
            return None
        elif DB_TYPE == "persistent":
            return persistent_db.get_submission(tracking_id)
        else:  # mock
            return submissions_db.get(tracking_id)
    
    @staticmethod
    def update_submission_status(tracking_id: str, status: str, message: str):
        """Update submission status"""
        submission = DatabaseService.get_submission(tracking_id)
        if not submission:
            return None
        
        submission["status"] = status
        submission["history"].append({
            "timestamp": datetime.now().isoformat(),
            "message": message
        })
        
        if DB_TYPE == "mongodb":
            submissions_collection.update_one(
                {"tracking_id": tracking_id},
                {"$set": {"status": status, "history": submission["history"]}}
            )
        elif DB_TYPE == "postgresql":
            db_session = SessionLocal()
            db_session.query(SubmissionModel).filter(
                SubmissionModel.tracking_id == tracking_id
            ).update({"status": status, "history": submission["history"]})
            db_session.commit()
            db_session.close()
        else:  # mock
            submissions_db[tracking_id] = submission
        
        return submission
    
    @staticmethod
    def get_all_submissions(form_id: Optional[str] = None, status: Optional[str] = None) -> List[dict]:
        """Get all submissions with optional filters"""
        if DB_TYPE == "mongodb":
            query = {}
            if form_id:
                query["form_id"] = form_id
            if status:
                query["status"] = status
            submissions = submissions_collection.find(query)
            # Convert ObjectId to string for JSON serialization
            result = []
            for submission in submissions:
                submission_dict = dict(submission)
                if "_id" in submission_dict:
                    submission_dict["_id"] = str(submission_dict["_id"])
                result.append(submission_dict)
            return result
        elif DB_TYPE == "postgresql":
            db_session = SessionLocal()
            query = db_session.query(SubmissionModel)
            if form_id:
                query = query.filter(SubmissionModel.form_id == form_id)
            if status:
                query = query.filter(SubmissionModel.status == status)
            results = query.all()
            db_session.close()
            return [
                {
                    "tracking_id": r.tracking_id,
                    "form_id": r.form_id,
                    "data": r.data,
                    "user_id": r.user_id,  # Added user_id field
                    "status": r.status,
                    "created_at": r.created_at.isoformat(),
                    "history": r.history
                }
                for r in results
            ]
        else:  # mock
            results = list(submissions_db.values())
            if form_id:
                results = [r for r in results if r["form_id"] == form_id]
            if status:
                results = [r for r in results if r["status"] == status]
            return results
    
    # ============ User Management Methods ============
    
    @staticmethod
    def save_user(user: dict):
        """Save user to database"""
        if DB_TYPE == "mongodb":
            # Check if user already exists
            existing_user = db.users.find_one({"user_id": user["user_id"]})
            if existing_user:
                # Update existing user
                db.users.update_one(
                    {"user_id": user["user_id"]},
                    {"$set": user}
                )
            else:
                # Insert new user
                db.users.insert_one(user)
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL user saving
            pass
        else:  # mock
            users_db[user["user_id"]] = user
    
    @staticmethod
    def get_user(user_id: str) -> Optional[dict]:
        """Get user by ID"""
        if DB_TYPE == "mongodb":
            user = db.users.find_one({"user_id": user_id})
            if user:
                user_dict = dict(user)
                if "_id" in user_dict:
                    user_dict["_id"] = str(user_dict["_id"])
                return user_dict
            return None
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL user retrieval
            pass
        else:  # mock
            return users_db.get(user_id)
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email"""
        if DB_TYPE == "mongodb":
            user = db.users.find_one({"email": email})
            if user:
                user_dict = dict(user)
                if "_id" in user_dict:
                    user_dict["_id"] = str(user_dict["_id"])
                return user_dict
            return None
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL user retrieval
            pass
        else:  # mock
            return next((u for u in users_db.values() if u["email"] == email), None)
    
    @staticmethod
    def update_user(user_id: str, updates: dict) -> dict:
        """Update user information"""
        if DB_TYPE == "mongodb":
            db.users.update_one(
                {"user_id": user_id},
                {"$set": updates}
            )
            user = db.users.find_one({"user_id": user_id})
            if user:
                user_dict = dict(user)
                if "_id" in user_dict:
                    user_dict["_id"] = str(user_dict["_id"])
                return user_dict
            return None
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL user update
            pass
        else:  # mock
            if user_id in users_db:
                users_db[user_id].update(updates)
                return users_db[user_id]
            return None
    
    # ============ Password Reset Token Methods ============
    
    @staticmethod
    def save_reset_token(email: str, token: str, expires_at: str):
        """Save password reset token"""
        reset_data = {
            "email": email,
            "token": token,
            "expires_at": expires_at,
            "created_at": datetime.now().isoformat(),
            "used": False
        }
        
        if DB_TYPE == "mongodb":
            try:
                # Remove any existing tokens for this email
                db.reset_tokens.delete_many({"email": email})
                # Insert new token
                db.reset_tokens.insert_one(reset_data)
            except Exception as e:
                print(f"[ERROR] Failed to save reset token: {e}")
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL reset token storage
            pass
        else:  # mock
            reset_tokens_db = getattr(DatabaseService, 'reset_tokens_db', {})
            reset_tokens_db[email] = reset_data
            DatabaseService.reset_tokens_db = reset_tokens_db
    
    @staticmethod
    def get_reset_token(token: str) -> Optional[dict]:
        """Get reset token by token string"""
        if DB_TYPE == "mongodb":
            try:
                reset_data = db.reset_tokens.find_one({"token": token, "used": False})
                if reset_data:
                    reset_dict = dict(reset_data)
                    if "_id" in reset_dict:
                        reset_dict["_id"] = str(reset_dict["_id"])
                    return reset_dict
                return None
            except Exception as e:
                print(f"[ERROR] Failed to get reset token: {e}")
                return None
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL reset token retrieval
            pass
        else:  # mock
            reset_tokens_db = getattr(DatabaseService, 'reset_tokens_db', {})
            for reset_data in reset_tokens_db.values():
                if reset_data["token"] == token and not reset_data["used"]:
                    return reset_data
            return None
    
    @staticmethod
    def mark_reset_token_used(token: str):
        """Mark reset token as used"""
        if DB_TYPE == "mongodb":
            db.reset_tokens.update_one(
                {"token": token},
                {"$set": {"used": True}}
            )
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL reset token update
            pass
        else:  # mock
            reset_tokens_db = getattr(DatabaseService, 'reset_tokens_db', {})
            for email, reset_data in reset_tokens_db.items():
                if reset_data["token"] == token:
                    reset_data["used"] = True
                    break
    
    @staticmethod
    def get_user_submissions(user_id: str) -> List[dict]:
        """Get all submissions for a specific user"""
        if DB_TYPE == "mongodb":
            submissions = submissions_collection.find({"user_id": user_id})
            # Convert ObjectId to string for JSON serialization
            result = []
            for submission in submissions:
                submission_dict = dict(submission)
                if "_id" in submission_dict:
                    submission_dict["_id"] = str(submission_dict["_id"])
                result.append(submission_dict)
            return result
        elif DB_TYPE == "postgresql":
            db_session = SessionLocal()
            results = db_session.query(SubmissionModel).filter(
                SubmissionModel.user_id == user_id
            ).all()
            db_session.close()
            return [
                {
                    "tracking_id": r.tracking_id,
                    "form_id": r.form_id,
                    "data": r.data,
                    "user_id": r.user_id,
                    "status": r.status,
                    "created_at": r.created_at.isoformat(),
                    "history": r.history
                }
                for r in results
            ]
        elif DB_TYPE == "persistent":
            return persistent_db.get_user_submissions(user_id)
        else:  # mock
            return [s for s in submissions_db.values() if s.get("user_id") == user_id]
    
    @staticmethod
    def get_all_users() -> List[dict]:
        """Get all users"""
        if DB_TYPE == "mongodb":
            users = db.users.find()
            # Convert ObjectId to string for JSON serialization
            result = []
            for user in users:
                user_dict = dict(user)
                if "_id" in user_dict:
                    user_dict["_id"] = str(user_dict["_id"])
                result.append(user_dict)
            return result
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL user retrieval
            return []
        else:  # mock
            return list(users_db.values())
    
    @staticmethod
    def save_user_profile(user_id: str, profile_data: dict) -> dict:
        """Save user profile data"""
        if DB_TYPE == "mongodb":
            db.users.update_one(
                {"user_id": user_id},
                {"$set": {"profile": profile_data, "updated_at": datetime.now().isoformat()}}
            )
            user = db.users.find_one({"user_id": user_id})
            if user:
                user_dict = dict(user)
                if "_id" in user_dict:
                    user_dict["_id"] = str(user_dict["_id"])
                return user_dict
            return None
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL profile saving
            pass
        else:  # mock
            if user_id in users_db:
                users_db[user_id]["profile"] = profile_data
                users_db[user_id]["updated_at"] = datetime.now().isoformat()
                return users_db[user_id]
            return None
    
    @staticmethod
    def save_user_settings(user_id: str, settings: dict) -> dict:
        """Save user settings"""
        if DB_TYPE == "mongodb":
            db.users.update_one(
                {"user_id": user_id},
                {"$set": {"settings": settings, "updated_at": datetime.now().isoformat()}}
            )
            user = db.users.find_one({"user_id": user_id})
            if user:
                user_dict = dict(user)
                if "_id" in user_dict:
                    user_dict["_id"] = str(user_dict["_id"])
                return user_dict
            return None
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL settings saving
            pass
        else:  # mock
            if user_id in users_db:
                users_db[user_id]["settings"] = settings
                users_db[user_id]["updated_at"] = datetime.now().isoformat()
                return users_db[user_id]
            return None
    
    @staticmethod
    def save_user_document(user_id: str, document_type: str, document_data: dict) -> dict:
        """Save user document (Aadhar, etc.)"""
        if DB_TYPE == "mongodb":
            # Create documents collection if it doesn't exist
            documents_collection = db.documents
            document = {
                "user_id": user_id,
                "document_type": document_type,
                "document_data": document_data,
                "uploaded_at": datetime.now().isoformat(),
                "status": "uploaded"
            }
            documents_collection.insert_one(document)
            # Convert ObjectId to string for JSON serialization
            document_dict = dict(document)
            if "_id" in document_dict:
                document_dict["_id"] = str(document_dict["_id"])
            return document_dict
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL document saving
            pass
        else:  # mock
            doc_id = f"doc_{user_id}_{document_type}_{datetime.now().timestamp()}"
            document = {
                "document_id": doc_id,
                "user_id": user_id,
                "document_type": document_type,
                "document_data": document_data,
                "uploaded_at": datetime.now().isoformat(),
                "status": "uploaded"
            }
            if "documents_db" not in globals():
                globals()["documents_db"] = {}
            globals()["documents_db"][doc_id] = document
            return document
    
    @staticmethod
    def get_user_documents(user_id: str) -> List[dict]:
        """Get all documents for a user"""
        if DB_TYPE == "mongodb":
            documents = db.documents.find({"user_id": user_id})
            result = []
            for doc in documents:
                doc_dict = dict(doc)
                if "_id" in doc_dict:
                    doc_dict["_id"] = str(doc_dict["_id"])
                result.append(doc_dict)
            return result
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL document retrieval
            return []
        else:  # mock
            if "documents_db" in globals():
                return [doc for doc in globals()["documents_db"].values() if doc["user_id"] == user_id]
            return []

    @staticmethod
    def delete_user_document(document_id: str, user_id: str) -> bool:
        """Delete user document"""
        from bson import ObjectId
        
        print(f"[DATABASE] Attempting to delete document_id: {document_id} for user_id: {user_id}")
        
        if DB_TYPE == "mongodb":
            try:
                # First, try to find the document to see what ID format it uses
                doc_by_id = db.documents.find_one({"user_id": user_id, "_id": ObjectId(document_id)})
                if doc_by_id:
                    print(f"[DATABASE] Found document by _id")
                    result = db.documents.delete_one({
                        "_id": ObjectId(document_id),
                        "user_id": user_id
                    })
                    print(f"[DATABASE] Deleted {result.deleted_count} document(s)")
                    return result.deleted_count > 0
                
                # Try as string
                doc_by_str = db.documents.find_one({"user_id": user_id, "_id": document_id})
                if doc_by_str:
                    print(f"[DATABASE] Found document by string _id")
                    result = db.documents.delete_one({
                        "_id": document_id,
                        "user_id": user_id
                    })
                    print(f"[DATABASE] Deleted {result.deleted_count} document(s)")
                    return result.deleted_count > 0
                
                # Fallback: try as document_id field
                result = db.documents.delete_one({
                    "document_id": document_id,
                    "user_id": user_id
                })
                print(f"[DATABASE] Tried by document_id field, deleted {result.deleted_count} document(s)")
                return result.deleted_count > 0
                
            except Exception as e:
                print(f"[ERROR] Error deleting document: {e}")
                import traceback
                traceback.print_exc()
                return False
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL document deletion
            return False
        else:  # mock
            if "documents_db" in globals():
                for key, doc in globals()["documents_db"].items():
                    if (doc.get("_id") == document_id or doc.get("document_id") == document_id) and doc.get("user_id") == user_id:
                        del globals()["documents_db"][key]
                        return True
            return False
    
    @staticmethod
    def get_submission_by_tracking_id(tracking_id: str) -> Optional[dict]:
        """Get submission by tracking ID (alias for get_submission)"""
        return DatabaseService.get_submission(tracking_id)
    
    # ============ Help Tickets Methods ============
    
    @staticmethod
    def save_help_ticket(ticket_id: str, user_id: str, subject: str, description: str, priority: str = "medium") -> dict:
        """Save help ticket to database"""
        ticket = {
            "ticket_id": ticket_id,
            "user_id": user_id,
            "subject": subject,
            "description": description,
            "priority": priority,
            "status": "open",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if DB_TYPE == "mongodb":
            tickets_collection = db.tickets
            tickets_collection.insert_one(ticket)
            return ticket
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL ticket saving
            pass
        else:  # mock
            if "tickets_db" not in globals():
                globals()["tickets_db"] = {}
            globals()["tickets_db"][ticket_id] = ticket
            return ticket
    
    @staticmethod
    def get_all_tickets() -> List[dict]:
        """Get all help tickets"""
        print(f"[DatabaseService] Getting all tickets, DB_TYPE: {DB_TYPE}")
        if DB_TYPE == "mongodb":
            try:
                tickets_collection = db.tickets
                tickets = tickets_collection.find().sort("created_at", -1)
                result = []
                for ticket in tickets:
                    ticket_dict = dict(ticket)
                    if "_id" in ticket_dict:
                        ticket_dict["_id"] = str(ticket_dict["_id"])
                    result.append(ticket_dict)
                print(f"[DatabaseService] Found {len(result)} tickets in MongoDB")
                return result
            except Exception as e:
                print(f"[DatabaseService] MongoDB error: {e}")
                return []
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL ticket retrieval
            return []
        else:  # mock
            if "tickets_db" not in globals():
                print("[DatabaseService] No tickets_db in globals, returning empty list")
                return []
            tickets = list(globals()["tickets_db"].values())
            print(f"[DatabaseService] Found {len(tickets)} tickets in mock DB")
            return tickets
    
    @staticmethod
    def update_ticket_status(ticket_id: str, status: str) -> bool:
        """Update ticket status"""
        if DB_TYPE == "mongodb":
            tickets_collection = db.tickets
            result = tickets_collection.update_one(
                {"ticket_id": ticket_id},
                {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
            )
            return result.modified_count > 0
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL ticket update
            return False
        else:  # mock
            if "tickets_db" in globals() and ticket_id in globals()["tickets_db"]:
                globals()["tickets_db"][ticket_id]["status"] = status
                globals()["tickets_db"][ticket_id]["updated_at"] = datetime.now().isoformat()
                return True
            return False
    
    # ============ Feedbacks Methods ============
    
    @staticmethod
    def save_feedback(feedback_id: str, user_id: str, feedback_type: str, message: str, rating: int = None) -> dict:
        """Save feedback to database"""
        feedback = {
            "feedback_id": feedback_id,
            "user_id": user_id,
            "feedback_type": feedback_type,
            "message": message,
            "rating": rating,
            "status": "new",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if DB_TYPE == "mongodb":
            feedbacks_collection = db.feedbacks
            feedbacks_collection.insert_one(feedback)
            return feedback
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL feedback saving
            pass
        else:  # mock
            if "feedbacks_db" not in globals():
                globals()["feedbacks_db"] = {}
            globals()["feedbacks_db"][feedback_id] = feedback
            return feedback
    
    @staticmethod
    def get_all_feedbacks() -> List[dict]:
        """Get all feedbacks"""
        print(f"[DatabaseService] Getting all feedbacks, DB_TYPE: {DB_TYPE}")
        if DB_TYPE == "mongodb":
            try:
                feedbacks_collection = db.feedbacks
                feedbacks = feedbacks_collection.find().sort("created_at", -1)
                result = []
                for feedback in feedbacks:
                    feedback_dict = dict(feedback)
                    if "_id" in feedback_dict:
                        feedback_dict["_id"] = str(feedback_dict["_id"])
                    result.append(feedback_dict)
                print(f"[DatabaseService] Found {len(result)} feedbacks in MongoDB")
                return result
            except Exception as e:
                print(f"[DatabaseService] MongoDB error: {e}")
                return []
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL feedback retrieval
            return []
        else:  # mock
            if "feedbacks_db" not in globals():
                print("[DatabaseService] No feedbacks_db in globals, returning empty list")
                return []
            feedbacks = list(globals()["feedbacks_db"].values())
            print(f"[DatabaseService] Found {len(feedbacks)} feedbacks in mock DB")
            return feedbacks
    
    @staticmethod
    def update_feedback_status(feedback_id: str, status: str) -> bool:
        """Update feedback status"""
        if DB_TYPE == "mongodb":
            feedbacks_collection = db.feedbacks
            result = feedbacks_collection.update_one(
                {"feedback_id": feedback_id},
                {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
            )
            return result.modified_count > 0
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL feedback update
            return False
        else:  # mock
            if "feedbacks_db" in globals() and feedback_id in globals()["feedbacks_db"]:
                globals()["feedbacks_db"][feedback_id]["status"] = status
                globals()["feedbacks_db"][feedback_id]["updated_at"] = datetime.now().isoformat()
                return True
            return False
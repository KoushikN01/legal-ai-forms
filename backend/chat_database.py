"""
Chat message database operations
"""

import os
from typing import List, Dict
from datetime import datetime

# Database type from environment
DB_TYPE = os.getenv("DB_TYPE", "mongodb")

# Import database connection
if DB_TYPE == "mongodb":
    from database import db
elif DB_TYPE == "postgresql":
    from database import SessionLocal

class ChatDatabaseService:
    """Service for managing chat messages in database"""
    
    @staticmethod
    def save_chat_message(message_id: str, user_id: str, sender: str, text: str, timestamp: str = None) -> dict:
        """Save chat message to database"""
        if not timestamp:
            timestamp = datetime.now().isoformat()
            
        message = {
            "message_id": message_id,
            "user_id": user_id,
            "sender": sender,  # "user" or "admin"
            "text": text,
            "timestamp": timestamp,
            "created_at": datetime.now().isoformat()
        }
        
        if DB_TYPE == "mongodb":
            # Create messages collection if it doesn't exist
            messages_collection = db.messages
            messages_collection.insert_one(message)
            return message
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL message saving
            pass
        else:  # mock
            if "messages_db" not in globals():
                globals()["messages_db"] = {}
            globals()["messages_db"][message_id] = message
            return message
    
    @staticmethod
    def get_chat_messages(user_id: str = None) -> List[dict]:
        """Get chat messages, optionally filtered by user"""
        print(f"[ChatDatabaseService] Getting chat messages, DB_TYPE: {DB_TYPE}, user_id: {user_id}")
        if DB_TYPE == "mongodb":
            try:
                messages_collection = db.messages
                if user_id:
                    messages = messages_collection.find({"user_id": user_id}).sort("timestamp", 1)
                else:
                    messages = messages_collection.find().sort("timestamp", 1)
                
                result = []
                for message in messages:
                    message_dict = dict(message)
                    if "_id" in message_dict:
                        message_dict["_id"] = str(message_dict["_id"])
                    result.append(message_dict)
                print(f"[ChatDatabaseService] Found {len(result)} messages in MongoDB")
                return result
            except Exception as e:
                print(f"[ChatDatabaseService] MongoDB error: {e}")
                return []
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL message retrieval
            return []
        else:  # mock
            if "messages_db" not in globals():
                print("[ChatDatabaseService] No messages_db in globals, returning empty list")
                return []
            messages = list(globals()["messages_db"].values())
            if user_id:
                messages = [m for m in messages if m.get("user_id") == user_id]
            result = sorted(messages, key=lambda x: x.get("timestamp", ""))
            print(f"[ChatDatabaseService] Found {len(result)} messages in mock DB")
            return result
    
    @staticmethod
    def get_chat_users() -> List[dict]:
        """Get unique chat users with their latest message info"""
        messages = ChatDatabaseService.get_chat_messages()
        user_map = {}
        
        for message in messages:
            user_id = message.get("user_id")
            if not user_id:
                continue
                
            if user_id not in user_map:
                user_map[user_id] = {
                    "id": user_id,
                    "name": f"User {user_id[:8]}",
                    "email": f"user{user_id[:8]}@example.com",
                    "lastMessage": "",
                    "lastMessageTime": message.get("timestamp", message.get("created_at", ""))
                }
            
            # Update with latest message info
            if message.get("sender") == "user":
                user_map[user_id]["lastMessage"] = message.get("text", "")
                user_map[user_id]["lastMessageTime"] = message.get("timestamp", message.get("created_at", ""))
        
        return list(user_map.values())
    
    @staticmethod
    def delete_chat_message(message_id: str) -> bool:
        """Delete a chat message"""
        if DB_TYPE == "mongodb":
            try:
                messages_collection = db.messages
                result = messages_collection.delete_one({"message_id": message_id})
                return result.deleted_count > 0
            except Exception as e:
                print(f"[ChatDB] MongoDB delete error: {e}")
                return False
        elif DB_TYPE == "postgresql":
            # TODO: Implement PostgreSQL message deletion
            print("[ChatDB] PostgreSQL delete not implemented")
            return False
        else:  # mock
            try:
                if "messages_db" in globals() and message_id in globals()["messages_db"]:
                    del globals()["messages_db"][message_id]
                    print(f"[ChatDB] Mock: Deleted message {message_id}")
                    return True
                else:
                    print(f"[ChatDB] Mock: Message {message_id} not found")
                    return False
            except Exception as e:
                print(f"[ChatDB] Mock delete error: {e}")
                return False

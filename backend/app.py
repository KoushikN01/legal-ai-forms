from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import uuid
import os
import json
from datetime import datetime
from typing import Optional
import cloudinary
import cloudinary.uploader

class GoogleAuthRequest(BaseModel):
    code: str

class SignupRequest(BaseModel):
    email: str
    password: str
    phone: str
    name: str

class SigninRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str

from config import *
from database import DatabaseService
from services.auth_service import AuthService
from services.openai_service import OpenAIService
from chat_database import ChatDatabaseService
from services.email_service import EmailService
from services.pdf_service import PDFService
from services.user_service import UserService
from middleware import get_current_user, get_current_user_optional, require_admin

app = FastAPI(title="Legal Voice App API", version="2.0.0")

# Configure Cloudinary once at startup
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

FORMS_DB = {
    "name_change": {
        "id": "name_change",
        "title": "Name Change Affidavit",
        "description": "Apply for official name change",
        "fields": [
            {"id": "applicant_full_name", "label": "Full Name", "type": "text", "required": True, "help": "Your current full legal name"},
            {"id": "applicant_age", "label": "Age", "type": "number", "required": True, "help": "Your age in years"},
            {"id": "applicant_father_name", "label": "Father's Name", "type": "text", "required": True, "help": "Father or guardian's full name"},
            {"id": "current_address", "label": "Current Address", "type": "textarea", "required": True, "help": "Full residential address with PIN code"},
            {"id": "previous_name", "label": "Previous Name", "type": "text", "required": True, "help": "The name you used earlier"},
            {"id": "new_name", "label": "New Name", "type": "text", "required": True, "help": "The new name you want officially"},
            {"id": "reason", "label": "Reason for Change", "type": "textarea", "required": True, "help": "Short reason, e.g., marriage, spelling correction"},
            {"id": "date_of_declaration", "label": "Date of Declaration", "type": "date", "required": True, "help": "Date when you sign this form"},
            {"id": "place", "label": "Place", "type": "text", "required": True, "help": "City/town where you sign"},
            {"id": "id_proof_type", "label": "ID Proof Type", "type": "select", "required": True, "options": ["Aadhar", "Passport", "Voter ID", "Driving Licence"]},
            {"id": "id_proof_number", "label": "ID Proof Number", "type": "text", "required": True, "help": "ID number from selected proof"},
        ]
    },
    "property_dispute": {
        "id": "property_dispute",
        "title": "Property Dispute Plaint",
        "description": "File a property dispute case",
        "fields": [
            {"id": "plaintiff_name", "label": "Your Name", "type": "text", "required": True},
            {"id": "plaintiff_address", "label": "Your Address", "type": "textarea", "required": True},
            {"id": "defendant_name", "label": "Defendant Name", "type": "text", "required": True},
            {"id": "defendant_address", "label": "Defendant Address", "type": "textarea", "required": True},
            {"id": "property_description", "label": "Property Details", "type": "textarea", "required": True},
            {"id": "nature_of_claim", "label": "Claim Type", "type": "select", "required": True, "options": ["Ownership", "Ejectment", "Partition", "Possession"]},
            {"id": "value_of_claim", "label": "Claim Value (₹)", "type": "number", "required": True},
            {"id": "facts_of_case", "label": "Facts of Case", "type": "textarea", "required": True},
            {"id": "relief_sought", "label": "Relief Sought", "type": "textarea", "required": True},
        ]
    },
    "traffic_fine_appeal": {
        "id": "traffic_fine_appeal",
        "title": "Traffic Fine Appeal",
        "description": "Appeal against traffic challan",
        "fields": [
            {"id": "appellant_name", "label": "Your Name", "type": "text", "required": True},
            {"id": "appellant_address", "label": "Your Address", "type": "textarea", "required": True},
            {"id": "challan_number", "label": "Challan Number", "type": "text", "required": True},
            {"id": "vehicle_number", "label": "Vehicle Number", "type": "text", "required": True},
            {"id": "date_of_challan", "label": "Date of Challan", "type": "date", "required": True},
            {"id": "offence_details", "label": "Offence Details", "type": "textarea", "required": True},
            {"id": "explanation", "label": "Explanation", "type": "textarea", "required": True},
        ]
    },
    "mutual_divorce": {
        "id": "mutual_divorce",
        "title": "Mutual Divorce Petition",
        "description": "File for mutual consent divorce",
        "fields": [
            {"id": "husband_name", "label": "Husband's Name", "type": "text", "required": True},
            {"id": "wife_name", "label": "Wife's Name", "type": "text", "required": True},
            {"id": "marriage_date", "label": "Marriage Date", "type": "date", "required": True},
            {"id": "marriage_place", "label": "Marriage Place", "type": "text", "required": True},
            {"id": "reason_for_divorce", "label": "Reason for Divorce", "type": "textarea", "required": True},
            {"id": "mutual_agreement", "label": "Mutual Agreement", "type": "checkbox", "required": True},
        ]
    },
    "affidavit_general": {
        "id": "affidavit_general",
        "title": "General Affidavit",
        "description": "Sworn statement for verification",
        "fields": [
            {"id": "deponent_name", "label": "Your Name", "type": "text", "required": True},
            {"id": "deponent_age", "label": "Your Age", "type": "number", "required": True},
            {"id": "deponent_address", "label": "Your Address", "type": "textarea", "required": True},
            {"id": "statement_text", "label": "Statement", "type": "textarea", "required": True},
            {"id": "place_of_sworn", "label": "Place of Sworn", "type": "text", "required": True},
            {"id": "date_of_sworn", "label": "Date of Sworn", "type": "date", "required": True},
        ]
    },
    "name_change_gazette": {
        "id": "name_change_gazette",
        "title": "Name Change Gazette Notification",
        "description": "Apply for name change gazette publication",
        "fields": [
            {"id": "applicant_full_name", "label": "Current Full Name", "type": "text", "required": True, "help": "Your current full legal name"},
            {"id": "new_name", "label": "New Name", "type": "text", "required": True, "help": "Your desired new name"},
            {"id": "previous_name", "label": "Previous Name", "type": "text", "required": True, "help": "Any previous names"},
            {"id": "reason", "label": "Reason", "type": "textarea", "required": True, "help": "Reason for name change"},
            {"id": "publication_address", "label": "Publication Address", "type": "textarea", "required": True, "help": "Address for gazette office"},
            {"id": "proof_of_publication_fee", "label": "Publication Fee Proof", "type": "file", "required": False, "help": "Upload fee payment proof"},
            {"id": "date_of_application", "label": "Application Date", "type": "date", "required": True, "help": "Date of application"},
        ]
    },
    "property_dispute_simple": {
        "id": "property_dispute_simple",
        "title": "Property Dispute Plaint (Simple)",
        "description": "File a simple property dispute case",
        "fields": [
            {"id": "plaintiff_name", "label": "Plaintiff Name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "plaintiff_address", "label": "Plaintiff Address", "type": "textarea", "required": True, "help": "Your complete address with pincode"},
            {"id": "defendant_name", "label": "Defendant Name", "type": "text", "required": True, "help": "Defendant full legal name"},
            {"id": "defendant_address", "label": "Defendant Address", "type": "textarea", "required": True, "help": "Defendant complete address"},
            {"id": "property_description", "label": "Property Description", "type": "textarea", "required": True, "help": "Location, survey number, or address of property"},
            {"id": "nature_of_claim", "label": "Nature of Claim", "type": "select", "required": True, "options": ["Ownership", "Ejectment", "Partition", "Possession"], "help": "Type of claim"},
            {"id": "value_of_claim", "label": "Value of Claim (₹)", "type": "number", "required": True, "help": "Monetary value of claim"},
            {"id": "facts_of_case", "label": "Facts of Case", "type": "textarea", "required": True, "help": "Detailed facts of the case"},
            {"id": "relief_sought", "label": "Relief Sought", "type": "textarea", "required": True, "help": "What relief you are seeking"},
            {"id": "date_of_incident", "label": "Date of Incident", "type": "date", "required": False, "help": "When the incident occurred"},
            {"id": "evidence_list", "label": "Evidence List", "type": "file", "required": False, "help": "Upload evidence documents"},
            {"id": "verification_declaration", "label": "I Verify", "type": "boolean", "required": True, "help": "I verify that the above information is true"},
        ]
    },
    "traffic_fine_appeal": {
        "id": "traffic_fine_appeal",
        "title": "Traffic Fine Appeal",
        "description": "Appeal against traffic challan",
        "fields": [
            {"id": "appellant_name", "label": "Appellant Name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "appellant_address", "label": "Appellant Address", "type": "textarea", "required": True, "help": "Your complete address"},
            {"id": "challan_number", "label": "Challan Number", "type": "text", "required": True, "help": "Your traffic fine challan number"},
            {"id": "vehicle_number", "label": "Vehicle Number", "type": "text", "required": True, "help": "Vehicle registration number"},
            {"id": "date_of_challan", "label": "Date of Challan", "type": "date", "required": True, "help": "When the challan was issued"},
            {"id": "offence_details", "label": "Offence Details", "type": "textarea", "required": True, "help": "Details of the alleged offence"},
            {"id": "explanation", "label": "Your Explanation", "type": "textarea", "required": True, "help": "Your explanation/defense"},
            {"id": "police_station", "label": "Police Station", "type": "text", "required": False, "help": "Police station name"},
            {"id": "attachments", "label": "Attachments", "type": "file", "required": False, "help": "Upload supporting documents"},
        ]
    },
    "mutual_divorce_petition": {
        "id": "mutual_divorce_petition",
        "title": "Mutual Divorce Petition",
        "description": "File for mutual divorce",
        "fields": [
            {"id": "husband_full_name", "label": "Husband's Full Name", "type": "text", "required": True, "help": "Husband's full legal name"},
            {"id": "wife_full_name", "label": "Wife's Full Name", "type": "text", "required": True, "help": "Wife's full legal name"},
            {"id": "marriage_date", "label": "Marriage Date", "type": "date", "required": True, "help": "Date of marriage"},
            {"id": "marriage_place", "label": "Place of Marriage", "type": "text", "required": True, "help": "Where the marriage took place"},
            {"id": "residential_address_husband", "label": "Husband's Address", "type": "textarea", "required": True, "help": "Husband's residential address"},
            {"id": "residential_address_wife", "label": "Wife's Address", "type": "textarea", "required": True, "help": "Wife's residential address"},
            {"id": "reason_for_divorce", "label": "Reason for Divorce", "type": "textarea", "required": True, "help": "Reason for seeking divorce"},
            {"id": "mutual_agreement", "label": "Mutual Agreement", "type": "boolean", "required": True, "help": "Both parties agree to divorce"},
            {"id": "children", "label": "Children Details", "type": "textarea", "required": False, "help": "Names, DOB, and custody preferences"},
            {"id": "maintenance_terms", "label": "Maintenance Terms", "type": "textarea", "required": False, "help": "Agreed maintenance terms"},
            {"id": "date_of_affidavit", "label": "Date of Affidavit", "type": "date", "required": True, "help": "Date of this affidavit"},
            {"id": "attachments", "label": "Attachments", "type": "file", "required": True, "help": "Marriage certificate and IDs required"},
        ]
    },
    "affidavit_general": {
        "id": "affidavit_general",
        "title": "General Affidavit",
        "description": "Create a general affidavit",
        "fields": [
            {"id": "deponent_name", "label": "Deponent Name", "type": "text", "required": True, "help": "Your full legal name"},
            {"id": "deponent_age", "label": "Age", "type": "number", "required": True, "help": "Your age"},
            {"id": "deponent_address", "label": "Address", "type": "textarea", "required": True, "help": "Your complete address"},
            {"id": "statement_text", "label": "Statement", "type": "textarea", "required": True, "help": "Your statement in first person"},
            {"id": "place_of_sworn", "label": "Place of Sworn", "type": "text", "required": True, "help": "Where this is sworn"},
            {"id": "date_of_sworn", "label": "Date of Sworn", "type": "date", "required": True, "help": "Date of swearing"},
            {"id": "notary_name", "label": "Notary Name", "type": "text", "required": False, "help": "Name of notary public"},
            {"id": "attachments", "label": "Attachments", "type": "file", "required": False, "help": "Supporting documents"},
        ]
    }
}

# ============ Authentication Endpoints ============

@app.post("/auth/signup")
async def signup(request: SignupRequest):
    """User signup with email and password"""
    try:
        user = UserService.create_user(request.email, request.password, request.phone, request.name)
        # Check if this is an admin email
        from config import ADMIN_EMAIL
        is_admin = request.email == ADMIN_EMAIL
        token = AuthService.create_token(user["user_id"], request.email, is_admin)
        return {"user": user, "token": token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/signin")
async def signin(request: SigninRequest):
    """User signin with email and password"""
    try:
        print(f"[DEBUG] Signin request: email={request.email}")
        
        # Check if user exists first
        user = DatabaseService.get_user_by_email(request.email)
        print(f"[DEBUG] User found in database: {user is not None}")
        if user:
            print(f"[DEBUG] User data: {user}")
        
        result = UserService.authenticate_user(request.email, request.password)
        print(f"[DEBUG] Authentication result: {result}")
        if not result:
            print(f"[DEBUG] Authentication failed - user not found or wrong password")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Send login notification email
        try:
            user_name = result.get("user", {}).get("name", "User")
            login_time = datetime.now().strftime("%B %d, %Y at %I:%M %p")
            EmailService.send_login_notification(
                email=request.email,
                user_name=user_name,
                login_time=login_time,
                ip_address="Unknown"  # You can get this from request headers if needed
            )
            print(f"[EMAIL] Login notification sent to {request.email}")
        except Exception as email_error:
            print(f"[EMAIL ERROR] Failed to send login notification: {str(email_error)}")
        
        # Update token with admin status
        from config import ADMIN_EMAIL
        is_admin = request.email == ADMIN_EMAIL
        
        # Also check if user has admin privileges in database
        if not is_admin:
            user_from_db = DatabaseService.get_user_by_email(request.email)
            if user_from_db and (user_from_db.get("is_admin") or user_from_db.get("admin")):
                is_admin = True
        
        if is_admin:
            # Recreate token with admin privileges
            user_id = result.get("user_id") or result.get("id")
            new_token = AuthService.create_token(user_id, request.email, True)
            result["token"] = new_token
            print(f"[DEBUG] Admin token created for {request.email}")
        
        return result
    except Exception as e:
        print(f"[DEBUG] Signin error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/google")
async def google_auth(request: GoogleAuthRequest):
    """Google OAuth authentication"""
    try:
        import requests
        
        print(f"[DEBUG] Google auth request received: {request.code[:10]}...")
        
        # Check if Google OAuth is configured
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            print("[DEBUG] Google OAuth not configured, using mock user")
            # Return mock user when Google OAuth is not configured
            user = {
                "id": f"google_mock_{request.code[:8]}",
                "user_id": f"google_mock_{request.code[:8]}",
                "email": "user@gmail.com",
                "name": "Google User",
                "picture": "https://via.placeholder.com/150"
            }
            token = AuthService.create_token(user["user_id"], user["email"])
            return {"user": user, "token": token}
        
        print(f"[DEBUG] Using Google OAuth with Client ID: {GOOGLE_CLIENT_ID[:20]}...")
        
        code = request.code
        if not code:
            raise HTTPException(status_code=400, detail="Authorization code required")
        
        print(f"[DEBUG] Exchanging code with Google...")
        
        # Exchange code for access token
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": f"{FRONTEND_URL}/auth/google/callback"
        })
        
        print(f"[DEBUG] Token response status: {token_response.status_code}")
        print(f"[DEBUG] Token response: {token_response.text[:200]}...")
        
        if token_response.status_code != 200:
            print(f"[DEBUG] Token exchange failed, using mock user")
            # Fallback to mock user
            user = {
                "user_id": f"google_fallback_{request.code[:8]}",
                "email": "user@gmail.com", 
                "name": "Google User",
                "picture": "https://via.placeholder.com/150"
            }
            token = AuthService.create_token(user["user_id"], user["email"])
            return {"user": user, "token": token}
        
        token_data = token_response.json()
        access_token = token_data["access_token"]
        
        # Get user info from Google
        print(f"[DEBUG] Getting user info from Google...")
        user_response = requests.get(
            f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}"
        )
        
        print(f"[DEBUG] User response status: {user_response.status_code}")
        print(f"[DEBUG] User response: {user_response.text[:200]}...")
        
        if user_response.status_code != 200:
            print(f"[DEBUG] Failed to get user info, using fallback")
            # Fallback to mock user
            user = {
                "id": f"google_fallback_{request.code[:8]}",
                "user_id": f"google_fallback_{request.code[:8]}",
                "email": "user@gmail.com", 
                "name": "Google User",
                "picture": "https://via.placeholder.com/150"
            }
            token = AuthService.create_token(user["user_id"], user["email"])
            return {"user": user, "token": token}
        
        user_data = user_response.json()
        print(f"[DEBUG] User data: {user_data}")
        
        try:
            # Create or update user
            print(f"[DEBUG] Creating/updating user...")
            user = UserService.create_or_update_google_user(
                google_id=user_data["id"],
                email=user_data["email"],
                name=user_data["name"],
                picture=user_data.get("picture")
            )
            print(f"[DEBUG] User created: {user}")
            
            print(f"[DEBUG] Creating token...")
            # Check if this is an admin email
            from config import ADMIN_EMAIL
            is_admin = user["email"] == ADMIN_EMAIL
            token = AuthService.create_token(user["user_id"], user["email"], is_admin)
            print(f"[DEBUG] Token created successfully with admin status: {is_admin}")
            
            # Send login notification email for Google users
            try:
                user_name = user.get("name", "User")
                login_time = datetime.now().strftime("%B %d, %Y at %I:%M %p")
                EmailService.send_login_notification(
                    email=user["email"],
                    user_name=user_name,
                    login_time=login_time,
                    ip_address="Google OAuth"
                )
                print(f"[EMAIL] Google login notification sent to {user['email']}")
            except Exception as email_error:
                print(f"[EMAIL ERROR] Failed to send Google login notification: {str(email_error)}")
            
            return {"user": user, "token": token}
        except Exception as user_error:
            print(f"[DEBUG] User creation failed: {str(user_error)}")
            # Fallback to mock user
            user = {
                "id": f"google_fallback_{request.code[:8]}",
                "user_id": f"google_fallback_{request.code[:8]}",
                "email": "user@gmail.com", 
                "name": "Google User",
                "picture": "https://via.placeholder.com/150"
            }
            token = AuthService.create_token(user["user_id"], user["email"])
            return {"user": user, "token": token}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/aadhar")
async def aadhar_auth(aadhar_number: str):
    """Aadhar OTP authentication"""
    # TODO: Implement Aadhar OTP flow
    otp = AuthService.generate_otp()
    return {"otp_sent": True, "message": f"OTP sent to registered mobile"}

@app.post("/auth/aadhar-verify")
async def aadhar_verify(aadhar_number: str, otp: str):
    """Verify Aadhar OTP"""
    # TODO: Verify OTP and create user session
    return {"authenticated": True, "token": "jwt_token_here"}

@app.post("/auth/password-reset-request")
async def password_reset_request(request: PasswordResetRequest):
    """Request password reset"""
    try:
        email = request.email
        print(f"[DEBUG] Password reset request for email: {email}")
        
        # Check if user exists
        user = UserService.get_user_by_email(email)
        if not user:
            # Don't reveal if user exists or not for security
            return {"message": "If an account with that email exists, a password reset link has been sent"}
        
        # Generate reset token
        reset_token = AuthService.generate_reset_token()
        
        # Set expiration time (24 hours from now)
        from datetime import datetime, timedelta
        expires_at = (datetime.now() + timedelta(hours=24)).isoformat()
        
        # Save reset token to database
        DatabaseService.save_reset_token(email, reset_token, expires_at)
        
        # Get user name for personalized email
        user_name = user.get("name", "User")
        
        # Send password reset email
        EmailService.send_password_reset_link(email, reset_token, user_name)
        
        return {"message": "If an account with that email exists, a password reset link has been sent"}
    except Exception as e:
        print(f"[ERROR] Password reset request failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to process password reset request")

@app.post("/auth/password-reset")
async def password_reset(request: PasswordResetConfirmRequest):
    """Reset password with token"""
    try:
        token = request.token
        new_password = request.new_password
        print(f"[DEBUG] Password reset with token: {token[:10]}...")
        
        # Get reset token from database
        reset_data = DatabaseService.get_reset_token(token)
        if not reset_data:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if token is expired
        from datetime import datetime
        expires_at = datetime.fromisoformat(reset_data["expires_at"])
        if datetime.now() > expires_at:
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Get user by email
        user = UserService.get_user_by_email(reset_data["email"])
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        
        # Update user password
        from services.auth_service import AuthService
        hashed_password = AuthService.hash_password(new_password)
        UserService.update_user(user["user_id"], {"password": hashed_password})
        
        # Mark token as used
        DatabaseService.mark_reset_token_used(token)
        
        return {"message": "Password reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Password reset failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to reset password")

# ============ Form Endpoints ============

@app.get("/forms")
async def get_forms():
    """Get list of available forms"""
    return list(FORMS_DB.values())

@app.get("/forms/{form_id}")
async def get_form(form_id: str):
    """Get specific form details"""
    if form_id not in FORMS_DB:
        raise HTTPException(status_code=404, detail="Form not found")
    return FORMS_DB[form_id]

# ============ Voice & Transcription Endpoints ============

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Transcribe audio file to text using OpenAI Whisper"""
    try:
        temp_path = f"/tmp/{uuid.uuid4()}.wav"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        result = OpenAIService.transcribe_audio(temp_path)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TranslateAndFillRequest(BaseModel):
    text: str
    field_name: str
    field_help: str
    source_language: str

@app.post("/translate-and-fill")
async def translate_and_fill(request: TranslateAndFillRequest, current_user: dict = Depends(get_current_user)):
    """Translate user's voice input and extract field value"""
    try:
        result = OpenAIService.translate_and_extract_field(
            text=request.text,
            field_name=request.field_name,
            field_help=request.field_help,
            source_language=request.source_language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Form Filling & Validation Endpoints ============

class InterpretRequest(BaseModel):
    form_id: str
    transcript: str

@app.post("/interpret")
async def interpret_form(request: InterpretRequest, current_user: dict = Depends(get_current_user)):
    """Use GPT-4 to interpret transcript and fill form fields"""
    try:
        if request.form_id not in FORMS_DB:
            raise HTTPException(status_code=404, detail="Form not found")
        
        form = FORMS_DB[request.form_id]
        result = OpenAIService.interpret_form(request.form_id, request.transcript, form)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ValidateRequest(BaseModel):
    form_id: str
    filled_data: dict

@app.post("/validate")
async def validate_form(request: ValidateRequest, current_user: dict = Depends(get_current_user)):
    """Validate form data"""
    try:
        if request.form_id not in FORMS_DB:
            raise HTTPException(status_code=404, detail="Form not found")
        
        form = FORMS_DB[request.form_id]
        result = OpenAIService.validate_form_with_gpt(request.form_id, request.filled_data, form)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FollowupRequest(BaseModel):
    form_id: str
    missing_fields: list

@app.post("/followup")
async def generate_followup(request: FollowupRequest, current_user: dict = Depends(get_current_user)):
    """Generate follow-up questions for missing fields"""
    try:
        if request.form_id not in FORMS_DB:
            raise HTTPException(status_code=404, detail="Form not found")
        
        form = FORMS_DB[request.form_id]
        result = OpenAIService.generate_followup_questions(request.form_id, request.missing_fields, form)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Smart Form AI Endpoints ============

class SmartFormRequest(BaseModel):
    speech_text: str
    language: str = "auto"

class ProcessCompleteSpeechRequest(BaseModel):
    speech_text: str
    language: str = "auto"

# ============ Step-by-Step Form Endpoints ============

class StartFormSessionRequest(BaseModel):
    form_id: str

class AnswerQuestionRequest(BaseModel):
    session_id: str
    answer: str
    language: str = "en"

@app.post("/smart-form-detection")
async def smart_form_detection(request: SmartFormRequest, current_user: dict = Depends(get_current_user)):
    """Detect form type and extract information from complete speech"""
    try:
        from smart_form_ai import SmartFormAI
        
        ai = SmartFormAI()
        result = ai.process_complete_speech(request.speech_text, request.language)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-complete-speech")
async def process_complete_speech(request: ProcessCompleteSpeechRequest, current_user: dict = Depends(get_current_user)):
    """Process complete user speech and create appropriate form"""
    try:
        from smart_form_ai import SmartFormAI
        
        ai = SmartFormAI()
        result = ai.process_complete_speech(request.speech_text, request.language)
        
        # If form type is detected, get the form schema
        if result.get('form_type') and result['form_type'] in FORMS_DB:
            form_schema = FORMS_DB[result['form_type']]
            result['form_schema'] = form_schema
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start-form-session")
async def start_form_session(request: StartFormSessionRequest, current_user: dict = Depends(get_current_user)):
    """Start a new step-by-step form session"""
    try:
        if request.form_id not in FORMS_DB:
            raise HTTPException(status_code=404, detail="Form not found")
        
        form = FORMS_DB[request.form_id]
        session_id = f"session_{uuid.uuid4().hex[:8]}"
        
        # Get first question
        missing_fields = [field['id'] for field in form.get('fields', [])]
        question_result = OpenAIService.generate_followup_questions(
            form_id=request.form_id,
            missing_fields=missing_fields[:1],  # Get question for first field
            form_schema=form
        )
        
        if 'questions' in question_result and question_result['questions']:
            first_question = question_result['questions'][0]
            return {
                "session_id": session_id,
                "form_id": request.form_id,
                "current_field": form['fields'][0]['id'],
                "question": first_question.get('question', f"What is your {form['fields'][0]['label']}?"),
                "question_hindi": first_question.get('question_hindi', f"आपका {form['fields'][0]['label']} क्या है?"),
                "question_tamil": first_question.get('question_tamil', f"உங்கள் {form['fields'][0]['label']} என்ன?"),
                "question_telugu": first_question.get('question_telugu', f"మీ {form['fields'][0]['label']} ఏమిటి?"),
                "progress": {
                    "current": 1,
                    "total": len(form['fields']),
                    "percentage": round((1 / len(form['fields'])) * 100)
                }
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate question")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/answer-question")
async def answer_question(request: AnswerQuestionRequest, current_user: dict = Depends(get_current_user)):
    """Process user's answer and get next question"""
    try:
        # For now, we'll use a simple approach
        # In a real implementation, you'd store session state in database
        
        # Extract form_id from session_id (simplified)
        form_id = "name_change"  # This should come from session storage
        
        if form_id not in FORMS_DB:
            raise HTTPException(status_code=404, detail="Form not found")
        
        form = FORMS_DB[form_id]
        
        # Process the answer using AI
        result = OpenAIService.translate_and_extract_field(
            text=request.answer,
            field_name="applicant_full_name",  # This should be dynamic based on current field
            field_help="Your full legal name",
            source_language=request.language
        )
        
        if 'translated_value' in result:
            return {
                "status": "success",
                "extracted_value": result['translated_value'],
                "confidence": result.get('confidence', 0.8),
                "next_question": {
                    "question": "What is your age?",
                    "question_hindi": "आपकी उम्र क्या है?",
                    "question_tamil": "உங்கள் வயது என்ன?",
                    "question_telugu": "మీ వయస్సు ఎంత?"
                },
                "progress": {
                    "current": 2,
                    "total": len(form['fields']),
                    "percentage": round((2 / len(form['fields'])) * 100)
                }
            }
        else:
            return {
                "status": "error",
                "message": "Could not understand your answer. Please try again.",
                "suggestion": "Try saying something like: 'My name is John Doe'"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Submission Endpoints ============

class SubmitFormRequest(BaseModel):
    form_id: str
    filled_data: dict
    user_id: str

@app.post("/submit")
async def submit_form(request: SubmitFormRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Submit form and create submission record"""
    try:
        print(f"[DEBUG] Submit form request - form_id: {request.form_id}")
        print(f"[DEBUG] Current user: {current_user}")
        print(f"[DEBUG] Request data: {request}")
        
        if request.form_id not in FORMS_DB:
            raise HTTPException(status_code=404, detail="Form not found")
        
        # Get user_id from current_user (prefer authenticated user over request)
        user_id = current_user.get("user_id") or current_user.get("id") or request.user_id
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in authentication")
        
        # Ensure user exists in database (for AI forms users)
        existing_user = DatabaseService.get_user(user_id)
        if not existing_user:
            print(f"[DEBUG] User {user_id} not found in database, creating user record")
            # Create a basic user record for AI form submissions
            user_email = current_user.get("email", f"ai_user_{user_id}@example.com")
            user_name = current_user.get("name", f"AI User {user_id}")
            user_data = {
                "user_id": user_id,
                "email": user_email,
                "name": user_name,
                "phone": "",
                "password_hash": "",  # No password for AI users
                "login_method": "ai_form",
                "created_at": datetime.now().isoformat()
            }
            DatabaseService.save_user(user_data)
        
        print(f"[DEBUG] Using user_id: {user_id}")
        
        tracking_id = f"TRK{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        
        submission = DatabaseService.save_submission(
            tracking_id=tracking_id,
            form_id=request.form_id,
            data=request.filled_data,
            user_id=user_id,
            status="submitted"
        )
        
        # Generate PDF (optional - don't fail if PDF generation fails)
        try:
            pdf_path = PDFService.generate_form_pdf(request.form_id, request.filled_data, tracking_id)
            print(f"[DEBUG] PDF generated successfully: {pdf_path}")
        except Exception as pdf_error:
            print(f"[DEBUG] PDF generation failed (non-critical): {str(pdf_error)}")
            pdf_path = None
        
        # Send beautiful confirmation email
        print(f"[DEBUG] Attempting to send email for user_id: {user_id}")
        user = UserService.get_user(user_id)
        print(f"[DEBUG] User found: {user}")
        
        # Fallback to current_user if UserService.get_user fails
        if not user:
            print(f"[DEBUG] User not found in database, using current_user data")
            user = current_user
        
        if user and user.get("email"):
            print(f"[DEBUG] Sending email to: {user['email']}")
            background_tasks.add_task(
                EmailService.send_submission_confirmation,
                user["email"],
                tracking_id,
                FORMS_DB[request.form_id]["title"],
                user.get("name", "User")
            )
            
            # Also send PDF if it was generated successfully
            if pdf_path and not pdf_path.startswith("mock_"):
                print(f"[DEBUG] Sending PDF attachment: {pdf_path}")
                background_tasks.add_task(
                    EmailService.send_form_pdf,
                    user["email"],
                    pdf_path,
                    tracking_id
                )
            
            print(f"[DEBUG] Email task added to background tasks")
        else:
            print(f"[DEBUG] No user email found - user: {user}")
        
        return {
            "tracking_id": tracking_id,
            "status": "submitted",
            "message": "Form submitted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/track/{tracking_id}")
async def track_submission(tracking_id: str, current_user: dict = Depends(get_current_user)):
    """Get submission status"""
    submission = DatabaseService.get_submission(tracking_id)
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return {
        "tracking_id": tracking_id,
        "form_id": submission["form_id"],
        "status": submission["status"],
        "created_at": submission["created_at"],
        "updated_at": submission.get("updated_at", submission["created_at"]),
        "history": submission["history"],
        "data": submission.get("data", {}),  # Include form data
        "user_id": submission.get("user_id", ""),
        "admin_message": submission.get("admin_message", "")
    }

# ============ User Endpoints ============

@app.get("/user/submissions")
async def get_user_submissions(current_user: dict = Depends(get_current_user)):
    """Get user's own submissions"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        submissions = DatabaseService.get_user_submissions(user_id)
        
        # Calculate statistics
        total_submissions = len(submissions)
        pending_submissions = len([s for s in submissions if s["status"] in ["submitted", "processing"]])
        approved_submissions = len([s for s in submissions if s["status"] == "approved"])
        rejected_submissions = len([s for s in submissions if s["status"] == "rejected"])
        
        # This month submissions
        from datetime import datetime, timedelta
        this_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_submissions = 0
        
        try:
            this_month_submissions = len([
                s for s in submissions 
                if datetime.fromisoformat(s["created_at"].replace('Z', '+00:00')) >= this_month
            ])
        except Exception as date_error:
            print(f"[DEBUG] Date parsing error: {date_error}")
            # Fallback: count all submissions if date parsing fails
            this_month_submissions = len(submissions)
        
        stats = {
            "totalSubmissions": total_submissions,
            "pendingSubmissions": pending_submissions,
            "approvedSubmissions": approved_submissions,
            "rejectedSubmissions": rejected_submissions,
            "thisMonthSubmissions": this_month_submissions
        }
        
        return {"submissions": submissions, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    try:
        print(f"[DEBUG] User profile request - current_user: {current_user}")
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            print(f"[ERROR] User ID not found in current_user: {current_user}")
            # Try to get user by email as fallback
            user_email = current_user.get("email")
            if user_email:
                print(f"[DEBUG] Trying to find user by email: {user_email}")
                user_by_email = DatabaseService.get_user_by_email(user_email)
                if user_by_email:
                    user_id = user_by_email.get("user_id")
                    print(f"[DEBUG] Found user by email, user_id: {user_id}")
                else:
                    raise HTTPException(status_code=400, detail="User ID not found")
            else:
                raise HTTPException(status_code=400, detail="User ID not found")
        
        print(f"[DEBUG] Looking for user_id: {user_id}")
        user = DatabaseService.get_user(user_id)
        if not user:
            print(f"[ERROR] User not found in database for user_id: {user_id}")
            # For development users, create a basic user record
            if user_id == "dev_user_123":
                print(f"[DEBUG] Creating development user record")
                user_data = {
                    "user_id": user_id,
                    "email": current_user.get("email", "dev@example.com"),
                    "name": current_user.get("name", "Development User"),
                    "phone": "",
                    "password_hash": "",
                    "login_method": "development",
                    "created_at": datetime.now().isoformat()
                }
                DatabaseService.save_user(user_data)
                user = user_data
            else:
                raise HTTPException(status_code=404, detail="User not found")
        
        print(f"[DEBUG] Found user: {user.get('email')}")
        
        return {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "phone": user.get("phone"),
            "profile": user.get("profile", {}),
            "settings": user.get("settings", {}),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ProfileUpdateRequest(BaseModel):
    name: str
    phone: str
    address: str = ""
    photo: str = ""

@app.put("/user/profile")
async def update_user_profile(request: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        profile_data = {
            "name": request.name,
            "phone": request.phone,
            "address": request.address,
            "photo": request.photo
        }
        
        updated_user = DatabaseService.save_user_profile(user_id, profile_data)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Profile updated successfully", "user": updated_user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SettingsUpdateRequest(BaseModel):
    language: str = "en"
    notifications: bool = True
    dark_mode: bool = False
    email_notifications: bool = True
    sms_notifications: bool = False

@app.put("/user/settings")
async def update_user_settings(request: SettingsUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update user settings"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        settings = {
            "language": request.language,
            "notifications": request.notifications,
            "dark_mode": request.dark_mode,
            "email_notifications": request.email_notifications,
            "sms_notifications": request.sms_notifications
        }
        
        updated_user = DatabaseService.save_user_settings(user_id, settings)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Settings updated successfully", "settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/profile-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload profile photo to Cloudinary"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Read file content
        file_content = await file.read()
        
        # Try Cloudinary first, fallback to MongoDB if it fails
        try:
            upload_result = cloudinary.uploader.upload(
                file_content,
                folder="legal_ai/profile_photos/",
                public_id=f"user_{user_id}",
                overwrite=True,
                resource_type="image"
            )
            
            photo_url = upload_result["secure_url"]
            storage_type = "cloudinary"
            
        except Exception as cloudinary_error:
            print(f"[WARNING] Cloudinary upload failed: {cloudinary_error}")
            print(f"[INFO] Falling back to MongoDB storage")
            
            # Fallback to MongoDB storage
            import base64
            photo_data = base64.b64encode(file_content).decode('utf-8')
            photo_url = f"data:image/jpeg;base64,{photo_data}"
            storage_type = "mongodb"
        
        # Update user profile with photo URL
        update_data = {
            "profile": {
                "photo": photo_url,
                "photo_storage": storage_type
            }
        }
        DatabaseService.update_user(user_id, update_data)
        
        return {
            "message": "Profile photo uploaded successfully", 
            "secure_url": photo_url,
            "storage_type": storage_type
        }
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Profile photo upload error: {error_msg}")
        
        # Provide helpful error message for Cloudinary errors
        if "Invalid cloud_name" in error_msg or "Invalid credentials" in error_msg:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary configuration error: {error_msg}. Please verify your Cloudinary credentials are correct in .env file"
            )
        
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/user/documents")
async def upload_user_document(
    document_type: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload user document to Cloudinary"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Determine resource type based on file extension
        resource_type = "auto"  # Cloudinary will auto-detect
        if file.content_type:
            if "pdf" in file.content_type:
                resource_type = "raw"
        
        # Read file content
        file_content = await file.read()
        
        # Generate unique public_id
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        public_id = f"user_{user_id}_{document_type}_{timestamp}"
        
        # Try Cloudinary first, fallback to MongoDB if it fails
        try:
            upload_result = cloudinary.uploader.upload(
                file_content,
                folder=f"legal_ai/documents/{user_id}/",
                public_id=public_id,
                resource_type=resource_type
            )
            
            file_url = upload_result["secure_url"]
            file_id = upload_result["public_id"]
            file_size = upload_result.get("bytes", len(file_content))
            file_type = upload_result.get("format", file.content_type or "application/pdf")
            storage_type = "cloudinary"
            
        except Exception as cloudinary_error:
            print(f"[WARNING] Cloudinary upload failed: {cloudinary_error}")
            print(f"[INFO] Falling back to MongoDB storage")
            
            # Fallback to MongoDB storage (base64)
            import base64
            file_id = f"mongodb_{public_id}"
            file_data = base64.b64encode(file_content).decode('utf-8')
            file_url = f"data:{file.content_type or 'application/pdf'};base64,{file_data}"
            file_size = len(file_content)
            file_type = file.content_type or "application/pdf"
            storage_type = "mongodb"
        
        # Prepare document data
        document_data = {
            "file_url": file_url,
            "file_id": file_id,
            "file_size": file_size,
            "file_type": file_type,
            "original_filename": file.filename or f"{document_type}.pdf",
            "storage_type": storage_type
        }
        
        # Save to database
        document = DatabaseService.save_user_document(user_id, document_type, document_data)
        
        return {
            "message": "Document uploaded successfully", 
            "document": document,
            "storage_type": storage_type
        }
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Document upload error: {error_msg}")
        
        # Provide helpful error message for Cloudinary errors
        if "Invalid cloud_name" in error_msg or "Invalid credentials" in error_msg:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary configuration error: {error_msg}. Please verify your Cloudinary credentials are correct in .env file"
            )
        
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/user/documents")
async def get_user_documents(current_user: dict = Depends(get_current_user)):
    """Get user documents"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        documents = DatabaseService.get_user_documents(user_id)
        
        # Convert MongoDB _id to string if present
        formatted_documents = []
        for doc in documents:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            formatted_documents.append(doc)
        
        print(f"[DEBUG] Returning {len(formatted_documents)} documents for user {user_id}")
        return {"documents": formatted_documents}
    except Exception as e:
        print(f"[ERROR] Error getting documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/user/documents/{document_id}")
async def delete_user_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Delete user document"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        print(f"[DELETE] Attempting to delete document_id: {document_id} for user: {user_id}")
        
        # Call database service to delete document
        success = DatabaseService.delete_user_document(document_id, user_id)
        
        print(f"[DELETE] Delete result: {success}")
        
        if success:
            return {"message": "Document deleted successfully"}
        else:
            print(f"[DELETE] Document not found: {document_id}")
            raise HTTPException(status_code=404, detail="Document not found or access denied")
    except Exception as e:
        print(f"[ERROR] Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Admin Endpoints ============

@app.get("/admin/submissions")
async def get_all_submissions(form_id: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(require_admin)):
    """Get all submissions (admin only)"""
    submissions = DatabaseService.get_all_submissions(form_id=form_id, status=status)
    
    # Enhance submissions with user information
    enhanced_submissions = []
    for submission in submissions:
        enhanced_submission = submission.copy()
        
        # Get user information if user_id exists
        if submission.get("user_id"):
            user = UserService.get_user(submission["user_id"])
            if user:
                enhanced_submission["user_email"] = user.get("email")
                enhanced_submission["user_name"] = user.get("name")
                enhanced_submission["user_phone"] = user.get("phone")
        
        # Get form information
        if submission.get("form_id") and submission["form_id"] in FORMS_DB:
            form_info = FORMS_DB[submission["form_id"]]
            enhanced_submission["form_title"] = form_info.get("title", submission["form_id"])
            enhanced_submission["form_description"] = form_info.get("description", "")
        
        enhanced_submissions.append(enhanced_submission)
    
    return {"count": len(enhanced_submissions), "submissions": enhanced_submissions}

@app.get("/admin/tickets")
async def get_all_tickets(current_user: dict = Depends(require_admin)):
    """Get all help tickets (admin only)"""
    try:
        print(f"[DEBUG] Admin tickets request from user: {current_user.get('email')}")
        
        # Get all tickets from database
        tickets = DatabaseService.get_all_tickets()
        print(f"[DEBUG] Raw tickets from database: {len(tickets)} tickets")
        print(f"[DEBUG] Sample ticket: {tickets[0] if tickets else 'No tickets'}")
        
        # Enhance tickets with user information
        enhanced_tickets = []
        for ticket in tickets:
            enhanced_ticket = ticket.copy()
            
            # Get user information if user_id exists
            if ticket.get("user_id"):
                user = UserService.get_user(ticket["user_id"])
                if user:
                    enhanced_ticket["user_email"] = user.get("email")
                    enhanced_ticket["user_name"] = user.get("name")
                    enhanced_ticket["user_phone"] = user.get("phone")
                else:
                    print(f"[DEBUG] User not found for user_id: {ticket.get('user_id')}")
            
            enhanced_tickets.append(enhanced_ticket)
        
        print(f"[DEBUG] Enhanced tickets count: {len(enhanced_tickets)}")
        return {"count": len(enhanced_tickets), "tickets": enhanced_tickets}
    except Exception as e:
        print(f"[DEBUG] Error getting tickets: {e}")
        import traceback
        traceback.print_exc()
        return {"count": 0, "tickets": []}

@app.get("/admin/messages")
async def get_all_messages(current_user: dict = Depends(require_admin)):
    """Get all chat messages (admin only)"""
    try:
        print(f"[DEBUG] Admin messages request from user: {current_user.get('email')}")
        
        # Get all chat messages from database
        messages = ChatDatabaseService.get_chat_messages()
        print(f"[DEBUG] Raw messages from database: {len(messages)} messages")
        print(f"[DEBUG] Sample message: {messages[0] if messages else 'No messages'}")
        
        # Enhance messages with user information
        enhanced_messages = []
        for message in messages:
            enhanced_message = message.copy()
            
            # Get user information if user_id exists
            if message.get("user_id"):
                user = UserService.get_user(message["user_id"])
                if user:
                    enhanced_message["user_email"] = user.get("email")
                    enhanced_message["user_name"] = user.get("name")
                    enhanced_message["user_phone"] = user.get("phone")
                else:
                    print(f"[DEBUG] User not found for user_id: {message.get('user_id')}")
            
            enhanced_messages.append(enhanced_message)
        
        print(f"[DEBUG] Enhanced messages count: {len(enhanced_messages)}")
        return {"count": len(enhanced_messages), "messages": enhanced_messages}
    except Exception as e:
        print(f"[DEBUG] Error getting messages: {e}")
        import traceback
        traceback.print_exc()
        return {"count": 0, "messages": []}

@app.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    """Get all users (admin only)"""
    users = DatabaseService.get_all_users()
    return {"count": len(users), "users": users}

@app.get("/admin/feedbacks")
async def get_all_feedbacks(current_user: dict = Depends(require_admin)):
    """Get all feedbacks (admin only)"""
    try:
        print(f"[DEBUG] Admin feedbacks request from user: {current_user.get('email')}")
        
        # Get all feedbacks from database
        feedbacks = DatabaseService.get_all_feedbacks()
        print(f"[DEBUG] Raw feedbacks from database: {len(feedbacks)} feedbacks")
        print(f"[DEBUG] Sample feedback: {feedbacks[0] if feedbacks else 'No feedbacks'}")
        
        # Enhance feedbacks with user information
        enhanced_feedbacks = []
        for feedback in feedbacks:
            enhanced_feedback = feedback.copy()
            
            # Get user information if user_id exists
            if feedback.get("user_id"):
                user = UserService.get_user(feedback["user_id"])
                if user:
                    enhanced_feedback["user_email"] = user.get("email")
                    enhanced_feedback["user_name"] = user.get("name")
                    enhanced_feedback["user_phone"] = user.get("phone")
                else:
                    print(f"[DEBUG] User not found for user_id: {feedback.get('user_id')}")
            
            enhanced_feedbacks.append(enhanced_feedback)
        
        print(f"[DEBUG] Enhanced feedbacks count: {len(enhanced_feedbacks)}")
        return {"count": len(enhanced_feedbacks), "feedbacks": enhanced_feedbacks}
    except Exception as e:
        print(f"[DEBUG] Error getting feedbacks: {e}")
        import traceback
        traceback.print_exc()
        return {"count": 0, "feedbacks": []}

@app.post("/admin/tickets/{ticket_id}/reply")
async def reply_to_help_ticket(ticket_id: str, request: dict, background_tasks: BackgroundTasks, current_user: dict = Depends(require_admin)):
    """Reply to help ticket (admin only)"""
    try:
        # Get ticket details and user email
        # For now, we'll use mock data - in production, get from database
        user_email = request.get("user_email", "user@example.com")
        user_name = request.get("user_name", "User")
        ticket_subject = request.get("subject", "Help Request")
        admin_reply = request.get("reply", "")
        
        # Send email notification to user
        if user_email and admin_reply:
            background_tasks.add_task(
                EmailService.send_help_ticket_response,
                user_email,
                ticket_id,
                ticket_subject,
                admin_reply,
                user_name
            )
            print(f"[EMAIL] Help ticket response sent to {user_email}")
        
        return {"message": "Reply sent successfully", "ticket_id": ticket_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/feedbacks/{feedback_id}/reply")
async def reply_to_feedback(feedback_id: str, request: dict, background_tasks: BackgroundTasks, current_user: dict = Depends(require_admin)):
    """Reply to feedback (admin only)"""
    try:
        # Get feedback details and user email
        # For now, we'll use mock data - in production, get from database
        user_email = request.get("user_email", "user@example.com")
        user_name = request.get("user_name", "User")
        feedback_type = request.get("feedback_type", "general")
        admin_reply = request.get("reply", "")
        
        # Send email notification to user
        if user_email and admin_reply:
            background_tasks.add_task(
                EmailService.send_feedback_response,
                user_email,
                feedback_id,
                feedback_type,
                admin_reply,
                user_name
            )
            print(f"[EMAIL] Feedback response sent to {user_email}")
        
        return {"message": "Reply sent successfully", "feedback_id": feedback_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Help Ticket Endpoints ============

class CreateTicketRequest(BaseModel):
    subject: str
    description: str
    priority: str = "medium"

@app.post("/user/tickets")
async def create_help_ticket(request: CreateTicketRequest, current_user: dict = Depends(get_current_user)):
    """Create a help ticket"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        print(f"[DEBUG] Creating help ticket for user: {user_id}")
        print(f"[DEBUG] Ticket data: {request.model_dump()}")
        
        ticket_id = f"TKT{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8].upper()}"
        
        ticket = DatabaseService.save_help_ticket(
            ticket_id=ticket_id,
            user_id=user_id,
            subject=request.subject,
            description=request.description,
            priority=request.priority
        )
        
        print(f"[DEBUG] Ticket created successfully: {ticket}")
        return {"message": "Help ticket created successfully", "ticket_id": ticket_id, "ticket": ticket}
    except Exception as e:
        error_msg = str(e)
        print(f"[DEBUG] Error creating help ticket: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating help ticket: {error_msg}")

@app.get("/user/tickets")
async def get_user_tickets(current_user: dict = Depends(get_current_user)):
    """Get user's help tickets"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Get all tickets and filter by user
        all_tickets = DatabaseService.get_all_tickets()
        user_tickets = [t for t in all_tickets if t.get("user_id") == user_id]
        
        return {"tickets": user_tickets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Feedback Endpoints ============

class CreateFeedbackRequest(BaseModel):
    feedback_type: str
    message: str
    rating: int = None

@app.post("/user/feedbacks")
async def create_feedback(request: CreateFeedbackRequest, current_user: dict = Depends(get_current_user)):
    """Create feedback"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        print(f"[DEBUG] Creating feedback for user: {user_id}")
        print(f"[DEBUG] Feedback data: {request.model_dump()}")
        
        feedback_id = f"FB{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8].upper()}"
        
        feedback = DatabaseService.save_feedback(
            feedback_id=feedback_id,
            user_id=user_id,
            feedback_type=request.feedback_type,
            message=request.message,
            rating=request.rating
        )
        
        print(f"[DEBUG] Feedback created successfully: {feedback}")
        return {"message": "Feedback submitted successfully", "feedback_id": feedback_id, "feedback": feedback}
    except Exception as e:
        error_msg = str(e)
        print(f"[DEBUG] Error creating feedback: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating feedback: {error_msg}")

@app.get("/user/feedbacks")
async def get_user_feedbacks(current_user: dict = Depends(get_current_user)):
    """Get user's feedbacks"""
    try:
        user_id = current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Get all feedbacks and filter by user
        all_feedbacks = DatabaseService.get_all_feedbacks()
        user_feedbacks = [f for f in all_feedbacks if f.get("user_id") == user_id]
        
        return {"feedbacks": user_feedbacks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Chat Message Endpoints ============

@app.post("/chat/messages")
async def send_chat_message(request: dict, current_user: dict = Depends(get_current_user)):
    """Send a chat message"""
    try:
        # Get user_id from request body (for admin sending to user) or current_user (for user sending)
        user_id = request.get("user_id") or current_user.get("user_id") or current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        print(f"[DEBUG] Creating chat message for user: {user_id}")
        print(f"[DEBUG] Message data: {request}")
        print(f"[DEBUG] Current user: {current_user}")
        
        message_id = f"MSG{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8].upper()}"
        sender = request.get("sender", "user")
        text = request.get("text", "")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Message text is required")
        
        message = ChatDatabaseService.save_chat_message(
            message_id=message_id,
            user_id=user_id,
            sender=sender,
            text=text
        )
        
        print(f"[DEBUG] Message created successfully: {message}")
        return {"message": "Message sent successfully", "message_id": message_id}
    except Exception as e:
        error_msg = str(e) if str(e) else f"Unknown error: {type(e).__name__}"
        print(f"[DEBUG] Error creating chat message: {error_msg}")
        import traceback
        traceback.print_exc()
        print(f"[DEBUG] Exception type: {type(e)}")
        print(f"[DEBUG] Exception args: {e.args}")
        raise HTTPException(status_code=500, detail=f"Error creating chat message: {error_msg}")

@app.get("/chat/messages")
async def get_chat_messages(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get chat messages"""
    try:
        # Get current user's ID
        current_user_id = current_user.get("user_id") or current_user.get("id")
        
        if user_id:
            # Admin requesting messages for specific user
            messages = ChatDatabaseService.get_chat_messages(user_id)
        else:
            # User requesting their own messages
            if current_user_id:
                messages = ChatDatabaseService.get_chat_messages(current_user_id)
            else:
                messages = []
        
        print(f"[DEBUG] Getting chat messages for user_id: {current_user_id or user_id}")
        print(f"[DEBUG] Found {len(messages)} messages")
        
        return {"messages": messages}
    except Exception as e:
        print(f"[DEBUG] Error getting chat messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/users")
async def get_chat_users(current_user: dict = Depends(get_current_user)):
    """Get chat users"""
    try:
        users = ChatDatabaseService.get_chat_users()
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chat/messages/{message_id}")
async def delete_chat_message(message_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat message"""
    try:
        result = ChatDatabaseService.delete_chat_message(message_id)
        if result:
            return {"message": "Message deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Message not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class StatusUpdateRequest(BaseModel):
    status: str
    message: str

@app.put("/admin/submissions/{tracking_id}/status")
async def update_submission_status(tracking_id: str, request: StatusUpdateRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(require_admin)):
    """Update submission status (admin only)"""
    try:
        submission = DatabaseService.update_submission_status(tracking_id, request.status, request.message)
        
        if submission and submission.get("user_id"):
            user = UserService.get_user(submission["user_id"])
            if user:
                background_tasks.add_task(
                    EmailService.send_status_update,
                    user["email"],
                    tracking_id,
                    request.status,
                    request.message
                )
        
        return submission
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/submissions/{tracking_id}")
async def delete_submission(tracking_id: str, current_user: dict = Depends(require_admin)):
    """Delete submission (admin only)"""
    try:
        # Delete from database
        result = DatabaseService.delete_submission(tracking_id)
        
        if result:
            return {"message": "Submission deleted successfully", "tracking_id": tracking_id}
        else:
            raise HTTPException(status_code=404, detail="Submission not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/test-pdf")
async def test_pdf_generation(current_user: dict = Depends(require_admin)):
    """Test PDF generation endpoint"""
    try:
        import tempfile
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from fastapi.responses import FileResponse
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_path = temp_file.name
        temp_file.close()
        
        c = canvas.Canvas(temp_path, pagesize=letter)
        c.drawString(100, 750, "Test PDF Generation")
        c.drawString(100, 700, "This is a test PDF from the backend")
        c.drawString(100, 650, f"Generated at: {datetime.now()}")
        c.save()
        
        return FileResponse(
            path=temp_path,
            filename="test.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test PDF generation failed: {str(e)}")

@app.get("/admin/submissions/{tracking_id}/pdf")
async def download_submission_pdf(tracking_id: str, current_user: dict = Depends(require_admin)):
    """Download submission PDF (admin only)"""
    try:
        print(f"[Admin PDF] Download request for tracking ID: {tracking_id}")
        
        # Get submission details
        submission = DatabaseService.get_submission(tracking_id)
        if not submission:
            print(f"[Admin PDF] Submission not found: {tracking_id}")
            raise HTTPException(status_code=404, detail="Submission not found")
        
        print(f"[Admin PDF] Found submission: {submission}")
        
        # Generate PDF if not exists
        try:
            from services.pdf_service import PDFService
            pdf_path = PDFService.generate_form_pdf(
                submission["form_id"],
                submission["data"],
                submission["tracking_id"]
            )
            print(f"[Admin PDF] PDF generated at: {pdf_path}")
            
            if pdf_path and not pdf_path.startswith("mock_"):
                # Return file download
                from fastapi.responses import FileResponse
                print(f"[Admin PDF] Returning file: {pdf_path}")
                return FileResponse(
                    path=pdf_path,
                    filename=f"{tracking_id}.pdf",
                    media_type="application/pdf"
                )
        except Exception as pdf_error:
            print(f"[Admin PDF] PDF service error: {pdf_error}")
            print(f"[Admin PDF] Falling back to simple PDF generation")
        
        # Fallback: Generate temporary PDF for download
        try:
            import tempfile
            import os
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_path = temp_file.name
            temp_file.close()
            
            print(f"[Admin PDF] Creating fallback PDF at: {temp_path}")
            
            # Create a simple PDF with form data
            c = canvas.Canvas(temp_path, pagesize=letter)
            c.drawString(100, 750, f"Form Submission: {tracking_id}")
            c.drawString(100, 700, f"Form Type: {submission['form_id']}")
            c.drawString(100, 650, f"Status: {submission['status']}")
            c.drawString(100, 600, f"Submitted: {submission['created_at']}")
            
            y_position = 550
            c.drawString(100, y_position, "Form Data:")
            y_position -= 30
            
            # Safely iterate through form data
            form_data = submission.get("data", {})
            if not isinstance(form_data, dict):
                form_data = {}
                
            for key, value in form_data.items():
                if y_position < 100:
                    c.showPage()
                    y_position = 750
                
                # Safely convert value to string
                try:
                    value_str = str(value) if value is not None else "N/A"
                except:
                    value_str = "N/A"
                
                c.drawString(120, y_position, f"{key}: {value_str}")
                y_position -= 20
            
            c.save()
            print(f"[Admin PDF] Fallback PDF created successfully")
            
            return FileResponse(
                path=temp_path,
                filename=f"{tracking_id}.pdf",
                media_type="application/pdf"
            )
            
        except Exception as fallback_error:
            print(f"[Admin PDF] Fallback PDF generation failed: {fallback_error}")
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(fallback_error)}")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Admin PDF] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============ Admin Setup ============

@app.post("/admin/setup")
async def setup_admin(current_user: dict = Depends(get_current_user)):
    """Make current user an admin (for development)"""
    try:
        # This is a development-only endpoint
        # In production, you'd want proper admin creation process
        from config import ADMIN_EMAIL
        
        # Only allow if user email matches admin email or if no admin exists yet
        if current_user.get("email") == ADMIN_EMAIL:
            # Create new token with admin privileges
            new_token = AuthService.create_token(
                current_user["user_id"], 
                current_user["email"], 
                True
            )
            return {
                "message": "Admin privileges granted",
                "token": new_token,
                "isAdmin": True
            }
        else:
            raise HTTPException(
                status_code=403, 
                detail="Only designated admin email can access this endpoint"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Health Check ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/test-cloudinary")
async def test_cloudinary():
    """Test Cloudinary configuration"""
    try:
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET
        )
        
        # Test configuration
        return {
            "status": "success",
            "cloud_name": CLOUDINARY_CLOUD_NAME,
            "api_key": CLOUDINARY_API_KEY[:10] + "...",  # Only show first 10 chars for security
            "message": "Cloudinary configuration loaded successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "cloud_name": CLOUDINARY_CLOUD_NAME,
            "api_key": CLOUDINARY_API_KEY[:10] + "..." if CLOUDINARY_API_KEY else "Not set"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)

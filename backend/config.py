import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DB_TYPE = os.getenv("DB_TYPE", "mongodb")  # mock, mongodb, postgresql
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/legal_voice")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/legal_voice")

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GPT_MODEL = os.getenv("GPT_MODEL", "gpt-4")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "whisper-1")

# Authentication
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# Email Service (Gmail SMTP)
EMAIL_SERVICE = os.getenv("EMAIL_SERVICE", "smtp")  # smtp, sendgrid, mailgun, etc.
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreplay@legalvoice.com")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
# SMS Service (Twilio)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")

# File Storage (Cloudinary)
# Get your credentials from: https://console.cloudinary.com/settings/api-keys
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "False") == "True"

# File Storage
USE_GRIDFS = os.getenv("USE_GRIDFS", "true").lower() == "true"
AUDIO_STORAGE_PATH = os.getenv("AUDIO_STORAGE_PATH", "./data/audio")

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

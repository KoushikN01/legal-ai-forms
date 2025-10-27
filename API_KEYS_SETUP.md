# API Keys Setup Guide for LegalVoice

## Current Status
✅ **Frontend**: Fully working with mock data
✅ **Backend**: Running with mock transcription
✅ **UI**: Professional and advanced design complete

## API Keys You Need to Integrate

### 1. **Speech-to-Text (Choose One)**

#### Option A: Google Cloud Speech-to-Text (Recommended)
- **Service**: Google Cloud Speech API
- **Cost**: Pay-as-you-go (~$0.006 per 15 seconds)
- **Setup**:
  1. Go to https://console.cloud.google.com
  2. Create a new project
  3. Enable "Cloud Speech-to-Text API"
  4. Create a Service Account and download JSON key
  5. Set environment variable: `GOOGLE_SPEECH_API_KEY`

#### Option B: OpenAI Whisper API
- **Service**: OpenAI Whisper
- **Cost**: $0.02 per minute
- **Setup**:
  1. Go to https://platform.openai.com/api-keys
  2. Create API key
  3. Set environment variable: `OPENAI_API_KEY`

#### Option C: BHASHINI (For Indian Languages)
- **Service**: BHASHINI Cloud STT
- **Cost**: Free tier available
- **Setup**:
  1. Register at https://bhashini.gov.in
  2. Get API key
  3. Set environment variable: `BHASHINI_API_KEY`

### 2. **SMS Notifications (Optional)**

#### Twilio
- **Service**: SMS notifications
- **Cost**: ~$0.0075 per SMS
- **Setup**:
  1. Go to https://www.twilio.com
  2. Create account and get credentials
  3. Set environment variables:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`

### 3. **Email Notifications (Optional)**

#### SendGrid
- **Service**: Email notifications
- **Cost**: Free tier (100 emails/day)
- **Setup**:
  1. Go to https://sendgrid.com
  2. Create account and get API key
  3. Set environment variable: `SENDGRID_API_KEY`

### 4. **Database (Optional - For Production)**

#### MongoDB Atlas
- **Service**: Cloud database
- **Cost**: Free tier available
- **Setup**:
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create cluster
  3. Set environment variable: `MONGODB_URI`

#### PostgreSQL (Neon)
- **Service**: Cloud PostgreSQL
- **Cost**: Free tier available
- **Setup**:
  1. Go to https://neon.tech
  2. Create project
  3. Set environment variable: `DATABASE_URL`

## Environment Variables Setup

### Backend (.env file)
\`\`\`
# Speech-to-Text (choose one)
GOOGLE_SPEECH_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here
# OR
BHASHINI_API_KEY=your_key_here

# Notifications (optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

SENDGRID_API_KEY=your_key_here

# Database (optional)
MONGODB_URI=your_connection_string
DATABASE_URL=your_connection_string

# App Config
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
\`\`\`

### Frontend (.env.local file)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=LegalVoice
NEXT_PUBLIC_ENVIRONMENT=development
\`\`\`

## How to Add API Keys

### Step 1: Get Your API Keys
1. Choose your preferred speech-to-text service
2. Sign up and get API key
3. Get optional notification service keys

### Step 2: Update Backend
1. Create `.env` file in `/backend` folder
2. Add your API keys (see template above)
3. Restart backend: `python app.py`

### Step 3: Update Frontend
1. Create `.env.local` file in root folder
2. Add `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Restart frontend: `npm run dev`

## Testing Without API Keys

The app works perfectly with mock data:
- ✅ Form selection works
- ✅ Voice recording works (uses Web Speech API - no key needed)
- ✅ Form mapping works
- ✅ Submission tracking works
- ✅ All UI is fully functional

**To test with real transcription**, add one of the speech-to-text API keys.

## Integration Code Examples

### Using Google Speech-to-Text
\`\`\`python
from google.cloud import speech_v1

def transcribe_audio_google(filepath: str) -> dict:
    client = speech_v1.SpeechClient()
    
    with open(filepath, "rb") as audio_file:
        content = audio_file.read()
    
    audio = speech_v1.RecognitionAudio(content=content)
    config = speech_v1.RecognitionConfig(
        encoding=speech_v1.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code="en-US",
    )
    
    response = client.recognize(config=config, audio=audio)
    
    return {
        "text": response.results[0].alternatives[0].transcript if response.results else "",
        "language": "en",
        "confidence": response.results[0].alternatives[0].confidence if response.results else 0
    }
\`\`\`

### Using OpenAI Whisper
\`\`\`python
import openai

def transcribe_audio_whisper(filepath: str) -> dict:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    with open(filepath, "rb") as audio_file:
        transcript = openai.Audio.transcribe("whisper-1", audio_file)
    
    return {
        "text": transcript["text"],
        "language": "en",
        "confidence": 0.95
    }
\`\`\`

## What Works Right Now (Without API Keys)

1. **Frontend UI** - 100% functional
2. **Form Selection** - Works perfectly
3. **Voice Recording** - Uses browser's Web Speech API (no key needed)
4. **Form Mapping** - Works with mock data
5. **Submission Tracking** - Works with mock submissions
6. **All Animations & Styling** - Fully working

## What Needs API Keys

1. **Real Speech-to-Text** - Currently uses mock transcription
2. **SMS Notifications** - Currently logs to console
3. **Email Notifications** - Currently logs to console
4. **Persistent Database** - Currently uses in-memory storage

## Recommended Setup for Testing

1. **Start with Google Speech-to-Text** (most reliable)
2. **Add Twilio** for SMS notifications (optional)
3. **Use MongoDB Atlas** for persistent storage (optional)

## Support

For issues with specific API services:
- Google Cloud: https://cloud.google.com/speech-to-text/docs
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text
- BHASHINI: https://bhashini.gov.in/docs
- Twilio: https://www.twilio.com/docs

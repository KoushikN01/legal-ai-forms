# Complete Legal Voice App - Setup Guide

## Overview
This is a complete voice-enabled legal form application with:
- Multi-language voice input (Hindi, English, Tamil, etc.)
- OpenAI GPT-4 for intelligent field mapping and validation
- Real legal forms with specific required fields
- Complete authentication (Google, Aadhar, Email/Password)
- PDF generation and email delivery
- Admin portal with real-time updates
- WebSocket-based chat between admin and users
- Account recovery and OTP-based login

## Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB or PostgreSQL (optional - can use mock database)
- OpenAI API key
- SendGrid API key (for email)
- Google OAuth credentials (optional)

## Quick Start (5 minutes)

### 1. Clone and Setup Frontend
\`\`\`bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Update NEXT_PUBLIC_API_URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Run frontend
npm run dev
# Frontend runs on http://localhost:3000
\`\`\`

### 2. Setup Backend
\`\`\`bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env

# Update .env with your API keys
# At minimum, add:
# OPENAI_API_KEY=sk-your-key
# SENDGRID_API_KEY=SG-your-key

# Run backend
python app.py
# Backend runs on http://localhost:8000
\`\`\`

## API Keys Setup

### 1. OpenAI API Key (Required)
- Go to https://platform.openai.com/api-keys
- Create new API key
- Add to backend/.env: `OPENAI_API_KEY=sk-...`

### 2. SendGrid API Key (For Email Notifications)
- Go to https://sendgrid.com
- Create account and API key
- Add to backend/.env: `SENDGRID_API_KEY=SG-...`

### 3. Google OAuth (Optional - For Google Login)
- Go to https://console.cloud.google.com
- Create OAuth 2.0 credentials
- Add to backend/.env:
  \`\`\`
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  \`\`\`

### 4. MongoDB (Optional - For Persistent Storage)
- Go to https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Add to backend/.env: `MONGODB_URI=mongodb+srv://...`
- Set `DB_TYPE=mongodb`

### 5. Twilio (Optional - For SMS OTP)
- Go to https://www.twilio.com
- Create account and get credentials
- Add to backend/.env:
  \`\`\`
  TWILIO_ACCOUNT_SID=...
  TWILIO_AUTH_TOKEN=...
  TWILIO_PHONE_NUMBER=+1...
  \`\`\`

## Features Implemented

### Authentication
- Email/Password signup and signin
- Google OAuth login
- Aadhar OTP login
- JWT token management
- Password reset via email
- Account recovery

### Voice Forms
- 6 real legal forms with specific fields
- Voice recording with real-time transcription
- OpenAI Whisper for speech-to-text
- GPT-4 for intelligent field mapping
- Multi-language support
- Form validation

### Submission Management
- Unique tracking IDs
- PDF generation
- Email delivery
- Status tracking
- Submission history

### Admin Portal
- View all submissions
- Update submission status
- Send status notifications
- User management

### User Support
- Help & FAQ section
- Support ticket system
- Contact form
- Real-time chat (WebSocket ready)

### Security
- JWT authentication
- Password hashing
- CORS protection
- Input validation
- Rate limiting ready

## Project Structure

\`\`\`
legal-voice-app/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Home page
│   ├── auth/page.tsx            # Login/Signup
│   ├── forms/page.tsx           # Form selection
│   ├── record/[form_id]/page.tsx # Voice recording
│   ├── review/[form_id]/page.tsx # Form review
│   ├── track/page.tsx           # Submission tracking
│   ├── admin/page.tsx           # Admin dashboard
│   ├── help/page.tsx            # Help & support
│   ├── contact/page.tsx         # Contact page
│   ├── account-recovery/page.tsx # Password recovery
│   └── layout.tsx               # Root layout
├── components/
│   ├── auth/                    # Auth components
│   ├── form-chooser.tsx         # Form selection
│   ├── recorder.tsx             # Voice recorder
│   ├── review-form.tsx          # Form review
│   └── tracker.tsx              # Submission tracker
├── lib/
│   ├── auth-context.tsx         # Auth state management
│   ├── api-client.ts            # API client
│   └── form-mapper.ts           # Form field mapping
├── backend/
│   ├── app.py                   # FastAPI main app
│   ├── config.py                # Configuration
│   ├── database.py              # Database service
│   ├── services/
│   │   ├── auth_service.py      # Authentication
│   │   ├── openai_service.py    # OpenAI integration
│   │   ├── email_service.py     # Email notifications
│   │   ├── pdf_service.py       # PDF generation
│   │   └── user_service.py      # User management
│   ├── data/forms/              # Form templates
│   └── requirements.txt         # Python dependencies
└── public/                      # Static assets
\`\`\`

## Real Legal Forms Included

1. **Name Change Affidavit** - For official name changes
2. **Property Dispute Plaint** - For property disputes
3. **Traffic Fine Appeal** - For traffic challan appeals
4. **Mutual Divorce Petition** - For divorce intake
5. **General Affidavit** - For sworn statements
6. **Gazette Application** - For gazette notifications

## Testing the App

### Test Flow
1. Go to http://localhost:3000
2. Click "Sign Up" and create account
3. Select a form
4. Click record button and speak your answers
5. Review filled form
6. Submit
7. Get tracking ID
8. Check admin dashboard to update status

### Test Data
- Email: test@example.com
- Password: Test123!
- Forms: All 6 forms available with mock data

## Deployment

### Frontend (Vercel)
\`\`\`bash
npm run build
# Push to GitHub
# Connect to Vercel
# Deploy automatically
\`\`\`

### Backend (Railway/Render)
\`\`\`bash
# Push to GitHub
# Connect to Railway/Render
# Set environment variables
# Deploy automatically
\`\`\`

## Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running on port 8000
- Check CORS settings in backend/app.py
- Verify NEXT_PUBLIC_API_URL in .env.local

### "OpenAI API error"
- Verify OPENAI_API_KEY is correct
- Check API key has sufficient credits
- Ensure GPT_MODEL is available in your account

### "Email not sending"
- Verify SENDGRID_API_KEY is correct
- Check sender email is verified in SendGrid
- Review SendGrid logs for errors

### "Database connection failed"
- Verify MONGODB_URI or DATABASE_URL
- Check database is running
- Ensure network access is allowed

## Next Steps

1. Add your API keys to backend/.env
2. Test the complete flow
3. Customize forms for your use case
4. Deploy to production
5. Set up monitoring and logging

## Support

For issues or questions:
- Check COMPLETE_SETUP_GUIDE.md
- Review API_KEYS_SETUP.md
- Check backend logs
- Create support ticket in app

## License

MIT License - See LICENSE file for details

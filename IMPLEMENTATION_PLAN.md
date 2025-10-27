# Complete Legal Voice App - Implementation Plan

## Project Overview
A voice-enabled legal form application with:
- Multi-language voice input (Hindi, English, Tamil, etc.)
- OpenAI GPT-4 for intelligent field mapping and validation
- Real legal forms with specific required fields
- Complete authentication (Google, Aadhar, Email/Password)
- PDF generation and email delivery
- Admin portal with real-time updates
- WebSocket-based chat between admin and users
- Account recovery and OTP-based login

## Technology Stack
- **Frontend**: Next.js + React + TypeScript
- **Backend**: FastAPI + Python
- **Database**: MongoDB (no AWS needed)
- **APIs**: OpenAI (GPT-4 + Whisper), SendGrid (email), Twilio (SMS optional)
- **Real-time**: WebSocket for chat
- **PDF**: ReportLab or similar

## Implementation Phases

### Phase 1: Core Authentication & Setup
- [ ] Google OAuth integration
- [ ] Aadhar login form with OTP
- [ ] Email/Password signup & signin
- [ ] JWT token management
- [ ] User session management

### Phase 2: Voice Recording & Transcription
- [ ] Audio recording component
- [ ] OpenAI Whisper integration
- [ ] Language detection
- [ ] Transcript display with evidence

### Phase 3: Form Management & GPT Integration
- [ ] MongoDB form templates setup
- [ ] GPT-4 field extraction & mapping
- [ ] Form validation (local + GPT)
- [ ] Missing field detection
- [ ] Follow-up question generation

### Phase 4: PDF Generation & Email
- [ ] PDF generation from filled forms
- [ ] Email service integration (SendGrid)
- [ ] Form delivery via email
- [ ] Tracking ID generation
- [ ] Status notifications

### Phase 5: Admin Portal
- [ ] Admin dashboard
- [ ] User management (CRUD)
- [ ] Submission tracking
- [ ] Status update functionality
- [ ] Email notifications on status change

### Phase 6: Real-time Features
- [ ] WebSocket setup
- [ ] Admin-user chat
- [ ] Real-time notifications
- [ ] Feedback & help tickets

### Phase 7: Account Recovery & Security
- [ ] Email-based password reset
- [ ] OTP-based mobile login (optional)
- [ ] Account recovery flow
- [ ] Audit logging

### Phase 8: UI/UX Enhancement
- [ ] Professional legal-themed design
- [ ] Legal imagery integration
- [ ] Responsive design
- [ ] Accessibility improvements

## Real Legal Forms (6 forms)
1. name_change - Name Change Affidavit
2. property_dispute_simple - Property Dispute Plaint
3. traffic_fine_appeal - Traffic Fine Appeal
4. mutual_divorce_petition - Divorce Petition (Intake)
5. affidavit_general - General Affidavit
6. name_change_gazette - Gazette Application

## Environment Variables Required
\`\`\`
OPENAI_API_KEY=your_key
GPT_MODEL=gpt-4
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret
SENDGRID_API_KEY=your_key
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
AADHAR_API_KEY=your_key (optional)
TWILIO_ACCOUNT_SID=your_sid (optional)
TWILIO_AUTH_TOKEN=your_token (optional)
\`\`\`

## Database Collections
- forms (form templates)
- users (user accounts)
- submissions (filled forms)
- legal_texts (help text)
- audit_logs (activity tracking)
- chat_messages (admin-user chat)
- help_tickets (support tickets)

## API Endpoints (Backend)
- POST /auth/google - Google login
- POST /auth/aadhar - Aadhar login
- POST /auth/signup - Email signup
- POST /auth/signin - Email signin
- POST /transcribe - Audio to text
- POST /interpret - GPT field mapping
- POST /validate - Form validation
- POST /submit - Submit form
- GET /track/{tracking_id} - Track submission
- POST /followup - Generate follow-up questions
- GET /forms - List all forms
- GET /forms/{form_id} - Get form template
- POST /admin/users - Get all users (admin)
- PUT /admin/submissions/{id}/status - Update status (admin)
- POST /chat - Send message (WebSocket)
- POST /help-ticket - Create support ticket
- POST /account-recovery - Request password reset
- POST /reset-password - Reset password with token

## Frontend Pages
- / - Home page
- /auth - Login/Signup
- /forms - Form selection
- /record/{form_id} - Voice recording
- /review/{form_id} - Form review
- /track - Submission tracking
- /admin - Admin dashboard
- /admin/users - User management
- /admin/submissions - Submission management
- /account-recovery - Password recovery
- /help - Help & feedback

## Success Criteria
- All 6 forms working with voice input
- GPT-4 correctly mapping 90%+ of fields
- Email delivery working
- Admin portal fully functional
- Real-time chat operational
- PDF generation working
- All authentication methods functional

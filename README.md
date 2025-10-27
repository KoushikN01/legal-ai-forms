# LegalVoice - Voice-Powered Legal Forms

A comprehensive web application that enables users to fill legal forms using voice input in their preferred Indian language. The app uses AI-powered speech-to-text technology, intelligent form mapping with GPT-4, real-time chat support, and complete submission tracking with admin management.

## ✨ Key Features

### 🎤 Voice Input & AI Processing
- **Multilingual Voice Recording**: Support for 10+ Indian languages (Hindi, Tamil, Telugu, Kannada, Malayalam, etc.)
- **Conversational Form Filling**: Field-by-field guided voice input with AI translation
- **GPT-4 Powered Extraction**: Intelligent field mapping and validation using OpenAI
- **Real-time Transcription**: Instant speech-to-text with Web Speech API

### 📋 Complete Form Management
- **6 Legal Forms**: Name Change, Property Dispute, Traffic Fine Appeal, Divorce Petition, General Affidavit, Gazette Application
- **Smart Validation**: Comprehensive validation for all field types
- **PDF Generation**: Automatic PDF creation and download after submission
- **File Upload**: Cloudinary integration for document attachments
- **Checkbox Confirmation**: Users must confirm all fields before submission

### 👤 User Features
- **Authentication**: Email/Password, Google OAuth, and Aadhar login
- **Profile Management**: Photo upload, edit details, settings
- **Real-time Chat**: WebSocket-based live chat with admin support
- **Help & Support**: Ticket system, feedback with ratings, comprehensive FAQ
- **Submission Tracking**: Real-time status updates with email notifications

### 🛡️ Admin Portal
- **User Management**: View and manage all user accounts
- **Submission Review**: CRUD operations on form submissions
- **Status Updates**: Update submission status with notifications
- **Real-time Chat**: Respond to user queries instantly
- **Analytics Dashboard**: Track submissions and user activity

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15+ with React 19
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Language**: TypeScript
- **Speech**: Web Speech API + OpenAI Whisper
- **Real-time**: Socket.io-client for WebSocket
- **PDF**: jsPDF for document generation
- **File Upload**: Cloudinary integration

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB / PostgreSQL (configurable)
- **AI**: OpenAI GPT-4 for translation and extraction
- **Email**: SendGrid for notifications
- **WebSocket**: Socket.io for real-time chat
- **Authentication**: JWT tokens

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB or PostgreSQL
- OpenAI API key

### Quick Start

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd legal-voice-app
\`\`\`

2. **Install frontend dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Install backend dependencies**
\`\`\`bash
cd backend
pip install -r requirements.txt
cd ..
\`\`\`

4. **Configure environment variables**

Create `.env.local` in root:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=legal_docs
\`\`\`

Create `backend/.env`:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/legalvoice
OPENAI_API_KEY=sk-your_openai_key_here
SENDGRID_API_KEY=SG.your_sendgrid_key
FROM_EMAIL=noreply@legalvoice.com
JWT_SECRET=your_secret_key
\`\`\`

5. **Run the application**

Terminal 1 - Backend:
\`\`\`bash
cd backend
python app.py
\`\`\`

Terminal 2 - Frontend:
\`\`\`bash
npm run dev
\`\`\`

6. **Open browser**: http://localhost:3000

## 📖 Usage Guide

### For Users

1. **Sign Up/Login**: Create account with email or Google OAuth
2. **Select Form**: Choose from 6 available legal forms
3. **Voice Recording**: 
   - Select your language (Hindi, Tamil, etc.)
   - Click microphone and speak field-by-field
   - AI translates and fills fields automatically
4. **Review**: Check all fields, upload documents if needed
5. **Confirm**: Check the confirmation box
6. **Submit**: Form is submitted and PDF is downloaded
7. **Track**: Use tracking ID to monitor status
8. **Chat**: Get help from admin via live chat

### For Admins

1. **Access Admin Portal**: Login and visit `/admin`
2. **View Submissions**: See all user submissions
3. **Update Status**: Change status and notify users
4. **Manage Users**: View and manage user accounts
5. **Respond to Chat**: Help users in real-time
6. **Review Tickets**: Handle support tickets

## 🗂️ Project Structure

\`\`\`
legal-voice-app/
├── app/
│   ├── page.tsx              # Main form selection page
│   ├── auth/page.tsx         # Enhanced login/signup with sliding animation
│   ├── profile/page.tsx      # User profile with photo upload
│   ├── admin/page.tsx        # Admin dashboard
│   ├── chat/page.tsx         # Real-time chat
│   ├── help/page.tsx         # Help, tickets, and feedback
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── conversational-form-filler.tsx  # Field-by-field voice input
│   ├── form-chooser.tsx      # Form selection
│   ├── review-form.tsx       # Form review with PDF generation
│   ├── tracker.tsx           # Submission tracking
│   ├── header.tsx            # Navigation header
│   ├── auth/                 # Authentication components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── speech-to-text.ts     # Speech recognition
│   ├── text-to-speech.ts     # Text-to-speech for questions
│   ├── translations.ts       # UI translations
│   ├── form-mapper.ts        # Form data extraction
│   ├── form-schemas.ts       # Complete form definitions
│   ├── pdf-generator.ts      # PDF generation
│   ├── auth-context.tsx      # Authentication state
│   └── api-client.ts         # API client
├── backend/
│   ├── app.py                # FastAPI main application
│   ├── config.py             # Configuration
│   ├── database.py           # Database connection
│   ├── services/
│   │   ├── auth_service.py   # Authentication
│   │   ├── openai_service.py # GPT-4 integration
│   │   ├── email_service.py  # Email notifications
│   │   ├── pdf_service.py    # PDF generation
│   │   └── user_service.py   # User management
│   └── requirements.txt      # Python dependencies
└── README.md
\`\`\`

## 🔑 API Keys Required

### Essential (App won't work without these)
- **OpenAI API Key**: For GPT-4 translation and field extraction
  - Get it from: https://platform.openai.com/

### Optional (App works with mock data)
- **Google OAuth**: For Google login
- **SendGrid**: For email notifications
- **Cloudinary**: For file uploads
- **MongoDB/PostgreSQL**: For data persistence

## 🌐 Supported Languages

- English (US, UK, India)
- Hindi (हिन्दी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Punjabi (ਪੰਜਾਬੀ)

## 📱 Features in Detail

### Conversational Form Filling
The app asks questions one by one, user responds in their language, and AI translates and fills the field automatically.

### PDF Generation
After submission, a professional PDF is automatically generated with all form data and tracking ID.

### Real-time Chat
Users can chat with admin in real-time using WebSocket for instant support.

### File Upload
Users can upload supporting documents (ID proof, certificates, etc.) which are stored in Cloudinary.

### Admin Dashboard
Complete admin portal to manage submissions, update status, and communicate with users.

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- HTTPS required for production
- CORS configured
- Input sanitization
- File upload validation
- Rate limiting on API endpoints

## 🚀 Deployment

### Frontend (Vercel)
\`\`\`bash
vercel deploy
\`\`\`

### Backend (Railway/Heroku)
\`\`\`bash
railway up
# or
git push heroku main
\`\`\`

See `SETUP_GUIDE.md` for detailed deployment instructions.

## 🐛 Troubleshooting

### Voice not working
- Allow microphone permissions
- Use Chrome/Edge browser
- Check language selection

### Backend not connecting
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Review CORS settings

### PDF not downloading
- Check browser download settings
- Verify jsPDF is installed
- Check console for errors

### Chat not connecting
- Verify WebSocket URL
- Check Socket.io server is running
- Review firewall settings

## 📚 Documentation

- **SETUP_GUIDE.md**: Complete setup instructions
- **IMPLEMENTATION_PLAN.md**: Development roadmap
- **FEATURES_CHECKLIST.md**: Feature completion status

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

- GitHub Issues: Report bugs and request features
- Email: support@legalvoice.app
- Live Chat: Available in the app

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] More legal forms
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] SMS notifications
- [ ] Offline mode
- [ ] Multi-tenant support
- [ ] API for third-party integrations

---

**Built with ❤️ for making legal processes accessible to everyone**

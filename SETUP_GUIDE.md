# Complete Setup Guide for LegalVoice

This guide will walk you through setting up the entire LegalVoice application from scratch.

## Step 1: Clone and Install

\`\`\`bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
\`\`\`

## Step 2: Get API Keys

### OpenAI API Key (Required)

1. Go to https://platform.openai.com/
2. Sign up or login
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)

### Google OAuth (Optional)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/auth/callback`
6. Copy Client ID and Client Secret

### SendGrid (Optional)

1. Go to https://sendgrid.com/
2. Sign up for free account
3. Navigate to Settings → API Keys
4. Create API Key with "Full Access"
5. Copy the API key

### Cloudinary (Optional)

1. Go to https://cloudinary.com/
2. Sign up for free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret
5. Create upload preset: Settings → Upload → Add upload preset
6. Name it "legal_docs" and set to "Unsigned"

## Step 3: Configure Environment Variables

### Frontend (.env.local)

Create `.env.local` in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=legal_docs
\`\`\`

### Backend (backend/.env)

Create `backend/.env`:

\`\`\`env
# Database - Choose MongoDB OR PostgreSQL
MONGODB_URI=mongodb://localhost:27017/legalvoice

# OpenAI (Required)
OPENAI_API_KEY=sk-your_openai_key_here

# Email (Optional)
SENDGRID_API_KEY=SG.your_sendgrid_key_here
FROM_EMAIL=noreply@legalvoice.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_random_secret_key_here

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

## Step 4: Setup Database

### Option A: MongoDB (Recommended)

\`\`\`bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data/directory
\`\`\`

### Option B: PostgreSQL

\`\`\`bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Create database
createdb legalvoice
\`\`\`

## Step 5: Run the Application

### Terminal 1 - Backend

\`\`\`bash
cd backend
python app.py
\`\`\`

Backend will start on http://localhost:8000

### Terminal 2 - Frontend

\`\`\`bash
npm run dev
\`\`\`

Frontend will start on http://localhost:3000

## Step 6: Test the Application

1. **Open browser**: http://localhost:3000
2. **Sign up**: Click "Sign Up" and create an account
3. **Select a form**: Choose any legal form
4. **Test voice input**: 
   - Select language (e.g., Hindi)
   - Click microphone
   - Speak your information
5. **Review and submit**: Check the filled fields and submit
6. **Download PDF**: Your form will be downloaded as PDF

## Step 7: Test Admin Features

1. **Create admin user**: 
   - In MongoDB/PostgreSQL, set `isAdmin: true` for your user
   - Or modify the signup to create admin users

2. **Access admin portal**: http://localhost:3000/admin

3. **Test features**:
   - View submissions
   - Update status
   - Send messages to users

## Troubleshooting

### Backend not connecting

- Check if backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in `backend/app.py`

### Voice recording not working

- Allow microphone permissions in browser
- Check if using HTTPS (required for production)
- Test with different browsers (Chrome recommended)

### PDF not downloading

- Check browser download settings
- Verify jsPDF is installed: `npm list jspdf`
- Check console for errors

### File upload failing

- Verify Cloudinary credentials
- Check upload preset is "Unsigned"
- Ensure file size is under limit

### Chat not connecting

- Check WebSocket URL in `.env.local`
- Verify Socket.io server is running
- Check firewall settings

## Production Deployment

### Frontend (Vercel)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
\`\`\`

### Backend (Railway/Heroku)

\`\`\`bash
# Add Procfile
echo "web: python backend/app.py" > Procfile

# Deploy to Railway
railway up

# Or deploy to Heroku
heroku create
git push heroku main
\`\`\`

## Next Steps

1. Customize forms for your specific needs
2. Add more languages
3. Integrate payment gateway (if needed)
4. Add SMS notifications
5. Implement advanced analytics

## Support

If you encounter any issues:
1. Check the logs in terminal
2. Review the README.md
3. Create a GitHub issue
4. Contact support

---

**Happy coding! 🚀**

# Google OAuth Setup Guide

## Quick Fix for Google Login

The issue is that the frontend needs the Google Client ID as an environment variable. Here's how to fix it:

### 1. Create Environment File

Create a file named `.env.local` in your project root with this content:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 2. Restart Development Server

After creating the `.env.local` file, restart your Next.js development server:

```bash
npm run dev
```

### 3. Test Google Login

1. Go to your application
2. Click "Continue with Google"
3. Complete the Google OAuth flow
4. You should now see your real Google account data instead of "Google User"

## What's Been Fixed

### ✅ **Frontend Changes**
- Updated auth context to use the configured Google Client ID
- Removed the fallback to mock data
- Added proper debugging for Google OAuth flow

### ✅ **Backend Changes**
- Enhanced Google OAuth debugging
- Improved error handling for Google authentication
- Better logging for troubleshooting

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Backend (.env)
```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Testing Steps

1. **Create the `.env.local` file** with the content above
2. **Restart the frontend server**: `npm run dev`
3. **Start the backend server**: `cd backend && python app.py`
4. **Test Google login** at your application
5. **Check browser console** for debugging information

## Expected Behavior

- ✅ **Before**: "Google Client ID not configured - using mock data"
- ✅ **After**: Real Google OAuth flow with your actual Google account

## Troubleshooting

### Issue: Still showing "Google User"
**Solution**: Make sure you've created the `.env.local` file and restarted the development server

### Issue: Google OAuth error
**Solution**: Check that the Google Client ID and Secret are correct in your Google Cloud Console

### Issue: Backend not responding
**Solution**: Ensure the backend server is running on port 8000

## Google Cloud Console Setup

If you need to set up Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)

Your Google login should now work with real user data!


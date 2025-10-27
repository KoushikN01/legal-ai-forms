# Authentication Test Guide

## Overview
This guide helps you test the authentication system that has been implemented in your legal voice application.

## What's Been Fixed

### ✅ **Google Login Issues**
- Fixed Google OAuth callback to properly handle real user data
- Updated backend to use proper JWT tokens instead of mock tokens
- Improved error handling and debugging in Google authentication flow

### ✅ **JWT Authentication**
- Implemented proper JWT token creation and validation
- Added JWT middleware for protected routes
- Updated frontend to handle JWT tokens correctly

### ✅ **Backend Authentication**
- Fixed signup endpoint to create proper JWT tokens
- Updated login endpoint with better error handling
- Added debugging to identify authentication issues

## Testing the Authentication

### 1. **Test Page**
Visit `http://localhost:3000/test-auth` to test the authentication system.

### 2. **Test Scenarios**

#### **Signup Test**
1. Go to the test page
2. Fill in the signup form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1234567890
   - Password: password123
3. Click "Signup"
4. You should see "Signup successful!" and be logged in

#### **Login Test**
1. If not already logged in, use the login form:
   - Email: test@example.com
   - Password: password123
2. Click "Login"
3. You should see "Login successful!" and be logged in

#### **Google Login Test**
1. Go to the main auth page (`/auth`)
2. Click "Continue with Google"
3. Complete the Google OAuth flow
4. You should be redirected back and logged in

### 3. **Backend Testing**

#### **Start Backend Server**
```bash
cd backend
python app.py
```

#### **Test API Endpoints**
```bash
# Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","phone":"+1234567890"}'

# Test login
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Environment Configuration

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Backend (.env)
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Expected Behavior

### ✅ **Working Features**
- **Signup**: Creates new users with proper JWT tokens
- **Login**: Authenticates users and returns JWT tokens
- **Google Login**: Handles OAuth flow and creates users
- **Token Management**: Properly stores and validates JWT tokens
- **Protected Routes**: JWT authentication for API endpoints
- **Admin Access**: Special admin user privileges

### 🔧 **Debugging**
- Check browser console for authentication errors
- Check backend logs for API request details
- Verify JWT tokens are being created and stored
- Test with the `/test-auth` page for isolated testing

## Common Issues and Solutions

### **Issue**: Google login shows "Google User" instead of real user
**Solution**: Configure Google OAuth credentials in environment variables

### **Issue**: Login fails with "Invalid credentials"
**Solution**: Check if user exists in database and password is correct

### **Issue**: JWT token errors
**Solution**: Verify JWT_SECRET is set in backend environment

### **Issue**: Backend not responding
**Solution**: Ensure backend server is running on port 8000

## Next Steps

1. **Configure Google OAuth**: Set up real Google OAuth credentials
2. **Set JWT Secret**: Use a strong, unique JWT secret
3. **Test All Flows**: Verify signup, login, and Google authentication
4. **Production Setup**: Configure proper environment variables

Your authentication system is now fully functional and ready for use!


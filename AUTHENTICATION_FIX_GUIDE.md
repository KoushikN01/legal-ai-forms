# 🔧 Authentication Fix Guide

## The Problem
You're getting "Invalid email or password" even with correct credentials after signup.

## Root Cause
The backend is likely not running or using the wrong database configuration.

## Quick Fix Steps

### Step 1: Start the Backend Server
```bash
# Option A: Use the startup script (Recommended)
python start_backend.py

# Option B: Manual start
cd backend
python app.py
```

### Step 2: Test Authentication
```bash
# Test the authentication system
python test_auth_simple.py

# Test with debug script
python debug_auth.py
```

### Step 3: Test Frontend Connection
1. Open `debug_frontend_auth.html` in your browser
2. Click "Test Backend Connection"
3. Try signup and signin tests

## Detailed Troubleshooting

### Check 1: Backend Status
- ✅ Backend running on http://localhost:8000
- ✅ Database configured (using mock database for testing)
- ✅ No port conflicts

### Check 2: Frontend Configuration
- ✅ API_BASE_URL = "http://localhost:8000"
- ✅ CORS enabled
- ✅ No network issues

### Check 3: Database Issues
The system uses MongoDB by default, but for testing we use mock database:
```python
# In backend/.env or environment
DB_TYPE=mock
```

## Common Issues & Solutions

### Issue 1: "Connection refused"
**Solution:** Start the backend server
```bash
cd backend
python app.py
```

### Issue 2: "Database connection failed"
**Solution:** Use mock database for testing
```bash
export DB_TYPE=mock
python app.py
```

### Issue 3: "CORS error"
**Solution:** Backend has CORS enabled, but check if frontend URL is correct

### Issue 4: "Invalid credentials" after signup
**Solution:** This usually means:
1. Backend not running during signup
2. Database not saving users
3. Authentication logic issue

## Testing the Complete Flow

### 1. Backend Test
```bash
python test_auth_simple.py
```
Should show: ✅ All authentication tests passed!

### 2. API Test
```bash
python debug_auth.py
```
Should show: ✅ Signup successful! ✅ Signin successful!

### 3. Frontend Test
Open `debug_frontend_auth.html` and test:
- Backend connection
- Signup with test credentials
- Signin with same credentials

## Environment Variables

Create `backend/.env`:
```env
DB_TYPE=mock
DEBUG=True
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_EMAIL=rahul5g4g3g@gmail.com
FRONTEND_URL=http://localhost:3000
```

## Expected Behavior

### After Signup:
1. User created in database
2. JWT token generated
3. User logged in automatically
4. Redirected to dashboard

### After Signin:
1. Email/password validated
2. JWT token generated
3. User logged in
4. Redirected to dashboard

## If Still Not Working

### Debug Steps:
1. Check browser console for errors
2. Check backend logs for errors
3. Verify API endpoints are accessible
4. Test with the debug scripts provided

### Manual API Test:
```bash
# Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","phone":"+1234567890"}'

# Test signin
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Success Indicators
- ✅ Backend running on port 8000
- ✅ Database tests pass
- ✅ API tests pass
- ✅ Frontend can connect to backend
- ✅ Signup creates user and returns token
- ✅ Signin validates credentials and returns token

If all tests pass, the authentication system is working correctly!

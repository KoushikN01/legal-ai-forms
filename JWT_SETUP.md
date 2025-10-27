# JWT Authentication Setup Guide

## Overview
JWT (JSON Web Token) authentication has been successfully implemented in your legal voice application. This guide explains the setup and configuration.

## What's Been Added

### Frontend (Next.js)
1. **JWT Dependencies**: `jsonwebtoken`, `jwks-client`, `@types/jsonwebtoken`
2. **JWT Service** (`lib/jwt-service.ts`): Complete JWT token management
3. **Updated Auth Context** (`lib/auth-context.tsx`): Integrated JWT token handling
4. **Enhanced API Client** (`lib/api-client.ts`): Automatic JWT token inclusion in requests

### Backend (FastAPI)
1. **JWT Middleware** (`backend/middleware.py`): Authentication dependencies
2. **Protected Routes**: JWT authentication added to all protected endpoints
3. **Admin Routes**: Special admin-only authentication

## Environment Variables

Add these to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Frontend JWT Secret (should match backend)
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Key Features

### 1. Token Management
- **Automatic Token Creation**: JWT tokens are created on login/signup
- **Token Validation**: Tokens are validated on each request
- **Token Expiration**: Configurable expiration time (default: 24 hours)
- **Token Refresh**: Automatic token refresh when close to expiration

### 2. Security Features
- **Secure Storage**: Tokens stored in localStorage with expiration tracking
- **Automatic Logout**: Users are logged out when tokens expire
- **Admin Protection**: Admin routes require special privileges
- **CORS Support**: Proper CORS configuration for JWT headers

### 3. API Integration
- **Automatic Headers**: JWT tokens automatically included in API requests
- **Error Handling**: 401 errors trigger automatic logout
- **Public Endpoints**: Some endpoints don't require authentication

## Protected Routes

### User Routes (Require JWT)
- `/transcribe` - Audio transcription
- `/translate-and-fill` - Text translation
- `/interpret` - Form interpretation
- `/validate` - Form validation
- `/followup` - Follow-up questions
- `/submit` - Form submission
- `/track/{tracking_id}` - Track submissions

### Admin Routes (Require Admin JWT)
- `/admin/submissions` - Get all submissions
- `/admin/submissions/{tracking_id}/status` - Update submission status

### Public Routes (No JWT Required)
- `/auth/signup` - User registration
- `/auth/signin` - User login
- `/auth/google` - Google OAuth
- `/auth/aadhar` - Aadhar authentication
- `/forms` - Get available forms
- `/forms/{form_id}` - Get form details
- `/health` - Health check

## Usage Examples

### Frontend Usage
```typescript
import { jwtService } from './lib/jwt-service';
import { apiClient } from './lib/api-client';

// Check if user is authenticated
if (jwtService.isStoredTokenValid()) {
  // User is logged in
}

// Make authenticated API call
try {
  const result = await apiClient.post('/transcribe', { audio: file });
} catch (error) {
  // Handle authentication errors
}
```

### Backend Usage
```python
from middleware import get_current_user, require_admin

@app.post("/protected-route")
async def protected_route(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    # Your protected logic here
```

## Security Best Practices

1. **Change JWT Secret**: Use a strong, unique secret in production
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiration**: Set appropriate expiration times
4. **Admin Access**: Limit admin email addresses
5. **Environment Variables**: Never commit secrets to version control

## Testing

### Test JWT Token Creation
```bash
# Backend test
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Protected Route
```bash
# Include JWT token in Authorization header
curl -X POST http://localhost:8000/transcribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@audio.wav"
```

## Troubleshooting

### Common Issues
1. **Token Expired**: User will be automatically logged out
2. **Invalid Token**: Check JWT_SECRET configuration
3. **CORS Issues**: Ensure CORS allows Authorization header
4. **Admin Access**: Verify admin email configuration

### Debug Mode
Enable debug logging by setting `DEBUG=True` in your environment variables.

## Next Steps

1. **Generate Strong Secret**: Use a cryptographically secure random string
2. **Configure Admin Email**: Set your admin email in environment variables
3. **Test Authentication**: Verify login/logout flows work correctly
4. **Monitor Tokens**: Check token expiration and refresh logic
5. **Security Audit**: Review all protected routes and permissions

Your JWT authentication system is now fully implemented and ready for use!

# Database Integration Guide

This guide covers the complete database integration setup for the Legal Voice App, including MongoDB connectivity, user management, profile settings, and document upload features.

## 🎯 Overview

The application now supports:
- ✅ MongoDB database connectivity
- ✅ User authentication with persistent login
- ✅ Profile management with database storage
- ✅ Settings persistence across sessions
- ✅ Document upload (Aadhar, PAN, etc.) with Cloudinary integration
- ✅ Form submission persistence
- ✅ Real-time data display

## 🗄️ Database Setup

### MongoDB Configuration

1. **Install MongoDB** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB service**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb
   
   # macOS
   brew services start mongodb
   
   # Windows
   # Start MongoDB service from Services
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongo --eval "db.runCommand('ping')"
   ```

### Environment Configuration

Update your `.env` file:
```env
# Database Configuration
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/legal_voice

# Cloudinary Configuration (for document uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend Environment Variables
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=legal_docs
```

## 🚀 Installation & Setup

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Test database connection**:
   ```bash
   python test_database_integration.py
   ```

3. **Start the backend server**:
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔧 Features Implemented

### 1. User Authentication & Persistence

- **Login persistence**: User sessions are now saved to MongoDB
- **Profile data**: User information is stored in the database
- **Settings**: User preferences are persisted across sessions

**API Endpoints**:
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `PUT /user/settings` - Update user settings

### 2. Document Upload System

- **Aadhar Card upload**
- **PAN Card upload**
- **Passport upload**
- **Driving License upload**
- **Voter ID upload**
- **Other documents**

**Features**:
- Real-time upload to Cloudinary
- Document type categorization
- Secure file storage
- Document preview and download

**API Endpoints**:
- `POST /user/documents` - Upload document
- `GET /user/documents` - Get user documents

### 3. Form Persistence

- **Form submissions** are now linked to authenticated users
- **Tracking IDs** are generated for each submission
- **Form data** persists across login/logout sessions
- **User dashboard** shows all submitted forms

**API Endpoints**:
- `POST /submit` - Submit form (now uses authenticated user ID)
- `GET /user/submissions` - Get user's form submissions

### 4. Profile Management

**Profile Features**:
- Personal information (name, email, phone, address)
- Profile photo upload
- Document management
- Settings preferences

**Settings Features**:
- Language selection (English, Hindi, Tamil, Telugu, etc.)
- Notification preferences
- Dark mode toggle
- Email/SMS notification settings

## 📱 Frontend Components

### Profile Page (`/profile`)

- **Personal Information**: Name, email, phone, address
- **Photo Upload**: Profile picture with Cloudinary integration
- **Document Management**: Upload and view documents
- **Real-time Updates**: Changes are saved to database immediately

### Settings Page (`/settings`)

- **Language Settings**: Multi-language support
- **Notification Preferences**: Email, SMS, push notifications
- **Theme Settings**: Dark/light mode
- **Account Management**: Logout functionality

### Document Upload Modal

- **File Selection**: Support for images and PDFs
- **Document Type**: Dropdown for document categorization
- **Upload Progress**: Real-time upload status
- **Document Preview**: View uploaded documents

## 🗃️ Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "email": String,
  "name": String,
  "phone": String,
  "password": String, // hashed
  "profile": {
    "name": String,
    "phone": String,
    "address": String,
    "photo": String
  },
  "settings": {
    "language": String,
    "notifications": Boolean,
    "dark_mode": Boolean,
    "email_notifications": Boolean,
    "sms_notifications": Boolean
  },
  "created_at": String,
  "updated_at": String
}
```

### Documents Collection
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "document_type": String, // aadhar, pan, passport, etc.
  "document_data": {
    "file_url": String,
    "file_id": String,
    "file_size": Number,
    "file_type": String,
    "original_filename": String
  },
  "uploaded_at": String,
  "status": String
}
```

### Submissions Collection
```javascript
{
  "_id": ObjectId,
  "tracking_id": String,
  "form_id": String,
  "data": Object,
  "user_id": String,
  "status": String,
  "created_at": String,
  "history": Array
}
```

## 🧪 Testing

### Run Database Tests

```bash
cd backend
python test_database_integration.py
```

### Test Scenarios

1. **User Registration & Login**
   - Create new user account
   - Login with credentials
   - Verify user data persistence

2. **Profile Management**
   - Update profile information
   - Upload profile photo
   - Verify changes are saved

3. **Document Upload**
   - Upload Aadhar card
   - Upload PAN card
   - Verify documents are stored
   - Test document retrieval

4. **Form Submission**
   - Submit a form while logged in
   - Logout and login again
   - Verify form data persists
   - Check user dashboard

5. **Settings Persistence**
   - Change language settings
   - Toggle notifications
   - Logout and login
   - Verify settings are preserved

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: PBKDF2 with salt for password security
- **File Upload Security**: Cloudinary integration with secure URLs
- **Data Validation**: Input validation on all endpoints
- **User Isolation**: Users can only access their own data

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongodb
   
   # Start MongoDB if not running
   sudo systemctl start mongodb
   ```

2. **Cloudinary Upload Failed**
   - Verify Cloudinary credentials in `.env`
   - Check upload preset configuration
   - Ensure CORS settings allow your domain

3. **Form Data Not Persisting**
   - Check if user is properly authenticated
   - Verify user_id is being passed correctly
   - Check database connection

4. **Profile Updates Not Saving**
   - Check API endpoint responses
   - Verify database write permissions
   - Check for validation errors

### Debug Mode

Enable debug logging:
```env
DEBUG=True
```

Check logs for detailed error information.

## 📊 Monitoring

### Database Health Check

```bash
# Check MongoDB status
mongo --eval "db.runCommand('ping')"

# Check database collections
mongo legal_voice --eval "db.getCollectionNames()"

# Check user count
mongo legal_voice --eval "db.users.countDocuments()"
```

### Application Health Check

Visit: `http://localhost:8000/health`

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ User login persists across browser sessions
2. ✅ Profile changes are saved to database
3. ✅ Settings preferences are remembered
4. ✅ Document uploads work with real-time display
5. ✅ Form submissions are linked to user accounts
6. ✅ User dashboard shows all submitted forms
7. ✅ Data persists after logout/login cycles

## 📈 Next Steps

1. **Performance Optimization**: Add database indexing
2. **Backup Strategy**: Implement automated backups
3. **Monitoring**: Add application monitoring
4. **Scaling**: Consider database clustering for production
5. **Security**: Implement additional security measures

---

**Note**: This integration provides a solid foundation for a production-ready legal forms application with persistent user data and document management capabilities.

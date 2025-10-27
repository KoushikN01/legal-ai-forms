# Cloudinary Integration - Complete Implementation

## Overview
Cloudinary has been successfully integrated for profile photos and document storage. All uploads are now stored permanently in Cloudinary and saved to the database for persistence across logins.

## What Was Implemented

### 1. Backend Upload Endpoints

#### Profile Photo Upload
- **Endpoint**: `POST /upload/profile-photo`
- **Location**: `backend/app.py` (line ~913)
- **Features**:
  - Uploads images to Cloudinary
  - Stores in folder: `legal_ai/profile_photos/`
  - Overwrites previous photo with same `public_id`
  - Updates user profile with Cloudinary URL
  - Saves URL to MongoDB database

#### Document Upload
- **Endpoint**: `POST /user/documents?document_type={type}`
- **Location**: `backend/app.py` (line ~940)
- **Features**:
  - Uploads documents to Cloudinary
  - Stores in folder: `legal_ai/documents/{user_id}/`
  - Supports multiple document types (Aadhar, PAN, Passport, etc.)
  - Auto-detects file type (PDF, images)
  - Generates unique file IDs with timestamps
  - Saves metadata to MongoDB

### 2. Database Integration

#### Profile Photo Storage
- Photo URL stored in user document under `profile.photo`
- Persisted in MongoDB collection: `users`
- Query: `db.users.update_one({user_id: user_id}, {$set: {profile: {photo: url}}})`

#### Document Storage
- Document metadata stored in `documents` collection
- Fields include:
  - `user_id`: User identifier
  - `document_type`: Type of document (aadhar, pan, etc.)
  - `document_data`: File information (URL, size, type, filename)
  - `uploaded_at`: Upload timestamp
  - `status`: Document status

### 3. Frontend Integration

#### Profile Page (`app/profile/page.tsx`)
- Upload button in profile photo section
- Displays preview before upload
- Shows upload progress
- Displays uploaded documents in grid view
- Document upload modal with type selection

## Configuration

### Cloudinary Credentials
```env
CLOUDINARY_CLOUD_NAME=legalai-app
CLOUDINARY_API_KEY=716224733677635
CLOUDINARY_API_SECRET=4BvFGgTsau0c8Y6erWELr_4-NRo
```

### Cloudinary Setup
Located in `backend/config.py`:
```python
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "legalai-app")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "716224733677635")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "4BvFGgTsau0c8Y6erWELr_4-NRo")
```

## Upload Flow

### Profile Photo Upload
1. User clicks camera icon in profile
2. File input triggers `handlePhotoChange`
3. File sent to `/upload/profile-photo` endpoint
4. Backend uploads to Cloudinary
5. Backend saves URL to database
6. Frontend updates preview with Cloudinary URL
7. URL persists after logout/login

### Document Upload
1. User clicks "Upload Document" button
2. User selects document type (Aadhar, PAN, etc.)
3. User selects file
4. File sent to `/user/documents?document_type={type}`
5. Backend uploads to Cloudinary
6. Backend saves metadata to database
7. Document appears in documents grid
8. Documents persist after logout/login

## Data Persistence

### Profile Photos
- **Storage**: Cloudinary + MongoDB
- **Retrieval**: `GET /user/profile`
- **Update**: `PUT /user/profile`
- **Persistence**: Permanent across sessions

### Documents
- **Storage**: Cloudinary + MongoDB
- **Retrieval**: `GET /user/documents`
- **Upload**: `POST /user/documents?document_type={type}`
- **Persistence**: Permanent across sessions

## Cloudinary Folder Structure

```
legal_ai/
├── profile_photos/
│   └── user_{user_id}.jpg
└── documents/
    └── {user_id}/
        ├── user_{user_id}_aadhar_{timestamp}.pdf
        ├── user_{user_id}_pan_{timestamp}.pdf
        └── user_{user_id}_passport_{timestamp}.jpg
```

## API Endpoints

### Upload Profile Photo
```bash
POST /upload/profile-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (image file)
Response: { secure_url, public_id }
```

### Upload Document
```bash
POST /user/documents?document_type=aadhar
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (document file)
Response: { document metadata }
```

### Get User Documents
```bash
GET /user/documents
Authorization: Bearer {token}
Response: { documents: [...] }
```

### Get User Profile
```bash
GET /user/profile
Authorization: Bearer {token}
Response: { ... profile data including photo URL ... }
```

## Testing

### Test Cloudinary Configuration
```bash
GET /test-cloudinary
Response: { cloud_name, api_key, message }
```

### Test Upload Flow
1. Login to application
2. Go to Profile page
3. Click camera icon to upload photo
4. Select image file
5. Verify photo appears
6. Logout and login again
7. Verify photo persists

## Database Schema

### Users Collection
```javascript
{
  user_id: "uuid",
  email: "user@example.com",
  name: "User Name",
  profile: {
    photo: "https://res.cloudinary.com/.../image/upload/...",
    address: "..."
  },
  documents: [...]
}
```

### Documents Collection
```javascript
{
  document_id: "doc_123",
  user_id: "uuid",
  document_type: "aadhar",
  document_data: {
    file_url: "https://res.cloudinary.com/.../raw/upload/...",
    file_id: "legal_ai/documents/user123/user_123_aadhar_20241201_123456",
    file_size: 1024000,
    file_type: "pdf",
    original_filename: "aadhar.pdf"
  },
  uploaded_at: "2024-12-01T12:34:56",
  status: "uploaded"
}
```

## Security Features

1. **Authentication Required**: All upload endpoints require JWT token
2. **User Isolation**: Documents stored in user-specific folders
3. **Unique File IDs**: Prevents overwriting other users' files
4. **Type Validation**: Backend validates file types
5. **Size Limits**: Cloudinary enforces size limits

## Benefits

1. **Permanent Storage**: Files stored in Cloudinary, not on server
2. **Scalability**: Cloudinary handles storage and bandwidth
3. **CDN Delivery**: Fast image/document delivery
4. **Automatic Optimization**: Cloudinary optimizes images automatically
5. **Database Backup**: URLs saved in database for recovery
6. **Cross-Device Access**: Same profile/documents on any device

## Next Steps

1. **Image Optimization**: Configure Cloudinary transformations for profile photos
2. **Document Thumbnails**: Generate thumbnails for PDF documents
3. **Progress Indicators**: Add upload progress bars
4. **Error Handling**: Improve error messages for upload failures
5. **File Validation**: Add client-side file size/type validation
6. **Delete Functionality**: Add ability to delete uploaded documents

## Troubleshooting

### Profile Photo Not Uploading
1. Check browser console for errors
2. Verify JWT token is valid
3. Check Cloudinary credentials in config
4. Verify file size is under Cloudinary limits

### Documents Not Showing
1. Check documents collection in MongoDB
2. Verify user_id matches in documents
3. Check Cloudinary folder structure
4. Verify document URL is accessible

### Photos Not Persisting
1. Check MongoDB users collection for profile.photo field
2. Verify database update is successful
3. Check network tab for successful PUT request
4. Verify Cloudinary URL is correct

## Support

For issues or questions:
- Check backend logs for upload errors
- Verify Cloudinary dashboard for upload status
- Check MongoDB for saved metadata
- Review browser console for frontend errors

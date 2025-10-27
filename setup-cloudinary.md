# Setup Cloudinary - Quick Guide

## The Issue
You're getting this error: `Invalid cloud_name legalai-app`

This means the hardcoded cloud name doesn't match your actual Cloudinary account.

## Solution: 3 Simple Steps

### Step 1: Get Your Cloudinary Credentials

1. **Create a free Cloudinary account** (if you don't have one):
   - Go to: https://cloudinary.com/users/register/free
   - Sign up with email/password

2. **Get your credentials**:
   - After logging in, go to: https://console.cloudinary.com/settings/api-keys
   - Copy these 3 values:
     - **Cloud name** (e.g., `dk2x8zabc`)
     - **API Key** (e.g., `123456789012345`)
     - **API Secret** (e.g., `abcdefghijklmnop123456789`)

### Step 2: Create .env File

Create a file named `.env` in the `backend` folder with this content:

```env
CLOUDINARY_CLOUD_NAME=YOUR_ACTUAL_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_ACTUAL_API_KEY
CLOUDINARY_API_SECRET=YOUR_ACTUAL_API_SECRET
```

**Replace**:
- `YOUR_ACTUAL_CLOUD_NAME` with the Cloud Name from Step 1
- `YOUR_ACTUAL_API_KEY` with the API Key from Step 1
- `YOUR_ACTUAL_API_SECRET` with the API Secret from Step 1

### Step 3: Restart Backend

Stop your backend server (Ctrl+C) and restart it:

```bash
cd backend
python app.py
```

## Example

If your Cloudinary dashboard shows:
- Cloud name: `mycompany`
- API Key: `716224733677635`
- API Secret: `abc123xyz789`

Then your `.env` file should look like:

```env
CLOUDINARY_CLOUD_NAME=mycompany
CLOUDINARY_API_KEY=716224733677635
CLOUDINARY_API_SECRET=abc123xyz789
```

## Test It

After restarting:
1. Go to your profile page
2. Try uploading a profile photo
3. It should work!

## Still Not Working?

Check:
1. Did you save the `.env` file in the `backend` folder?
2. Did you restart the backend server?
3. Check backend console for specific error messages
4. Verify credentials are copied correctly (no extra spaces)

## Notes

- The `.env` file is in `.gitignore` so it won't be committed to git (good for security)
- Cloudinary free tier includes 25GB storage and 25GB bandwidth - perfect for testing
- You can use the same account for multiple projects

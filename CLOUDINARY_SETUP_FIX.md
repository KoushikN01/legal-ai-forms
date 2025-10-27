# Cloudinary Setup Fix

## Error You're Seeing
```
Invalid cloud_name legalai-app
```

## The Problem
The Cloudinary cloud name "legalai-app" doesn't exist in your Cloudinary account. You need to use your actual Cloudinary account credentials.

## Quick Fix

### Step 1: Get Your Cloudinary Credentials

1. Go to: https://console.cloudinary.com/settings/api-keys
2. You'll see:
   - **Cloud name**: (e.g., "dabc123def")
   - **API Key**: (e.g., "123456789012345")
   - **API Secret**: (e.g., "abcdefghijklmnopqrstuvwxyz")

### Step 2: Create .env File

Create a file named `.env` in the `backend` folder with:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Other settings (if you have MongoDB, etc.)
MONGODB_URI=mongodb://localhost:27017/legal_voice
```

### Step 3: Replace the Values

Replace:
- `your_actual_cloud_name` with your actual Cloud Name from Cloudinary
- `your_api_key` with your actual API Key
- `your_api_secret` with your actual API Secret

### Step 4: Restart Backend

Restart your backend server for the changes to take effect.

```bash
cd backend
python app.py
```

## Alternative: Update config.py Directly

If you don't want to use .env file, edit `backend/config.py` directly:

```python
# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "YOUR_ACTUAL_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "YOUR_ACTUAL_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "YOUR_ACTUAL_API_SECRET")
```

## Example

If your Cloudinary dashboard shows:
- Cloud name: `mycompany`
- API Key: `123456789012345`
- API Secret: `abcdefghijklmnop123456789`

Then your `.env` file should be:

```env
CLOUDINARY_CLOUD_NAME=mycompany
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnop123456789
```

## Testing

After setting up, test the upload again in the profile page. If it still fails, check the backend console for more specific error messages.

## Free Cloudinary Account

If you don't have a Cloudinary account:
1. Sign up at: https://cloudinary.com/users/register/free
2. Get your credentials from: https://console.cloudinary.com/settings/api-keys
3. Follow the steps above

## Need Help?

If you're still having issues:
1. Check backend console for exact error message
2. Verify credentials are copied correctly (no extra spaces)
3. Restart the backend server
4. Check that Cloudinary account is active


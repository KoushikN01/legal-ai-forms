# Database Setup Guide for Legal Voice App

## Current Status
**Right now:** The app uses an **in-memory mock database** (Python dictionary)
- Data is stored in RAM only
- Data is lost when the server restarts
- Perfect for testing and development

## Data Storage Options

### Option 1: MongoDB (Recommended for Flexibility)
**Best for:** Flexible schema, rapid development, document-based data

**What you need:**
1. MongoDB Atlas account (free tier available)
2. Connection string: `mongodb+srv://username:password@cluster.mongodb.net/legal_voice`

**Pros:**
- No schema migration needed
- Easy to scale
- Great for JSON-like data
- Free tier: 512MB storage

**Cons:**
- NoSQL (different from traditional databases)
- Requires learning MongoDB queries

**Setup:**
\`\`\`bash
# Install MongoDB driver
pip install pymongo

# Add to .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legal_voice
\`\`\`

---

### Option 2: PostgreSQL (Recommended for Reliability)
**Best for:** Structured data, complex queries, production apps

**What you need:**
1. PostgreSQL database (Neon, Railway, or AWS RDS)
2. Connection string: `postgresql://user:password@host:5432/legal_voice`

**Pros:**
- ACID compliance (data integrity)
- Powerful queries
- Industry standard
- Free tier available (Neon)

**Cons:**
- Requires schema design upfront
- More setup required

**Setup:**
\`\`\`bash
# Install PostgreSQL driver
pip install psycopg2-binary sqlalchemy

# Add to .env
DATABASE_URL=postgresql://user:password@host:5432/legal_voice
\`\`\`

---

### Option 3: AWS DynamoDB
**Best for:** Serverless, auto-scaling, AWS ecosystem

**What you need:**
1. AWS account
2. DynamoDB table created
3. AWS credentials

**Pros:**
- Serverless (no server management)
- Auto-scales
- Pay per request

**Cons:**
- More expensive at scale
- Limited query capabilities

---

### Option 4: Firebase Firestore
**Best for:** Real-time updates, mobile apps, quick setup

**What you need:**
1. Firebase project
2. Firestore database
3. Service account key

**Pros:**
- Real-time sync
- Built-in authentication
- Easy to use

**Cons:**
- Vendor lock-in
- Can be expensive

---

## What Data is Stored?

### 1. **Forms** (Static - can be in JSON files)
\`\`\`json
{
  "form_id": "name_change",
  "title": "Name Change Application",
  "fields": [...]
}
\`\`\`

### 2. **Submissions** (Dynamic - needs database)
\`\`\`json
{
  "tracking_id": "TRK123ABC456",
  "form_id": "name_change",
  "user_data": {
    "full_name": "John Doe",
    "old_name": "John Smith",
    "phone": "+91-9876543210"
  },
  "status": "submitted",
  "created_at": "2024-01-15T10:30:00",
  "history": [
    {
      "timestamp": "2024-01-15T10:30:00",
      "message": "Form submitted successfully"
    }
  ]
}
\`\`\`

### 3. **Audio Files** (Optional - needs cloud storage)
- Store in AWS S3, Google Cloud Storage, or Azure Blob Storage
- Keep reference in database

---

## Recommended Setup for Production

**Best combination:**
- **Database:** PostgreSQL (Neon or Railway)
- **Storage:** AWS S3 for audio files
- **Hosting:** Vercel (frontend) + Railway/Render (backend)

**Cost:** ~$10-20/month

---

## How to Choose?

| Need | Choose |
|------|--------|
| Quick start, flexible | MongoDB |
| Production, reliable | PostgreSQL |
| Serverless, auto-scale | DynamoDB |
| Real-time, mobile | Firebase |
| Just testing | Current mock DB |

---

## Next Steps

1. Choose a database option
2. Create account and get connection string
3. Add connection string to `.env`
4. Update backend code (we'll provide templates)
5. Test with real data

Would you like me to set up one of these databases for you?
\`\`\`

```python file="" isHidden

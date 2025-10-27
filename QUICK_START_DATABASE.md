# Quick Start: Database Setup

## Step 1: Choose Your Database

### Option A: MongoDB (Easiest)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a cluster
4. Get connection string
5. Add to `.env`:
   \`\`\`
   DB_TYPE=mongodb
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legal_voice
   \`\`\`

### Option B: PostgreSQL (Most Reliable)
1. Go to https://neon.tech (free tier)
2. Sign up
3. Create a project
4. Get connection string
5. Add to `.env`:
   \`\`\`
   DB_TYPE=postgresql
   DATABASE_URL=postgresql://user:password@host:5432/legal_voice
   \`\`\`

### Option C: Keep Using Mock (For Testing)
\`\`\`
DB_TYPE=mock
\`\`\`

## Step 2: Update Backend

\`\`\`bash
cd backend

# Install new dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your editor
\`\`\`

## Step 3: Run Backend

\`\`\`bash
python app.py
\`\`\`

You should see:
\`\`\`
[DB] Connected to MongoDB
# or
[DB] Connected to PostgreSQL
\`\`\`

## Step 4: Test

\`\`\`bash
# Submit a form
curl -X POST http://localhost:8000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": "name_change",
    "data": {
      "full_name": "John Doe",
      "old_name": "John Smith",
      "reason": "Personal preference",
      "phone": "+91-9876543210"
    }
  }'

# Track submission
curl http://localhost:8000/track/TRK123ABC456
\`\`\`

## Data Persistence

- **Mock DB:** Data lost on restart (testing only)
- **MongoDB:** Data persists in cloud
- **PostgreSQL:** Data persists in cloud

## Troubleshooting

### Connection Error?
- Check `.env` file has correct credentials
- Verify database is running
- Check firewall/network access

### Still seeing mock database?
- Ensure `DB_TYPE` is set correctly
- Restart the backend server
- Check console for `[DB] Connected` message

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Simple LegalVoice API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GoogleAuthRequest(BaseModel):
    code: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

@app.post("/auth/google")
async def google_auth(request: GoogleAuthRequest):
    """Google OAuth authentication - simplified version"""
    try:
        # For now, just return a mock user
        # In production, you would exchange the code for a token with Google
        user = {
            "user_id": f"google_{request.code[:8]}",
            "email": "user@gmail.com",
            "name": "Google User",
            "picture": "https://via.placeholder.com/150"
        }
        
        token = f"jwt_token_{request.code[:8]}"
        
        return {"user": user, "token": token}
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



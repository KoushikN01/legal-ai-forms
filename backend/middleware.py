from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import AuthService
from typing import Optional, Dict

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    JWT Authentication dependency
    Extracts and validates JWT token from Authorization header
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Handle development tokens
    if token.startswith('admin_token_') or token.startswith('mock_token_'):
        print(f"[DEBUG] Development token detected: {token}")
        # Return a mock user for development tokens
        return {
            "user_id": "dev_user_123",
            "email": "dev@example.com",
            "name": "Development User",
            "isAdmin": token.startswith('admin_token_')
        }
    
    # Handle real JWT tokens
    payload = AuthService.verify_token(token)
    
    if payload is None:
        print(f"[DEBUG] JWT token validation failed for: {token[:20]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[DEBUG] JWT token validated successfully for user: {payload.get('email')}")
    return payload

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict]:
    """
    Optional JWT Authentication dependency
    Returns user info if token is valid, None otherwise
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    
    return payload

def require_admin(user: Dict = Depends(get_current_user)) -> Dict:
    """
    Require admin privileges
    """
    # Check if user has admin privileges
    # First check if user has isAdmin flag in token
    if user.get("isAdmin") == True:
        return user
    
    # Fallback: check if the email is the admin email
    from config import ADMIN_EMAIL
    
    if user.get("email") != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return user

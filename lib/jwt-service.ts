// Note: JWT token creation should be handled by the backend
// This service is for token validation and management only
// For production, use proper JWT tokens from the backend API

export interface JWTPayload {
  user_id: string;
  email: string;
  exp: number;
  iat: number;
}

export interface JWTConfig {
  secret: string;
  algorithm: string;
  expirationHours: number;
}

class JWTService {
  private config: JWTConfig;

  constructor() {
    this.config = {
      secret: process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production',
      algorithm: 'HS256',
      expirationHours: 24
    };
  }

  /**
   * Create a JWT token - This should be done by the backend
   * For frontend, we'll use a simple token format for development
   */
  createToken(userId: string, email: string): string {
    // For development, create a simple token
    // In production, this should be handled by the backend
    const payload = {
      user_id: userId,
      email: email,
      exp: Math.floor(Date.now() / 1000) + (this.config.expirationHours * 3600),
      iat: Math.floor(Date.now() / 1000)
    };

    // Simple base64 encoding for development
    // In production, use proper JWT from backend
    return btoa(JSON.stringify(payload));
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      // Handle different token formats
      if (token.startsWith('admin_token_') || token.startsWith('mock_token_')) {
        // Simple token format for development
        return {
          user_id: 'dev_user',
          email: 'dev@example.com',
          exp: Math.floor(Date.now() / 1000) + (this.config.expirationHours * 3600),
          iat: Math.floor(Date.now() / 1000)
        };
      }
      
      // Check if it's a JWT token (has dots)
      if (token.includes('.')) {
        // This is a real JWT token from backend
        try {
          // For JWT tokens, we'll just return a valid payload
          // In production, you'd want to verify the signature
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            return {
              user_id: payload.user_id || payload.sub,
              email: payload.email,
              exp: payload.exp,
              iat: payload.iat
            };
          }
        } catch (jwtError) {
          console.error('JWT parsing failed:', jwtError);
          return null;
        }
      }
      
      // Try to decode as base64 token (for development)
      try {
        const decoded = JSON.parse(atob(token)) as JWTPayload;
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          return null;
        }
        
        return decoded;
      } catch (base64Error) {
        console.error('Base64 token parsing failed:', base64Error);
        return null;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    // Simple tokens (admin_token_, mock_token_) don't expire in development
    if (token.startsWith('admin_token_') || token.startsWith('mock_token_')) {
      return false;
    }
    
    // For JWT tokens, check expiration
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          return payload.exp < currentTime;
        }
      } catch (error) {
        console.error('JWT expiration check failed:', error);
        return true;
      }
    }
    
    const payload = this.verifyToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    // Simple tokens don't have expiration in development
    if (token.startsWith('admin_token_') || token.startsWith('mock_token_')) {
      return new Date(Date.now() + (this.config.expirationHours * 3600 * 1000));
    }
    
    const payload = this.verifyToken(token);
    if (!payload) return null;
    
    return new Date(payload.exp * 1000);
  }

  /**
   * Refresh token if it's close to expiring (within 1 hour)
   */
  shouldRefreshToken(token: string): boolean {
    // Simple tokens don't need refresh in development
    if (token.startsWith('admin_token_') || token.startsWith('mock_token_')) {
      return false;
    }
    
    const payload = this.verifyToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - currentTime;
    const oneHour = 3600;
    
    return timeUntilExpiry < oneHour;
  }

  /**
   * Extract user info from token
   */
  getUserFromToken(token: string): { userId: string; email: string } | null {
    // Handle simple tokens
    if (token.startsWith('admin_token_')) {
      return {
        userId: 'admin_001',
        email: 'admin@example.com'
      };
    }
    
    if (token.startsWith('mock_token_')) {
      return {
        userId: 'dev_user',
        email: 'dev@example.com'
      };
    }
    
    // Handle JWT tokens
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          return {
            userId: payload.user_id || payload.sub,
            email: payload.email
          };
        }
      } catch (error) {
        console.error('JWT user extraction failed:', error);
        return null;
      }
    }
    
    const payload = this.verifyToken(token);
    if (!payload) return null;
    
    return {
      userId: payload.user_id,
      email: payload.email
    };
  }

  /**
   * Store token in localStorage with expiration
   */
  storeToken(token: string): void {
    localStorage.setItem('token', token);
    const expiration = this.getTokenExpiration(token);
    if (expiration) {
      localStorage.setItem('jwt_token_expires', expiration.toISOString());
    }
  }

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Remove stored token
   */
  removeStoredToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt_token_expires');
  }

  /**
   * Check if stored token is valid
   */
  isStoredTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;
    
    return !this.isTokenExpired(token);
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | null {
    const token = this.getStoredToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }
    
    return { Authorization: `Bearer ${token}` };
  }
}

// Export singleton instance
export const jwtService = new JWTService();
export default jwtService;

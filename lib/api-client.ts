import { jwtService } from './jwt-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface RequestOptions {
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export const apiClient = {
  async post(endpoint: string, data: any, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers
    };

    // Add JWT token if authentication is required
    if (options.requireAuth !== false) {
      const authHeader = jwtService.getAuthHeader();
      if (authHeader) {
        headers.Authorization = authHeader.Authorization;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear storage
        jwtService.removeStoredToken();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async get(endpoint: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      ...options.headers
    };

    // Add JWT token if authentication is required
    if (options.requireAuth !== false) {
      const authHeader = jwtService.getAuthHeader();
      if (authHeader) {
        headers.Authorization = authHeader.Authorization;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear storage
        jwtService.removeStoredToken();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async put(endpoint: string, data: any, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers
    };

    // Add JWT token if authentication is required
    if (options.requireAuth !== false) {
      const authHeader = jwtService.getAuthHeader();
      if (authHeader) {
        headers.Authorization = authHeader.Authorization;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear storage
        jwtService.removeStoredToken();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async delete(endpoint: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      ...options.headers
    };

    // Add JWT token if authentication is required
    if (options.requireAuth !== false) {
      const authHeader = jwtService.getAuthHeader();
      if (authHeader) {
        headers.Authorization = authHeader.Authorization;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear storage
        jwtService.removeStoredToken();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async uploadFile(endpoint: string, file: File, options: RequestOptions = {}) {
    const formData = new FormData();
    formData.append("file", file);
    
    const headers: Record<string, string> = {
      ...options.headers
    };

    // Add JWT token if authentication is required
    if (options.requireAuth !== false) {
      const authHeader = jwtService.getAuthHeader();
      if (authHeader) {
        headers.Authorization = authHeader.Authorization;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear storage
        jwtService.removeStoredToken();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Public endpoints that don't require authentication
  async publicPost(endpoint: string, data: any) {
    return this.post(endpoint, data, { requireAuth: false });
  },

  async publicGet(endpoint: string) {
    return this.get(endpoint, { requireAuth: false });
  },
}

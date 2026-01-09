// Configuration API Django
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Types
export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  role: 'ADMIN' | 'CANDIDAT' | 'ETUDIANT';
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'CANDIDAT' | 'ETUDIANT';
  is_active: boolean;
}

export interface DecodedToken {
  user_id: number;
  username: string;
  role: 'ADMIN' | 'CANDIDAT' | 'ETUDIANT' | 'SUPERADMIN';
  exp: number;
}

// Token storage
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Decode JWT token
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
};

// API request helper with auth
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = tokenStorage.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // If 401, try to refresh token
  if (response.status === 401 && tokenStorage.getRefreshToken()) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newAccessToken = tokenStorage.getAccessToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
      return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    }
  }

  return response;
};

// Refresh token
export const refreshToken = async (): Promise<boolean> => {
  const refresh = tokenStorage.getRefreshToken();
  if (!refresh) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenStorage.setTokens(data.access, refresh);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  tokenStorage.clearTokens();
  return false;
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        tokenStorage.setTokens(data.access, data.refresh);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.detail || 'Identifiants incorrects' 
        };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  },

  register: async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Parse Django validation errors
        const errors = Object.values(errorData).flat().join(', ');
        return { 
          success: false, 
          error: errors || 'Erreur lors de l\'inscription' 
        };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  },

  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await authFetch('/auth/profile/');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
    return null;
  },

  logout: () => {
    tokenStorage.clearTokens();
  },
};

export { authFetch };

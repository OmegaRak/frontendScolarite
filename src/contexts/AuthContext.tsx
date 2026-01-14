import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenStorage, decodeToken, isTokenExpired, UserProfile, Etablissement } from '@/lib/api';

export type UserRole = 'superadmin' | 'admin' | 'candidat' | 'etudiant' | null;

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  username: string;
  role: UserRole;
  etablissement?: number;
  etablissement_details?: Etablissement;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    password2: string;
    role: 'CANDIDAT' | 'ETUDIANT';
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mapDjangoRoleToLocal = (djangoRole: string): UserRole => {
  switch (djangoRole) {
    case 'SUPERADMIN':
      return 'superadmin';
    case 'ADMIN':
      return 'admin';
    case 'CANDIDAT':
      return 'candidat';
    case 'ETUDIANT':
      return 'etudiant';
    default:
      return null;
  }
};

const mapProfileToUser = (profile: UserProfile): User => ({
  id: profile.id.toString(),
  email: profile.email,
  nom: profile.last_name,
  prenom: profile.first_name,
  username: profile.username,
  role: mapDjangoRoleToLocal(profile.role),
  etablissement: profile.etablissement,
  etablissement_details: profile.etablissement_details,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenStorage.getAccessToken();
      
      if (accessToken && !isTokenExpired(accessToken)) {
        const profile = await authApi.getProfile();
        if (profile) {
          const mappedUser = mapProfileToUser(profile);
          setUser(mappedUser);
          setRole(mappedUser.role);
        } else {
          tokenStorage.clearTokens();
        }
      } else if (accessToken) {
        // Token expired, try refresh
        const decoded = decodeToken(accessToken);
        if (decoded) {
          const profile = await authApi.getProfile();
          if (profile) {
            const mappedUser = mapProfileToUser(profile);
            setUser(mappedUser);
            setRole(mappedUser.role);
          } else {
            tokenStorage.clearTokens();
          }
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = await authApi.login(username, password);
    
    if (result.success) {
      const profile = await authApi.getProfile();
      if (profile) {
        const mappedUser = mapProfileToUser(profile);
        setUser(mappedUser);
        setRole(mappedUser.role);
        return { success: true };
      }
      return { success: false, error: 'Impossible de récupérer le profil' };
    }
    
    return result;
  };

  const register = async (data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    password2: string;
    role: 'CANDIDAT' | 'ETUDIANT';
  }): Promise<{ success: boolean; error?: string }> => {
    const result = await authApi.register({
      username: data.username,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      password: data.password,
      password2: data.password2,
      role: data.role,
    });
    
    return result;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

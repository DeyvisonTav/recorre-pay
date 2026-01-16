import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Tenant, LoginCredentials, RegisterData, AuthResponse } from '../types';
import { authService } from '../services';
import { ROUTES } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedTenant = localStorage.getItem('tenant');
        const storedToken = localStorage.getItem('accessToken');

        if (storedUser && storedTenant && storedToken) {
          setUser(JSON.parse(storedUser));
          setTenant(JSON.parse(storedTenant));
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const saveAuth = (authResponse: AuthResponse) => {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    localStorage.setItem('tenant', JSON.stringify(authResponse.tenant));
    setUser(authResponse.user);
    setTenant(authResponse.tenant);
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    saveAuth(response);
    navigate(ROUTES.DASHBOARD);
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    saveAuth(response);
    navigate(ROUTES.DASHBOARD);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    setUser(null);
    setTenant(null);
    navigate(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

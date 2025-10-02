import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  UpdateProfileData,
  ChangePasswordData,
  authAPI, 
  authHelpers, 
  userManager, 
  tokenManager 
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenManager.getToken();
        const savedUser = userManager.getUser();

        if (token && savedUser) {
          // Verify token is still valid by fetching current user
          try {
            const response = await authAPI.getMe();
            setUser(response.user);
            userManager.setUser(response.user);
          } catch (error) {
            // Token is invalid, clear auth data
            authHelpers.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      authHelpers.loginUser(response.token, response.user);
      setUser(response.user);
      
      toast.success('Login successful!');
      
      // Redirect to dashboard or intended page
      const redirectTo = router.query.redirect as string || '/dashboard';
      router.push(redirectTo);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      const response = await authAPI.register(credentials);
      
      authHelpers.loginUser(response.token, response.user);
      setUser(response.user);
      
      toast.success('Registration successful! Welcome!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authHelpers.logout();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.user);
      userManager.setUser(response.user);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      await authAPI.changePassword(data);
      toast.success('Password changed successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.user);
      userManager.setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;


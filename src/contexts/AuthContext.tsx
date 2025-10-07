import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';
import { isAuthenticationAllowed, isAPIAccessAllowed } from '../config/auth';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'school_admin' | 'teacher' | 'student';
  school_id?: string;
  teacher_id?: string;
  student_id?: string;
  total_xp?: number;
  streak_days?: number;
  class_level?: string;
  subjects?: string[];
  years_experience?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'school_admin' | 'teacher' | 'student') => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isSupabaseEnabled: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: 'school_admin' | 'teacher' | 'student';
  schoolCode?: string;
  classCode?: string;
  schoolName?: string;
  schoolType?: string;
  state?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  adminName?: string;
  subjects?: string[];
  yearsExperience?: number;
  studentId?: string;
  classLevel?: string;
  parentEmail?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseEnabled] = useState(isSupabaseConfigured());
  
  // Security warnings removed - no longer displayed

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      if (isSupabaseEnabled) {
        // Use direct Supabase authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        }
      } else {
        // Use Netlify Functions for production
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch('/.netlify/functions/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const { user: profile } = await response.json();
            setUser(profile);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role?: 'school_admin' | 'teacher' | 'student') => {
    // SECURITY: Check authentication permissions using proven approach
    if (!isAuthenticationAllowed()) {
      const currentPort = window.location.port;
      throw new Error(`Authentication is not allowed on port ${currentPort}. Please use port 8888 (netlify dev) for authentication.`);
    }
    
    if (isSupabaseEnabled) {
      // Use direct Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          // If role is specified, validate it matches the user's actual role
          if (role && profile.role !== role) {
            throw new Error(`Invalid role. This account is registered as ${profile.role}`);
          }
          setUser(profile);
        } else {
          throw new Error('User profile not found');
        }
      }
    } else {
      // Use Netlify Functions for production
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Login failed');
      }

      const { user: profile, session } = await response.json();
      
      // Store token for future requests
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
      
      setUser(profile);
    }
  };

  const register = async (userData: RegisterData) => {
    // SECURITY: Check authentication permissions using proven approach
    if (!isAuthenticationAllowed()) {
      const currentPort = window.location.port;
      throw new Error(`Registration is not allowed on port ${currentPort}. Please use port 8888 (netlify dev) for registration.`);
    }
    
    if (isSupabaseEnabled) {
      // Use Supabase admin client for registration (bypasses RLS)
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email for development
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile using admin client
        const profileData: any = {
          id: data.user.id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
        };

        // Add role-specific fields
        if (userData.role === 'teacher') {
          profileData.subjects = userData.subjects || [];
          profileData.years_experience = userData.yearsExperience;
        }

        if (userData.role === 'student') {
          profileData.class_level = userData.classLevel;
          profileData.parent_email = userData.parentEmail;
        }

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profile) {
          setUser(profile);
        }
        return { user: profile, emailConfirmationRequired: !data.user.email_confirmed_at };
      }
    } else {
      // Use Netlify Functions for production
      const response = await fetch('/.netlify/functions/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Registration failed');
      }

      const result = await response.json();
      if (result.user) {
        setUser(result.user);
      }
      return result; // Return the full response including emailConfirmationRequired
    }
  };

  const logout = async () => {
    if (isSupabaseEnabled) {
      // Use direct Supabase authentication
      await supabase.auth.signOut();
    } else {
      // Use Netlify Functions for production
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          await fetch('/.netlify/functions/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
      
      localStorage.removeItem('auth_token');
    }
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isSupabaseEnabled }}>
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

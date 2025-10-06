import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  total_xp?: number;
  streak_days?: number;
  class_level?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'admin' | 'teacher' | 'student') => Promise<void>;
  logout: () => void;
  isSupabaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseEnabled] = useState(isSupabaseConfigured());

  useEffect(() => {
    // Check for existing session on mount
    if (isSupabaseEnabled) {
      checkSession();
    } else {
      // Use mock auth if Supabase not configured
      const stored = localStorage.getItem('mock_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
    }
  }, [isSupabaseEnabled]);

  const checkSession = async () => {
    try {
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
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'admin' | 'teacher' | 'student') => {
    if (!isSupabaseEnabled) {
      // Mock login for demo/testing
      const mockUser: User = {
        id: `mock-${role}-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role,
        total_xp: role === 'student' ? 2450 : undefined,
        streak_days: role === 'student' ? 12 : undefined,
        class_level: role === 'student' ? 'JSS 3' : undefined,
      };
      setUser(mockUser);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      return;
    }

    // Real Supabase login
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
        setUser(profile);
      }
    }
  };

  const logout = async () => {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('mock_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isSupabaseEnabled }}>
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

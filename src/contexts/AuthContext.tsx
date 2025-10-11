import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

const AuthContext = createContext(undefined);

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseEnabled] = useState(isSupabaseConfigured());
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const isCheckingSessionRef = useRef(false);
  const hasInitializedRef = useRef(false);
  
  // Security warnings removed - no longer displayed

  useEffect(() => {
    // Check for existing session on mount only (run once)
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      checkSession();
    }

    // Removed automatic session validation - only logout on explicit user action

    // Listen for Supabase auth state changes
    if (isSupabaseEnabled) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          
          if (event === 'SIGNED_OUT') {
            // User explicitly signed out
            setUser(null);
            localStorage.removeItem('tisham_current_user');
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
            
            // Only redirect on explicit sign out, not on session expiration
            window.location.href = '/';
          } else if (event === 'SIGNED_IN' && session) {
            // User signed in - only handle if we don't already have a user and not checking session
            
            if (!user && !isCheckingSessionRef.current) {
              try {
                const { data: profile, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                
                if (profile && !error) {
                  setUser(profile);
                  localStorage.setItem('tisham_current_user', JSON.stringify(profile));
                  
                  // If we're on login/landing page, redirect to dashboard
                  const currentPath = window.location.hash.substring(1) || window.location.pathname;
                  if (currentPath === 'login' || currentPath === 'landing' || currentPath === '/') {
                    window.location.hash = '#dashboard';
                  }
                } else {
                  await supabase.auth.signOut();
                }
              } catch (error) {
                console.error('Error fetching profile on sign in:', error);
                // Clear session if we can't fetch profile
                await supabase.auth.signOut();
              }
            }
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSupabaseEnabled, isCheckingSession]);

  const checkSession = async () => {
    // Prevent multiple simultaneous session checks
    if (isCheckingSessionRef.current) {
      return;
    }

    // Prevent multiple calls if already initialized
    if (hasInitializedRef.current && user) {
      return;
    }

    isCheckingSessionRef.current = true;
    setIsCheckingSession(true);
    try {
      if (isSupabaseEnabled) {
        // Check localStorage first for stored user
        const storedUser = localStorage.getItem('tisham_current_user');
        if (!storedUser) {
          // No stored user found - check if there's a Supabase session that should be restored
          setUser(null);
          setIsLoading(false);
          
          // Check if there's a valid Supabase session that we should restore
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              // Don't clear the session - let the auth state listener handle it
              // This allows the user to be automatically logged in
            } else {
            }
          } catch (error) {
          }
          
          return;
        }

        const userData = JSON.parse(storedUser);
        
        // Validate session with Supabase and fetch fresh profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          // Clear invalid session
          localStorage.removeItem('tisham_current_user');
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (profileData) {
          // Create fresh user data from profile
          const freshUserData = {
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            role: profileData.role,
            school_id: profileData.school_id,
            teacher_id: profileData.teacher_id,
            student_id: profileData.student_id,
            total_xp: profileData.total_xp,
            streak_days: profileData.streak_days,
            class_level: profileData.class_level,
            subjects: profileData.subjects,
            years_experience: profileData.years_experience
          };
          
          // Set user state and update localStorage with fresh data
          setUser(freshUserData);
          localStorage.setItem('tisham_current_user', JSON.stringify(freshUserData));
        } else {
          // No profile found, clear session
          localStorage.removeItem('tisham_current_user');
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
          setUser(null);
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
      isCheckingSessionRef.current = false;
      setIsLoading(false);
      setIsCheckingSession(false);
    }
  };

  const login = async (email: string, password: string, role?: 'school_admin' | 'teacher' | 'student') => {
    try {
      // Login attempt started
      
      // SECURITY: Check authentication permissions using proven approach
      if (!isAuthenticationAllowed()) {
        const currentPort = window.location.port;
        // Authentication blocked on port
        throw new Error(`Authentication is not allowed on port ${currentPort}. Please use port 8888 (netlify dev) for authentication.`);
      }
      
      if (isSupabaseEnabled) {
      // Using Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Supabase auth result
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (data.user) {
        // User authenticated successfully, fetching profile
        try {
          // Test Supabase connection
          const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (testError) {
            console.error('Supabase connection error:', testError);
            throw new Error(`Database connection failed: ${testError.message}`);
          }
          
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            // If profile doesn't exist, create a basic one
            if (profileError.code === 'PGRST116') {
              // Profile not found, creating basic profile
              const basicProfile = {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || data.user.email,
                role: 'teacher', // Default role
                created_at: new Date().toISOString()
              };
              
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(basicProfile)
                .select()
                .single();
                
              if (insertError) {
                console.error('Failed to create profile:', insertError);
                throw new Error('Failed to create user profile');
              }
              
              // Created basic profile
              setUser(newProfile);
              localStorage.setItem('tisham_current_user', JSON.stringify(newProfile));
              return;
            }
            throw new Error(`User profile not found: ${profileError.message}`);
          }

          if (profile) {
            // If role is specified, validate it matches the user's actual role
            if (role && profile.role !== role) {
              throw new Error(`Invalid role. This account is registered as ${profile.role}`);
            }
            // Set user and store in localStorage
            setUser(profile);
            localStorage.setItem('tisham_current_user', JSON.stringify(profile));
          } else {
            throw new Error('User profile not found');
          }
        } catch (error) {
          console.error('Profile fetch failed:', error);
          throw error;
        }
      }
    } else {
      // Using Netlify Functions authentication
      // Use Netlify Functions for production
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Netlify Functions response

      if (!response.ok) {
        const { error } = await response.json();
        console.error('Netlify Functions error:', error);
        throw new Error(error || 'Login failed');
      }

      const { user: profile, session } = await response.json();
      // Netlify Functions success
      
      // Store token for future requests
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
      
      setUser(profile);
      // Store user data in localStorage for persistence
      localStorage.setItem('tisham_current_user', JSON.stringify(profile));
      // Login completed successfully
    }
    } catch (error) {
      console.error('Login function error:', error);
      throw error;
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
          // Store user data in localStorage for persistence
          localStorage.setItem('tisham_current_user', JSON.stringify(profile));
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
        // Store user data in localStorage for persistence
        localStorage.setItem('tisham_current_user', JSON.stringify(result.user));
      }
      return result; // Return the full response including emailConfirmationRequired
    }
  };

  const logout = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data regardless of success/failure
      setUser(null);
      
      // Clear all localStorage items
      localStorage.removeItem('tisham_current_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-' + (window as any).__ENV__?.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Force page reload to clear any cached state
      window.location.href = '/';
    }
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

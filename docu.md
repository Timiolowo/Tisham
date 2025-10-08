# Persistent Authentication & Navigation Solution

## Problem Analysis

You're experiencing two main issues:
1. **Page reload logs users out** - Users lose their session when refreshing the page
2. **Infinite loading on authentication** - The app gets stuck in a loading state
3. **Back button navigation** - Users can't properly navigate back to previous pages

## Current Implementation Analysis

### How Your askAXA Project Handles Authentication

#### 1. **Authentication Persistence Strategy**

Your project uses a **dual-layer authentication system**:

```typescript
// In AuthProvider.tsx (lines 50-132)
useEffect(() => {
  const initializeUser = async () => {
    try {
      // 1. Check localStorage for stored user
      const storedUser = localStorage.getItem('axa_current_user');
      if (!storedUser) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);
      
      // 2. Fetch fresh data from Supabase to validate session
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (profileError) {
        // Clear invalid session
        localStorage.removeItem('axa_current_user');
        setUser(null);
        setLoading(false);
        return;
      }
      
      // 3. Update user state with fresh data
      setUser(freshUserData);
      localStorage.setItem('axa_current_user', JSON.stringify(freshUserData));
    } catch (error) {
      localStorage.removeItem('axa_current_user');
      setUser(null);
    }
    
    setLoading(false);
  };
  
  initializeUser();
}, []);
```

#### 2. **Protected Route Implementation**

```typescript
// In App.tsx (lines 22-25)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = JSON.parse(localStorage.getItem('axa_current_user') || 'null');
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
```

## The Problem with Your Current Implementation

### Issue 1: **Race Condition in ProtectedRoute**

Your `ProtectedRoute` component checks `localStorage` **immediately** without waiting for the `AuthProvider` to finish loading. This causes:

1. **Immediate redirect to login** even when user is authenticated
2. **Infinite loading** because the auth state is still being initialized
3. **Flickering** between authenticated and unauthenticated states

### Issue 2: **Missing Loading State in ProtectedRoute**

The `ProtectedRoute` doesn't consider the `loading` state from `AuthProvider`, causing premature redirects.

## Complete Solution Implementation

### Step 1: Fix ProtectedRoute Component

```typescript
// Replace the ProtectedRoute in App.tsx with this improved version
import { useAuth } from './contexts/AuthProvider';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render protected content
  return <>{children}</>;
}
```

### Step 2: Improve AuthProvider Loading Logic

```typescript
// In AuthProvider.tsx, modify the useEffect around line 50
useEffect(() => {
  const initializeUser = async () => {
    try {
      // Check localStorage first
      const storedUser = localStorage.getItem('axa_current_user');
      if (!storedUser) {
        console.log('🔍 No stored user found');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);
      console.log('🔍 Found stored user, validating with Supabase...');
      
      // Validate session with Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile validation failed:', profileError);
        localStorage.removeItem('axa_current_user');
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (profileData) {
        // Create fresh user data
        const freshUserData = {
          id: userData.id,
          email: userData.email,
          firstName: profileData.first_name || userData.firstName || userData.email.split('@')[0],
          surname: profileData.surname || userData.surname || '',
          profileImage: profileData.profile_image_url || userData.profileImage,
          isStaff: profileData.is_staff || userData.isStaff || userData.email.includes('@axa'),
          dateOfBirth: profileData.date_of_birth ? new Date(profileData.date_of_birth).toISOString().split('T')[0] : userData.dateOfBirth,
          phone: profileData.phone || userData.phone,
          gender: profileData.gender || userData.gender,
          nationality: profileData.nationality || userData.nationality || 'Nigerian',
          jobType: profileData.job_type || userData.jobType,
          monthlyIncome: profileData.monthly_income_range || userData.monthlyIncome,
          educationLevel: profileData.education_level || userData.educationLevel,
          state: profileData.state || userData.state,
          preferredLanguage: profileData.preferred_language || userData.preferredLanguage || 'English',
          createdAt: profileData.inserted_at || userData.createdAt,
          lastLogin: new Date().toISOString(),
        };
        
        console.log('✅ User authenticated successfully');
        setUser(freshUserData);
        localStorage.setItem('axa_current_user', JSON.stringify(freshUserData));
      } else {
        console.error('❌ No profile data found');
        localStorage.removeItem('axa_current_user');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Authentication initialization error:', error);
      localStorage.removeItem('axa_current_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  initializeUser();
}, []);
```

### Step 3: Add Supabase Session Management

```typescript
// Add this to your AuthProvider.tsx to handle Supabase sessions
useEffect(() => {
  // Listen for Supabase auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('🔐 Supabase auth state changed:', event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        // User signed out or session expired
        localStorage.removeItem('axa_current_user');
        setUser(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, fetch profile data
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            const userData = {
              id: session.user.id,
              email: session.user.email,
              firstName: profileData.first_name || session.user.email?.split('@')[0] || '',
              surname: profileData.surname || '',
              profileImage: profileData.profile_image_url,
              isStaff: profileData.is_staff || session.user.email?.includes('@axa') || false,
              dateOfBirth: profileData.date_of_birth ? new Date(profileData.date_of_birth).toISOString().split('T')[0] : undefined,
              phone: profileData.phone,
              gender: profileData.gender,
              nationality: profileData.nationality || 'Nigerian',
              jobType: profileData.job_type,
              monthlyIncome: profileData.monthly_income_range,
              educationLevel: profileData.education_level,
              state: profileData.state,
              preferredLanguage: profileData.preferred_language || 'English',
              createdAt: profileData.inserted_at || session.user.created_at,
              lastLogin: new Date().toISOString(),
            };
            
            setUser(userData);
            localStorage.setItem('axa_current_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching profile on auth state change:', error);
        }
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Step 4: Improve Navigation with History Management

```typescript
// Create a custom hook for navigation management
// In src/hooks/useNavigation.ts (create new file)
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Store current location in sessionStorage for back navigation
    sessionStorage.setItem('lastLocation', location.pathname);
  }, [location]);

  const goBack = () => {
    const lastLocation = sessionStorage.getItem('lastLocation');
    if (lastLocation && lastLocation !== location.pathname) {
      navigate(-1); // Use browser's back button
    } else {
      navigate('/'); // Fallback to home
    }
  };

  return { goBack };
};
```

### Step 5: Add Loading States to App Component

```typescript
// Update your App.tsx to handle loading states properly
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
// ... other imports

// Improved ProtectedRoute with loading state
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Main App component
function AppContent() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/confirmation-success" element={<EmailConfirmationSuccess />} />
          <Route path="/email-confirmed" element={<Navigate to="/confirmation-success" replace />} />
          <Route path="/team" element={<Team />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

## Why This Solution Works

### 1. **Persistent Authentication**
- **localStorage** stores user data across page reloads
- **Supabase validation** ensures the session is still valid
- **Loading states** prevent premature redirects

### 2. **Proper Loading Management**
- **AuthProvider loading state** prevents race conditions
- **ProtectedRoute loading** shows spinner while authenticating
- **Error handling** clears invalid sessions gracefully

### 3. **Navigation Support**
- **Browser history** is preserved
- **Back button** works correctly
- **Session storage** tracks navigation state

### 4. **Session Synchronization**
- **Supabase auth state** is monitored
- **Automatic logout** on session expiration
- **Fresh data** fetched on each page load

## Testing the Implementation

### 1. **Test Page Reload**
1. Login to your app
2. Navigate to `/chat` or `/profile`
3. Refresh the page (F5 or Ctrl+R)
4. **Expected**: User stays logged in, no redirect to login

### 2. **Test Back Button**
1. Navigate: Home → Login → Chat → Profile
2. Use browser back button
3. **Expected**: Proper navigation back through pages

### 3. **Test Session Expiration**
1. Login and wait for session to expire
2. Try to access protected route
3. **Expected**: Automatic redirect to login

## Additional Improvements

### 1. **Add Session Refresh**
```typescript
// Add to AuthProvider.tsx
const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return null;
  }
};
```

### 2. **Add Network Status Handling**
```typescript
// Add to AuthProvider.tsx
useEffect(() => {
  const handleOnline = () => {
    // Refresh session when coming back online
    if (user) {
      refreshSession();
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, [user]);
```

This solution addresses all your authentication and navigation issues while maintaining the robust architecture of your askAXA project.

// Environment Configuration
// This file helps manage environment variables for Supabase

export const ENV_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Check if Supabase is properly configured
  isConfigured: () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && anonKey && serviceKey && !url.includes('placeholder') && !anonKey.includes('placeholder') && !serviceKey.includes('placeholder'));
  }
};

// Development helper
export const DEV_CONFIG = {
  // Set to true to enable development mode with mock data
  USE_MOCK_AUTH: false, // Set to true only for testing without Supabase
  
  // Development Supabase project (replace with your actual values)
  DEV_SUPABASE_URL: 'https://your-project-id.supabase.co',
  DEV_SUPABASE_ANON_KEY: 'your-anon-key-here'
};
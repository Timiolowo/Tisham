// Environment Configuration
// This file helps manage environment variables for Supabase
import { runtimeEnv } from './runtime-env';

export const ENV_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: runtimeEnv.getEnv().VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: runtimeEnv.getEnv().VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: runtimeEnv.getEnv().VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Check if Supabase is properly configured
  isConfigured: () => {
    const env = runtimeEnv.getEnv();
    const url = env.VITE_SUPABASE_URL;
    const anonKey = env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && anonKey && serviceKey && !url.includes('placeholder') && !anonKey.includes('placeholder') && !serviceKey.includes('placeholder'));
  }
};

// Development helper
export const DEV_CONFIG = {
  // Set to true to enable development mode with mock data
  USE_MOCK_AUTH: false, // Set to true only for testing without Supabase
};
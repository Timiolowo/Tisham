// Runtime Environment Variable Loader
// This module loads environment variables at runtime to prevent build-time exposure

interface RuntimeEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_SUPABASE_SERVICE_ROLE_KEY: string;
  VITE_GROQ_API_KEY: string;
}

class RuntimeEnvLoader {
  private static instance: RuntimeEnvLoader;
  private env: RuntimeEnv | null = null;

  private constructor() {}

  static getInstance(): RuntimeEnvLoader {
    if (!RuntimeEnvLoader.instance) {
      RuntimeEnvLoader.instance = new RuntimeEnvLoader();
    }
    return RuntimeEnvLoader.instance;
  }

  getEnv(): RuntimeEnv {
    if (this.env) {
      return this.env;
    }

    // Load environment variables at runtime
    this.env = {
      VITE_SUPABASE_URL: this.getEnvVar('VITE_SUPABASE_URL'),
      VITE_SUPABASE_ANON_KEY: this.getEnvVar('VITE_SUPABASE_ANON_KEY'),
      VITE_SUPABASE_SERVICE_ROLE_KEY: this.getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY'),
      VITE_GROQ_API_KEY: this.getEnvVar('VITE_GROQ_API_KEY'),
    };

    return this.env;
  }

  private getEnvVar(key: string): string {
    // Try to get from window object (set by Netlify at runtime)
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      return (window as any).__ENV__[key] || '';
    }
    
    // Fallback to import.meta.env (works in development, blocked in production)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[key];
      if (value && value !== '""' && value !== '') {
        return value;
      }
    }
    
    // Development fallback - provide placeholder values to prevent errors
    if (key === 'VITE_SUPABASE_URL') {
      return 'https://placeholder.supabase.co';
    }
    if (key === 'VITE_SUPABASE_ANON_KEY') {
      return 'placeholder-anon-key';
    }
    if (key === 'VITE_SUPABASE_SERVICE_ROLE_KEY') {
      return 'placeholder-service-key';
    }
    if (key === 'VITE_GROQ_API_KEY') {
      return 'placeholder-groq-key';
    }
    
    return '';
  }
}

export const runtimeEnv = RuntimeEnvLoader.getInstance();
export default runtimeEnv;

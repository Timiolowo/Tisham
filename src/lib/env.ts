/**
 * Environment configuration utility
 * Safely access environment variables
 */

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Failed to access environment variable: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(): boolean {
  const key = getEnvVar('VITE_GROQ_API_KEY');
  console.log('Checking API key:', key ? `${key.substring(0, 10)}...` : 'undefined');
  const isConfigured = Boolean(key && key !== 'your_groq_api_key_here' && key !== '' && key.length > 10);
  console.log('API key configured:', isConfigured);
  return isConfigured;
}

/**
 * Get Groq API key
 */
export function getGroqApiKey(): string | undefined {
  const key = getEnvVar('VITE_GROQ_API_KEY');
  
  if (!key || key === 'your_groq_api_key_here' || key === '') {
    return undefined;
  }
  
  return key;
}

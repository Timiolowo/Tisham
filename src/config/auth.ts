// Authentication Configuration
// Based on proven approach from other project

export const AUTH_CONFIG = {
  ALLOWED_PORTS: ['8888', '443', '80'], // Production and Netlify Dev ports
  BLOCKED_PORTS: ['3000', '5173'], // Development ports
  ALLOWED_HOSTS: ['localhost', '127.0.0.1', 'your-production-domain.com'],
  ENVIRONMENT: import.meta.env.MODE || 'development'
};

export const isAuthenticationAllowed = (): boolean => {
  const currentPort = window.location.port;
  const currentHost = window.location.hostname;
  
  // Check if current port is blocked
  if (AUTH_CONFIG.BLOCKED_PORTS.includes(currentPort)) {
    return false;
  }
  
  // Check if current host is allowed
  if (!AUTH_CONFIG.ALLOWED_HOSTS.includes(currentHost)) {
    return false;
  }
  
  return true;
};

export const isAPIAccessAllowed = (): boolean => {
  const currentPort = window.location.port;
  const currentHost = window.location.hostname;
  
  // Only allow API access on full-stack port (8888)
  if (currentPort !== '8888' && currentHost !== 'localhost:8888') {
    return false;
  }
  
  return true;
};

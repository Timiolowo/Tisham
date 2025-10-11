// Authentication Configuration
// Based on proven approach from other project

export const AUTH_CONFIG = {
  ALLOWED_PORTS: ['8888', '443', '80'], // Production and Netlify Dev ports
  BLOCKED_PORTS: ['3000', '5173', '5174', '5175'], // Development ports
  ALLOWED_HOSTS: ['localhost', '127.0.0.1', 'your-production-domain.com', 'tisham.netlify.app', 'tisham.app', 'teeechat.netlify.app'],
  ENVIRONMENT: import.meta.env.MODE || 'development'
};

export const isAuthenticationAllowed = (): boolean => {
  const currentPort = window.location.port;
  const currentHost = window.location.hostname;
  
  // Allow production domains (no port restrictions)
  if (currentHost.includes('netlify.app') || 
      currentHost.includes('tisham.app') || 
      currentHost.includes('teeechat.netlify.app') ||
      currentHost.includes('your-production-domain.com')) {
    return true;
  }
  
  // For localhost, check port restrictions
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // Check if current port is blocked
    if (AUTH_CONFIG.BLOCKED_PORTS.includes(currentPort)) {
      return false;
    }
    return true;
  }
  
  // Allow other production domains
  return true;
};

export const isAPIAccessAllowed = (): boolean => {
  const currentPort = window.location.port;
  const currentHost = window.location.hostname;
  
  // Allow production domains (no port restrictions)
  if (currentHost.includes('netlify.app') || 
      currentHost.includes('tisham.app') || 
      currentHost.includes('teeechat.netlify.app') ||
      currentHost.includes('your-production-domain.com')) {
    return true;
  }
  
  // For localhost, only allow full-stack port (8888)
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return currentPort === '8888';
  }
  
  // Allow other production domains
  return true;
};

// Port Validation for Netlify Functions
// Based on proven approach from other project

export interface PortValidationResult {
  allowed: boolean;
  error?: string;
}

export const validateAuthenticationRequest = (event: any): PortValidationResult => {
  const origin = event.headers.origin || event.headers.referer || '';
  const userAgent = event.headers['user-agent'] || '';
  
  // Block requests from development ports
  if (origin.includes(':3000') || origin.includes('localhost:3000') ||
      origin.includes(':5173') || origin.includes('localhost:5173')) {
    return {
      allowed: false,
      error: 'Authentication blocked: Development ports are not authorized for authentication'
    };
  }
  
  // Allow requests from Netlify Dev port and production
  if (origin.includes(':8888') || origin.includes('localhost:8888') || 
      !origin.includes('localhost') || origin.includes('your-production-domain.com')) {
    return { allowed: true };
  }
  
  return { 
    allowed: false, 
    error: 'Authentication not allowed from this origin' 
  };
};

export const validateAPIRequest = (event: any): PortValidationResult => {
  const origin = event.headers.origin || event.headers.referer || '';
  
  // Only allow API requests from full-stack port
  if (origin.includes(':8888') || origin.includes('localhost:8888')) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    error: 'API access blocked: Only available on full-stack development server (port 8888)'
  };
};

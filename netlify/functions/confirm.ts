import { Handler } from '@netlify/functions';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const params = event.queryStringParameters || {};
  console.log('Received parameters:', params);
  
  // Check if this is a callback from Supabase after verification
  if (params.code || params.access_token) {
    // This is a callback from Supabase after successful verification
    console.log('Supabase callback detected, redirecting to success page');
    const baseUrl = process.env.URL || 'https://tisham.netlify.app';
    const location = `${baseUrl}/#email-confirmation-success`;
    
    return {
      statusCode: 302,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Location': location 
      }
    };
  }
  
  // Supabase confirmation link provides token_hash + type (+ optional redirect_to)
  const token_hash = params.token_hash || params.token;
  const type = params.type;
  const redirect_to = params.redirect_to || 'https://tisham.netlify.app/confirm';

  if (!token_hash || !type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters', received: params })
    };
  }

  if (!supabaseUrl) {
    return { statusCode: 500, body: 'Missing SUPABASE_URL env' };
  }

  // Just hand off to Supabase's verifier
  const location =
    `${supabaseUrl.replace(/\/$/, '')}` +
    `/auth/v1/verify?type=${encodeURIComponent(type)}` +
    `&token_hash=${encodeURIComponent(token_hash)}` +
    `&redirect_to=${encodeURIComponent(redirect_to)}`;

  console.log('Redirecting to Supabase verify:', location);

  return {
    statusCode: 302,
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Location': location 
    }
  };
};

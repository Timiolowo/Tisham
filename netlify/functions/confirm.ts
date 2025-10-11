import { Handler, HandlerResponse } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context): Promise<HandlerResponse> => {
  // Only allow GET requests for email confirmation
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { token_hash, type, email } = event.queryStringParameters || {};

    if (!token_hash || !type || !email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the email confirmation token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email',
      email,
    });

    if (error) {
      console.error('Email confirmation error:', error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
        body: JSON.stringify({ error: error.message }),
      };
    }

    if (!data.user) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    console.log('Email confirmed successfully for user:', data.user.email);

    // Redirect to email confirmation success page
    const baseUrl = process.env.URL || 'https://tisham.netlify.app';
    const location = `${baseUrl}/#email-confirmation-success?email=${encodeURIComponent(email)}`;
    return {
      statusCode: 302,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Location': location,
      },
    };
  } catch (error: any) {
    console.error('Email confirmation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

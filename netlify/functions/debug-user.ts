import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');
    
    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Debugging user:', email);

    // 1. Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers({
      filter: { email: email }
    });

    if (userError) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: `Error checking user: ${userError.message}`,
          userExists: false
        }),
      };
    }

    if (!users.users || users.users.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          userExists: false,
          message: 'User does not exist. Please register first.',
          email: email
        }),
      };
    }

    const user = users.users[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    });

    // 2. Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          isConfirmed: !!user.email_confirmed_at
        },
        profile: profile || null,
        profileExists: !!profile,
        message: user.email_confirmed_at 
          ? 'User exists and is confirmed. Can login.' 
          : 'User exists but email is NOT confirmed. Must click email link first.'
      }),
    };

  } catch (error: any) {
    console.error('Debug user error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

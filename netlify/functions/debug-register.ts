import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password, fullName, role } = JSON.parse(event.body || '{}');
    
    console.log('=== DEBUG REGISTRATION ===');
    console.log('Input data:', { email, password: '***', fullName, role });
    console.log('Environment check:', {
      supabaseUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey
    });

    // Test 1: Try with anon key (should trigger email confirmation)
    console.log('Test 1: Using anon key for signup...');
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonData, error: anonError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    console.log('Anon signup result:', {
      user: anonData.user ? {
        id: anonData.user.id,
        email: anonData.user.email,
        email_confirmed_at: anonData.user.email_confirmed_at,
        created_at: anonData.user.created_at
      } : null,
      session: anonData.session,
      error: anonError
    });

    if (anonError) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Anon signup failed',
          details: anonError.message 
        }),
      };
    }

    // Test 2: Try with service key (bypasses email confirmation)
    console.log('Test 2: Using service key for signup...');
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: serviceData, error: serviceError } = await supabaseService.auth.signUp({
      email: email + '.service', // Different email to avoid conflict
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    console.log('Service signup result:', {
      user: serviceData.user ? {
        id: serviceData.user.id,
        email: serviceData.user.email,
        email_confirmed_at: serviceData.user.email_confirmed_at,
        created_at: serviceData.user.created_at
      } : null,
      session: serviceData.session,
      error: serviceError
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        anonResult: {
          user: anonData.user ? {
            id: anonData.user.id,
            email: anonData.user.email,
            email_confirmed_at: anonData.user.email_confirmed_at,
            created_at: anonData.user.created_at
          } : null,
          session: anonData.session,
          error: anonError
        },
        serviceResult: {
          user: serviceData.user ? {
            id: serviceData.user.id,
            email: serviceData.user.email,
            email_confirmed_at: serviceData.user.email_confirmed_at,
            created_at: serviceData.user.created_at
          } : null,
          session: serviceData.session,
          error: serviceError
        }
      }),
    };
  } catch (error: any) {
    console.error('Debug registration error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Debug failed',
        details: error.message 
      }),
    };
  }
};

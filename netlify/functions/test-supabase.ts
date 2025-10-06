import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context) => {
  try {
    console.log('Testing Supabase configuration...');
    console.log('Environment variables:', {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      hasServiceKey: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.length || 0
    });

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('Health check failed:', healthError);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Supabase connection failed',
          details: healthError.message 
        }),
      };
    }

    console.log('✅ Supabase connection successful');

    // Test 2: Check auth settings
    console.log('Test 2: Testing auth configuration...');
    
    // Test 3: Try to get auth settings (this might not work with service key)
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('Auth session test:', { authData, authError });
    } catch (authTestError) {
      console.log('Auth test error (expected with service key):', authTestError);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Supabase is configured correctly',
        config: {
          url: supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          serviceKeyLength: supabaseServiceKey?.length || 0
        }
      }),
    };
  } catch (error: any) {
    console.error('Test failed:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Test failed',
        details: error.message 
      }),
    };
  }
};

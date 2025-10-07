import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all users from auth
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Failed to get users',
          details: usersError.message
        }),
      };
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    // Get all schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Debug information retrieved',
        users: users?.users?.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata
        })) || [],
        profiles: profiles || [],
        schools: schools || [],
        counts: {
          users: users?.users?.length || 0,
          profiles: profiles?.length || 0,
          schools: schools?.length || 0
        }
      }),
    };
  } catch (error: any) {
    console.error('Debug error:', error);
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

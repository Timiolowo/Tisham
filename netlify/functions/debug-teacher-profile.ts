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

    console.log('Debugging teacher profile for:', email);

    // 1. Get user from auth
    const { data: users, error: userError } = await supabase.auth.admin.listUsers({
      filter: { email: email }
    });

    if (userError || !users.users || users.users.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          userExists: false,
          message: 'User does not exist.',
          email: email
        }),
      };
    }

    const user = users.users[0];
    console.log('User found:', user.id, user.email);

    // 2. Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          userExists: true,
          profileExists: false,
          error: `Profile error: ${profileError.message}`,
          user: {
            id: user.id,
            email: user.email,
            role: 'unknown'
          }
        }),
      };
    }

    console.log('Profile found:', profile);

    // 3. If teacher has school_id, fetch school data
    let schoolData = null;
    if (profile.school_id) {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', profile.school_id)
        .single();

      if (schoolError) {
        console.error('School fetch error:', schoolError);
      } else {
        schoolData = school;
        console.log('School data:', school);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at
        },
        profile: profile,
        profileExists: true,
        school: schoolData,
        schoolExists: !!schoolData,
        message: `Profile found for ${profile.role}. School ID: ${profile.school_id || 'None'}`
      }),
    };

  } catch (error: any) {
    console.error('Debug teacher profile error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

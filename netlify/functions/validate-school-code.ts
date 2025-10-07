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
    const { schoolCode } = JSON.parse(event.body || '{}');
    
    if (!schoolCode) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'School code is required' }),
      };
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Validating school code:', schoolCode);

    // Check if school exists with this code
    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('school_code', schoolCode)
      .single();

    if (error || !school) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid school code. Please check with your school administrator.',
          schoolCode: schoolCode
        }),
      };
    }

    console.log('School found:', school);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        school: {
          id: school.id,
          name: school.name,
          school_type: school.school_type,
          state: school.state,
          address: school.address,
          contact_email: school.contact_email,
          contact_phone: school.contact_phone,
          school_code: school.school_code
        },
        message: 'School code is valid'
      }),
    };

  } catch (error: any) {
    console.error('School code validation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

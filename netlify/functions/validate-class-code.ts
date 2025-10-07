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
    const { classCode } = JSON.parse(event.body || '{}');
    
    if (!classCode) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Class code is required' }),
      };
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Validating class code:', classCode);

    // Check if class exists with this code
    const { data: classData, error } = await supabase
      .from('classes')
      .select('*, schools(name, school_type, state)')
      .eq('class_code', classCode)
      .single();

    if (error || !classData) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid class code. Please check with your teacher.',
          classCode: classCode
        }),
      };
    }

    console.log('Class found:', classData);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        class: {
          id: classData.id,
          name: classData.name,
          level: classData.level,
          class_code: classData.class_code,
          school_id: classData.school_id,
          school: classData.schools
        },
        message: 'Class code is valid'
      }),
    };

  } catch (error: any) {
    console.error('Class code validation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

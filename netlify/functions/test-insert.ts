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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Testing data insertion with service role key...');
    console.log('Supabase URL configured:', !!supabaseUrl);
    console.log('Service key configured:', !!supabaseServiceKey);
    
    // Test school insertion
    const testSchoolCode = 'TEST' + Math.floor(100000 + Math.random() * 900000);
    const schoolData = {
      name: 'Test School',
      school_type: 'public',
      state: 'Lagos',
      address: 'Test Address',
      contact_email: 'test@school.com',
      contact_phone: '123-456-7890',
      admin_name: 'Test Admin',
      school_code: testSchoolCode
    };
    
    console.log('Inserting test school:', schoolData);
    
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single();

    if (schoolError) {
      console.error('School insertion error:', schoolError);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'School insertion failed',
          details: schoolError.message,
          code: schoolError.code
        }),
      };
    }

    console.log('School inserted successfully:', school);

    // Test profile insertion (using a test user ID)
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const profileData = {
      id: testUserId,
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'school_admin',
      school_id: school.id
    };
    
    console.log('Inserting test profile:', profileData);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile insertion error:', profileError);
      // Clean up the school
      await supabase.from('schools').delete().eq('id', school.id);
      
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Profile insertion failed',
          details: profileError.message,
          code: profileError.code
        }),
      };
    }

    console.log('Profile inserted successfully:', profile);

    // Clean up test data
    await supabase.from('profiles').delete().eq('id', testUserId);
    await supabase.from('schools').delete().eq('id', school.id);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Data insertion test passed',
        school: school,
        profile: profile,
        schoolCode: testSchoolCode
      }),
    };
  } catch (error: any) {
    console.error('Test insertion error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Test insertion failed',
        details: error.message
      }),
    };
  }
};

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
    const { email, password, fullName, role, schoolName, schoolType, state, address, contactEmail, contactPhone, adminName } = JSON.parse(event.body || '{}');
    
    if (!email || !password || !fullName || !role) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Force inserting data for user:', email);
    
    // 1. Create user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        full_name: fullName,
        role: role,
        school_name: schoolName,
        school_type: schoolType,
        school_state: state,
        school_address: address,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        admin_name: adminName
      }
    });

    if (userError || !userData.user) {
      console.error('User creation error:', userError);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `User creation failed: ${userError?.message}` }),
      };
    }

    console.log('User created successfully:', userData.user.id);

    // 2. Create school if it's a school admin
    let schoolId = null;
    let schoolCode = null;
    
    if (role === 'school_admin') {
      schoolCode = 'TCN' + Math.floor(100000 + Math.random() * 900000);
      
      const schoolData = { 
        name: schoolName, 
        school_type: schoolType, 
        state, 
        address, 
        contact_email: contactEmail, 
        contact_phone: contactPhone, 
        admin_name: adminName,
        school_code: schoolCode
      };
      
      console.log('Creating school:', schoolData);
      
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert(schoolData)
        .select()
        .single();

      if (schoolError) {
        console.error('School creation error:', schoolError);
        await supabase.auth.admin.deleteUser(userData.user.id);
        return {
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: `School creation failed: ${schoolError.message}` }),
        };
      }
      
      schoolId = school.id;
      console.log('School created successfully:', school);
    }

    // 3. Create profile
    const profileData = {
      id: userData.user.id,
      email: userData.user.email,
      full_name: fullName,
      role,
      ...(schoolId && { school_id: schoolId })
    };
    
    console.log('Creating profile:', profileData);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await supabase.auth.admin.deleteUser(userData.user.id);
      if (schoolId) {
        await supabase.from('schools').delete().eq('id', schoolId);
      }
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }),
      };
    }

    console.log('Profile created successfully:', profile);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Data inserted successfully',
        user: userData.user,
        profile: profile,
        schoolId: schoolId,
        schoolCode: schoolCode
      }),
    };
  } catch (error: any) {
    console.error('Force insert error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Force insert failed',
        details: error.message
      }),
    };
  }
};

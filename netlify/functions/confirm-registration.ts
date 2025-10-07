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
    const { token_hash, type, email } = event.queryStringParameters || {};
    
    console.log('Confirmation request:', { token_hash, type, email });
    
    if (!token_hash || !type || !email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify the confirmation token
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: token_hash,
      type: type as any
    });

    if (verifyError) {
      console.error('Confirmation verification error:', verifyError);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Confirmation failed: ${verifyError.message}` }),
      };
    }

    console.log('Email confirmed successfully:', verifyData);

    if (!verifyData.user) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found after confirmation' }),
      };
    }

    // 2. Get user metadata (registration data)
    const userMetadata = verifyData.user.user_metadata || {};
    console.log('User metadata:', userMetadata);
    
    const {
      full_name: fullName,
      role,
      school_name: schoolName,
      school_type: schoolType,
      school_state: state,
      school_address: address,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      admin_name: adminName,
      subjects,
      years_experience,
      school_code,
      class_code,
      student_id: studentId,
      class_level: classLevel,
      parent_email: parentEmail
    } = userMetadata;

    console.log('Processing registration for role:', role);

    // 3. Create profile data
    const profileData: any = {
      id: verifyData.user.id,
      email: verifyData.user.email,
      full_name: fullName,
      role,
    };

    let schoolId = null;
    let schoolCode = null;

    // 4. Handle role-specific data
    if (role === 'school_admin') {
      // Generate a unique school code
      schoolCode = 'TCN' + Math.floor(100000 + Math.random() * 900000);
      
      console.log('Creating school for admin:', { schoolName, schoolType, state, address, contactEmail, contactPhone, adminName, schoolCode });
      
      // Create school and link to profile using service role key
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({ 
          name: schoolName, 
          school_type: schoolType, 
          state, 
          address, 
          contact_email: contactEmail, 
          contact_phone: contactPhone, 
          admin_name: adminName,
          school_code: schoolCode
        })
        .select()
        .single();

      if (schoolError) {
        console.error('School creation error:', schoolError);
        await supabase.auth.admin.deleteUser(verifyData.user.id); // Rollback user creation
        return {
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: `School creation failed: ${schoolError.message}` }),
        };
      }
      
      console.log('School created successfully:', school);
      profileData.school_id = school.id;
      schoolId = school.id;

    } else if (role === 'teacher') {
      // Verify school code and link to school
      const { data: school, error: schoolCodeError } = await supabase
        .from('schools')
        .select('id')
        .eq('school_code', schoolCode)
        .single();

      if (schoolCodeError || !school) {
        await supabase.auth.admin.deleteUser(verifyData.user.id);
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Invalid school code' }),
        };
      }
      profileData.school_id = school.id;
      profileData.subjects = subjects;
      profileData.years_experience = yearsExperience;

    } else if (role === 'student') {
      // Verify class code and link to class
      const { data: classData, error: classCodeError } = await supabase
        .from('classes')
        .select('id, school_id')
        .eq('class_code', classCode)
        .single();

      if (classCodeError || !classData) {
        await supabase.auth.admin.deleteUser(verifyData.user.id);
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Invalid class code' }),
        };
      }
      profileData.school_id = classData.school_id;
      profileData.class_level = classLevel;
      profileData.parent_email = parentEmail;
    }

    // 5. Create the profile using service role key
    console.log('Inserting profile data with service role key:', profileData);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await supabase.auth.admin.deleteUser(verifyData.user.id); // Rollback user creation
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }),
      };
    }

    // 6. If student, enroll in class
    if (role === 'student' && classData?.id) {
      const { error: enrollmentError } = await supabase
        .from('class_enrollments')
        .insert({ class_id: classData.id, student_id: profile.id });

      if (enrollmentError) {
        console.error('Error enrolling student:', enrollmentError);
        // Not critical enough to roll back user, but log it
      }
    }

    console.log('Registration completed successfully for user:', verifyData.user.id);
    console.log('Profile created:', profile);
    console.log('School ID:', schoolId);
    console.log('School Code:', schoolCode);

    // 7. Redirect to login page with success message
    const redirectUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/login?message=Registration completed successfully! You can now login.`;
    
    return {
      statusCode: 302,
      headers: {
        'Location': redirectUrl,
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
  } catch (error: any) {
    console.error('Confirmation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

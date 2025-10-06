import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, token, password } = JSON.parse(event.body || '{}');
    
    console.log('Verifying OTP for:', email);
    
    if (!email || !token || !password) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email, token, and password are required' }),
      };
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify the OTP token
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (verifyError) {
      console.error('OTP verification error:', verifyError);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `OTP verification failed: ${verifyError.message}` }),
      };
    }

    console.log('OTP verified successfully:', verifyData);

    if (!verifyData.user) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found after OTP verification' }),
      };
    }

    // 2. Update user password (since OTP doesn't set password)
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      verifyData.user.id,
      { password: password }
    );

    if (passwordError) {
      console.error('Password update error:', passwordError);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Failed to set password: ${passwordError.message}` }),
      };
    }

    // 3. Get user metadata (registration data)
    const userMetadata = verifyData.user.user_metadata || {};
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

    // 4. Create profile data
    const profileData: any = {
      id: verifyData.user.id,
      email: verifyData.user.email,
      full_name: fullName,
      role,
    };

    let schoolId = null;

    // Handle role-specific data
    if (role === 'school_admin') {
      console.log('Creating school for admin:', { schoolName, schoolType, state, address, contactEmail, contactPhone, adminName });
      
      // Create school and link to profile
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({ 
          name: schoolName, 
          school_type: schoolType, 
          state, 
          address, 
          contact_email: contactEmail, 
          contact_phone: contactPhone, 
          admin_name: adminName 
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

    // 5. Create the profile
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

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        user: profile,
        schoolId,
        message: 'Registration completed successfully!'
      }),
    };
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

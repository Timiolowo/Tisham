import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
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
    const userData = JSON.parse(event.body || '{}');
    console.log('Received registration data:', userData);
    console.log('Environment variables:', {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    });
    
    const { email, password, fullName, role, schoolCode, classCode, schoolName, schoolType, state, address, contactEmail, contactPhone, adminName, subjects, yearsExperience, studentId, classLevel, parentEmail } = userData;

    console.log('Extracted fields:', { email, password, fullName, role });
    if (!email || !password || !fullName || !role) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing required registration fields' }),
      };
    }

    // Create Supabase client with service role key for user creation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Supabase configuration:', {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0
    });

    // 1. Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:8888'}/auth/callback`
      }
    });

    if (error) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: error.message }),
      };
    }

    if (!data.user) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'User creation failed' }),
      };
    }

    console.log('User created:', data.user.id, 'Email confirmed:', data.user.email_confirmed_at);
    console.log('User email:', data.user.email);
    console.log('User status:', data.user.email_confirmed_at ? 'CONFIRMED' : 'PENDING CONFIRMATION');
    console.log('Session data:', data.session);

    // 2. Create a profile entry in the 'profiles' table
    const profileData: any = {
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    };

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
        await supabase.auth.admin.deleteUser(data.user.id); // Rollback user creation
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: `School creation failed: ${schoolError.message}` }),
        };
      }
      
      console.log('School created successfully:', school);
      profileData.school_id = school.id;
    } else if (role === 'teacher') {
      // Verify school code and link to school
      const { data: school, error: schoolCodeError } = await supabase
        .from('schools')
        .select('id')
        .eq('school_code', schoolCode)
        .single();

      if (schoolCodeError || !school) {
        await supabase.auth.admin.deleteUser(data.user.id);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
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
        await supabase.auth.admin.deleteUser(data.user.id);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Invalid class code' }),
        };
      }
      profileData.school_id = classData.school_id;
      profileData.class_level = classLevel;
      profileData.parent_email = parentEmail;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id); // Rollback user creation
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: profileError.message }),
      };
    }

    // If student, enroll in class
    if (role === 'student' && classData?.id) {
      const { error: enrollmentError } = await supabase
        .from('class_enrollments')
        .insert({ class_id: classData.id, student_id: profile.id });

      if (enrollmentError) {
        console.error('Error enrolling student:', enrollmentError);
        // Not critical enough to roll back user, but log it
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        user: profile,
        message: 'Registration successful! Please check your email to confirm your account.',
        emailConfirmationRequired: !data.user.email_confirmed_at
      }),
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

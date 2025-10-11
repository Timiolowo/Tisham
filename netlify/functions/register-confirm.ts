import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    
    const { email, password, fullName, role, schoolName, schoolType, state, address, contactEmail, contactPhone, adminName, subjects, yearsExperience, schoolCode, classCode, studentId, classLevel, parentEmail } = userData;

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

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Supabase configuration:', {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0
    });

    // 1. Create user with email confirmation (same as OTP but for confirmation)
    console.log('Creating user with email confirmation:', email);
    const { data: userData_result, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // This will trigger email confirmation
      user_metadata: {
        full_name: fullName,
        role: role,
        school_name: schoolName,
        school_type: schoolType,
        school_state: state,
        school_address: address,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        admin_name: adminName,
        subjects: subjects,
        years_experience: yearsExperience,
        school_code: schoolCode,
        class_code: classCode,
        student_id: studentId,
        class_level: classLevel,
        parent_email: parentEmail
      }
    });

    if (userError) {
      console.error('User creation error:', userError);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: `Failed to create user: ${userError.message}` }),
      };
    }

    console.log('User created successfully:', userData_result);

    // 2. Create school and profile data immediately (before email confirmation)
    console.log('Creating school and profile data immediately...');
    
    let schoolId = null;
    let generatedSchoolCode = null;

    if (role === 'school_admin') {
      // Generate a unique school code
      generatedSchoolCode = 'TCN' + Math.floor(100000 + Math.random() * 900000);
      
      console.log('Creating school for admin:', { schoolName, schoolType, state, address, contactEmail, contactPhone, adminName, schoolCode: generatedSchoolCode });
      
      // Create school immediately
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
          school_code: generatedSchoolCode
        })
        .select()
        .single();

      if (schoolError) {
        console.error('School creation error:', schoolError);
        await supabase.auth.admin.deleteUser(userData_result.user.id); // Rollback user creation
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: `School creation failed: ${schoolError.message}` }),
        };
      }

      schoolId = school.id;
      console.log('School created successfully:', school);
    } else if (role === 'teacher') {
      // Verify school code and link to school
      const { data: school, error: schoolCodeError } = await supabase
        .from('schools')
        .select('id')
        .eq('school_code', schoolCode)
        .single();

      if (schoolCodeError || !school) {
        await supabase.auth.admin.deleteUser(userData_result.user.id);
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Invalid school code' }),
        };
      }
      schoolId = school.id;
    } else if (role === 'student') {
      // Verify class code and link to class
      const { data: classData, error: classCodeError } = await supabase
        .from('classes')
        .select('id, school_id')
        .eq('class_code', classCode)
        .single();

      if (classCodeError || !classData) {
        await supabase.auth.admin.deleteUser(userData_result.user.id);
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Invalid class code' }),
        };
      }
      schoolId = classData.school_id;
    }

    // Create profile immediately
    const profileData = {
      id: userData_result.user.id, // profiles.id references auth.users(id)
      email: email,
      full_name: fullName,
      role: role,
      school_id: schoolId,
      subjects: subjects,
      years_experience: yearsExperience,
      student_id: studentId,
      class_level: classLevel,
      parent_email: parentEmail
    };

    console.log('Creating profile with data:', profileData);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Rollback: delete user and school if created
      await supabase.auth.admin.deleteUser(userData_result.user.id);
      if (schoolId && role === 'school_admin') {
        await supabase.from('schools').delete().eq('id', schoolId);
      }
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }),
      };
    }

    console.log('Profile created successfully:', profile);

    // 3. Send confirmation email with custom redirect URL
    console.log('Sending confirmation email to:', email);
    const baseUrl = process.env.URL || 'https://tisham.netlify.app';
    const { data: emailData, error: emailError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${baseUrl}/confirm`
      }
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail here, user and data are created, just email didn't send
      console.log('Email send failed, but user and data created. User can try resending email.');
    }

    console.log('Confirmation email sent successfully:', emailData);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Registration successful! Please check your email and click the confirmation link to activate your account.',
        email: email,
        requiresConfirmation: true,
        schoolCode: generatedSchoolCode // Return school code for school admin
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

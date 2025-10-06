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

    // Create Supabase client with service role key for user creation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Supabase configuration:', {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0
    });
    
    console.log('Available environment variables:', {
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_SERVICE_ROLE_KEY: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // 1. Send OTP to email instead of creating user immediately
    console.log('Sending OTP to email:', email);
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // This will create the user if they don't exist
        data: {
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
      }
    });

    if (otpError) {
      console.error('OTP send error:', otpError);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: `Failed to send OTP: ${otpError.message}` }),
      };
    }

    console.log('OTP sent successfully:', otpData);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        message: 'OTP sent to your email. Please check your inbox and enter the code to complete registration.',
        email: email,
        requiresOTP: true
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

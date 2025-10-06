// Simple test script to check Supabase configuration
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('=== SUPABASE CONFIGURATION TEST ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Has Anon Key:', !!supabaseAnonKey);
console.log('Has Service Key:', !!supabaseServiceKey);
console.log('Anon Key Length:', supabaseAnonKey?.length || 0);
console.log('Service Key Length:', supabaseServiceKey?.length || 0);

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.log('Make sure your .env file contains:');
  console.log('VITE_SUPABASE_URL=your-url');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.log('VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-key');
  process.exit(1);
}

// Test connection with anon key
console.log('\n=== TESTING ANON KEY CONNECTION ===');
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

supabaseAnon.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.log('Anon key test (expected to fail):', error.message);
    } else {
      console.log('Anon key test result:', data);
    }
  })
  .catch(err => {
    console.log('Anon key test error (expected):', err.message);
  });

// Test connection with service key
console.log('\n=== TESTING SERVICE KEY CONNECTION ===');
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

supabaseService.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.log('Service key test error:', error.message);
    } else {
      console.log('Service key test result:', data);
    }
  })
  .catch(err => {
    console.log('Service key test error:', err.message);
  });

console.log('\n=== CONFIGURATION SUMMARY ===');
console.log('✅ All environment variables are present');
console.log('🔧 Next steps:');
console.log('1. Check Supabase dashboard for email confirmation settings');
console.log('2. Test registration with debug functions');
console.log('3. Check email delivery in Supabase logs');

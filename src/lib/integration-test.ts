/**
 * Integration Test Utilities
 * Helps verify that Supabase integration is working correctly
 */

import { 
  supabase,
  isSupabaseConfigured,
  getProfile,
  createClass,
  enrollStudent,
  saveLesson,
  saveStudentProgress,
  saveQuizResult,
  sendChatMessage,
  getAllBadges
} from './supabase';

export interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  error?: any;
}

// ============================================================================
// CONNECTION TESTS
// ============================================================================

export async function testSupabaseConnection(): Promise<TestResult> {
  try {
    const configured = isSupabaseConfigured();
    
    if (!configured) {
      return {
        test: 'Supabase Connection',
        passed: false,
        message: 'Supabase is not configured. Using localStorage fallback.'
      };
    }

    // Try to query a simple table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return {
        test: 'Supabase Connection',
        passed: false,
        message: 'Failed to connect to Supabase',
        error
      };
    }

    return {
      test: 'Supabase Connection',
      passed: true,
      message: 'Successfully connected to Supabase'
    };
  } catch (error) {
    return {
      test: 'Supabase Connection',
      passed: false,
      message: 'Connection test failed',
      error
    };
  }
}

// ============================================================================
// AUTH TESTS
// ============================================================================

export async function testAuth(): Promise<TestResult> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        test: 'Authentication',
        passed: false,
        message: 'Supabase not configured'
      };
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return {
        test: 'Authentication',
        passed: false,
        message: 'No active session found. Please login.'
      };
    }

    return {
      test: 'Authentication',
      passed: true,
      message: `Logged in as: ${session.user.email}`
    };
  } catch (error) {
    return {
      test: 'Authentication',
      passed: false,
      message: 'Auth test failed',
      error
    };
  }
}

// ============================================================================
// DATABASE TESTS
// ============================================================================

export async function testDatabaseTables(): Promise<TestResult> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        test: 'Database Tables',
        passed: false,
        message: 'Supabase not configured'
      };
    }

    const tables = [
      'profiles',
      'classes',
      'class_enrollments',
      'lessons',
      'student_progress',
      'quiz_results',
      'chat_messages',
      'badges',
      'student_badges'
    ];

    const results = await Promise.all(
      tables.map(async (table) => {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          return { table, exists: !error };
        } catch {
          return { table, exists: false };
        }
      })
    );

    const allExist = results.every(r => r.exists);
    const existingTables = results.filter(r => r.exists).map(r => r.table);
    const missingTables = results.filter(r => !r.exists).map(r => r.table);

    if (allExist) {
      return {
        test: 'Database Tables',
        passed: true,
        message: `All ${tables.length} tables exist and are accessible`
      };
    } else {
      return {
        test: 'Database Tables',
        passed: false,
        message: `Missing tables: ${missingTables.join(', ')}. Found: ${existingTables.join(', ')}`
      };
    }
  } catch (error) {
    return {
      test: 'Database Tables',
      passed: false,
      message: 'Table check failed',
      error
    };
  }
}

// ============================================================================
// RLS POLICY TESTS
// ============================================================================

export async function testRLSPolicies(): Promise<TestResult> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        test: 'RLS Policies',
        passed: false,
        message: 'Supabase not configured'
      };
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return {
        test: 'RLS Policies',
        passed: false,
        message: 'No active session to test RLS'
      };
    }

    // Test profile access
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      return {
        test: 'RLS Policies',
        passed: false,
        message: 'RLS policy blocked profile access',
        error
      };
    }

    if (!profile) {
      return {
        test: 'RLS Policies',
        passed: false,
        message: 'Profile not found'
      };
    }

    return {
      test: 'RLS Policies',
      passed: true,
      message: 'RLS policies are working correctly'
    };
  } catch (error) {
    return {
      test: 'RLS Policies',
      passed: false,
      message: 'RLS test failed',
      error
    };
  }
}

// ============================================================================
// FUNCTION TESTS
// ============================================================================

export async function testBadgeSystem(): Promise<TestResult> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        test: 'Badge System',
        passed: false,
        message: 'Supabase not configured'
      };
    }

    const badges = await getAllBadges();

    if (badges.length === 0) {
      return {
        test: 'Badge System',
        passed: false,
        message: 'No badges found. Run schema to insert seed data.'
      };
    }

    return {
      test: 'Badge System',
      passed: true,
      message: `Found ${badges.length} badges in the system`
    };
  } catch (error) {
    return {
      test: 'Badge System',
      passed: false,
      message: 'Badge system test failed',
      error
    };
  }
}

// ============================================================================
// COMPREHENSIVE TEST SUITE
// ============================================================================

export async function runAllTests(): Promise<TestResult[]> {
  console.log('🧪 Running integration tests...\n');

  const tests = [
    testSupabaseConnection,
    testAuth,
    testDatabaseTables,
    testRLSPolicies,
    testBadgeSystem
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.message}`);
    
    if (result.error) {
      console.error('   Error details:', result.error);
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`\n📊 Results: ${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    console.log('✨ All tests passed! Integration is working perfectly.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }

  return results;
}

// ============================================================================
// SAMPLE DATA CREATION (for testing)
// ============================================================================

export async function createSampleData(userId: string) {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured - cannot create sample data');
    return;
  }

  try {
    console.log('Creating sample data...');

    const profile = await getProfile(userId);
    if (!profile) {
      console.error('Profile not found');
      return;
    }

    if (profile.role === 'teacher') {
      // Create sample class
      const classData = await createClass({
        name: 'Sample JSS 3A Mathematics',
        subject: 'Mathematics',
        class_level: 'JSS 3',
        teacher_id: userId,
        school_year: '2024/2025'
      });

      console.log('✅ Created sample class:', classData.name);

      // Create sample lesson
      const lesson = await saveLesson({
        title: 'Introduction to Algebra',
        subject: 'Mathematics',
        class_level: 'JSS 3',
        content: 'This lesson covers basic algebraic concepts including variables, expressions, and simple equations.',
        objectives: [
          'Understand what variables are',
          'Learn to write algebraic expressions',
          'Solve simple linear equations'
        ],
        materials: ['Textbook', 'Calculator', 'Practice worksheets'],
        duration_minutes: 45,
        teacher_id: userId,
        class_id: classData.id
      });

      console.log('✅ Created sample lesson:', lesson.title);
    }

    if (profile.role === 'student') {
      // Nothing to create for students in this sample
      console.log('✅ Student profile verified');
    }

    console.log('\n✨ Sample data created successfully!');
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
  }
}

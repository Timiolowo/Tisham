/**
 * Supabase Client Configuration
 * Aligned with updated schema.sql structure
 */

import { createClient } from '@supabase/supabase-js';
import { isAPIAccessAllowed } from '../config/auth';

// Get Supabase credentials from environment variables
// SECURITY: Port-based isolation using proven approach
const getSupabaseConfig = () => {
  // SECURITY: Check API access permissions using proven approach
  if (typeof window !== 'undefined' && !isAPIAccessAllowed()) {
    return {
      url: '',
      anonKey: '',
      serviceKey: ''
    };
  }
  
  // Try runtime environment first (production)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return {
      url: (window as any).__ENV__.VITE_SUPABASE_URL || '',
      anonKey: (window as any).__ENV__.VITE_SUPABASE_ANON_KEY || '',
      serviceKey: (window as any).__ENV__.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
    };
  }
  
  // Development fallback - use import.meta.env only on full-stack port
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV && isAPIAccessAllowed()) {
    return {
      url: (import.meta.env as any).VITE_SUPABASE_URL || '',
      anonKey: (import.meta.env as any).VITE_SUPABASE_ANON_KEY || '',
      serviceKey: (import.meta.env as any).VITE_SUPABASE_SERVICE_ROLE_KEY || ''
    };
  }
  
  // Default: return empty values to prevent access
  return {
    url: '',
    anonKey: '',
    serviceKey: ''
  };
};

const supabaseConfig = getSupabaseConfig();
const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;
const supabaseServiceKey = supabaseConfig.serviceKey;

// SECURITY: Only create Supabase clients if we have valid credentials
// This prevents the "supabaseUrl is required" error on blocked ports
let supabase: any = null;
let supabaseAdmin: any = null;

if (supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
  // Create Supabase client for regular operations (with RLS)
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Create Supabase client for admin operations (bypasses RLS)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  // Create mock clients for blocked ports to prevent errors
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Authentication blocked on this port' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Authentication blocked on this port' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Database access blocked on this port' } }) }) }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Database access blocked on this port' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Database access blocked on this port' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Database access blocked on this port' } })
    })
  };
  
  supabaseAdmin = {
    auth: {
      admin: {
        createUser: () => Promise.resolve({ data: null, error: { message: 'Admin operations blocked on this port' } }),
        updateUserById: () => Promise.resolve({ data: null, error: { message: 'Admin operations blocked on this port' } })
      }
    }
  };
}

export { supabase, supabaseAdmin };

/**
 * Check if Supabase is configured
 * SECURITY: Strict validation to prevent authentication bypass
 */
export function isSupabaseConfigured(): boolean {
  // SECURITY: Check if we're on an allowed port first
  if (typeof window !== 'undefined' && !isAPIAccessAllowed()) {
    return false;
  }
  
  // Must have all required credentials
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return false;
  }
  
  // Must not contain placeholder values
  if (supabaseUrl.includes('placeholder') || 
      supabaseAnonKey.includes('placeholder') || 
      supabaseServiceKey.includes('placeholder')) {
    return false;
  }
  
  // Must be valid Supabase URLs and keys
  if (!supabaseUrl.startsWith('https://') || 
      !supabaseUrl.includes('.supabase.co') ||
      supabaseAnonKey.length < 20 ||
      supabaseServiceKey.length < 20) {
    return false;
  }
  
  return true;
}

// ============================================================================
// TYPE DEFINITIONS (aligned with schema)
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'school_admin' | 'teacher' | 'student';
  school_id?: string;
  teacher_id?: string;
  student_id?: string;
  avatar_url?: string;
  
  // Student fields
  class_level?: string;
  total_xp?: number;
  streak_days?: number;
  badges_earned?: number;
  class_rank?: number;
  parent_email?: string;
  
  // Teacher fields
  subjects?: string[];
  classes_taught?: string[];
  years_experience?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  class_level: string;
  teacher_id: string;
  school_id: string;
  class_code: string;
  school_year: string;
  max_students: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  content: string;
  objectives?: string[];
  materials?: string[];
  duration_minutes?: number;
  teacher_id: string;
  class_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  xp_earned?: number;
  time_spent_minutes?: number;
  started_at?: string;
  completed_at?: string;
}

export interface QuizResult {
  id: string;
  student_id: string;
  lesson_id: string;
  quiz_type: 'mini' | 'final';
  score: number;
  total_questions: number;
  xp_earned: number;
  completed_at: string;
}

export interface ChatMessage {
  id: string;
  class_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'teacher' | 'student';
  message: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  rarity: 'bronze' | 'silver' | 'gold';
  requirement_type: string;
  requirement_value: number;
  created_at?: string;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
}

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ============================================================================
// PROFILE FUNCTIONS
// ============================================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

export async function updateXP(studentId: string, xpToAdd: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp')
    .eq('id', studentId)
    .single();

  const currentXP = profile?.total_xp || 0;
  const newXP = currentXP + xpToAdd;

  const { data, error } = await supabase
    .from('profiles')
    .update({ total_xp: newXP })
    .eq('id', studentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating XP:', error);
    throw error;
  }

  return newXP;
}

// ============================================================================
// CLASS FUNCTIONS
// ============================================================================

// Generate a unique class code
function generateClassCode(): string {
  const prefix = 'CLS';
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  return `${prefix}${randomNum}`;
}

export async function createClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at' | 'class_code'>) {
  // Generate a unique class code
  const classCode = generateClassCode();
  
  const fullClassData = {
    ...classData,
    class_code: classCode,
    is_active: true
  };

  const { data, error } = await supabase
    .from('classes')
    .insert([fullClassData])
    .select()
    .single();

  if (error) {
    console.error('Error creating class:', error);
    throw error;
  }

  return data;
}

export async function getTeacherClasses(teacherId: string): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
  }

  return data || [];
}

export async function getClassById(classId: string): Promise<Class | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (error) {
    console.error('Error fetching class:', error);
    return null;
  }

  return data;
}

// ============================================================================
// CLASS ENROLLMENT FUNCTIONS
// ============================================================================

export async function enrollStudent(classId: string, studentId: string) {
  const { data, error } = await supabase
    .from('class_enrollments')
    .insert([{ class_id: classId, student_id: studentId }])
    .select()
    .single();

  if (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }

  return data;
}

export async function getClassStudents(classId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      profiles!class_enrollments_student_id_fkey (*)
    `)
    .eq('class_id', classId);

  if (error) {
    console.error('Error fetching class students:', error);
    return [];
  }

  return data?.map(enrollment => (enrollment as any).profiles) || [];
}

export async function getStudentClasses(studentId: string): Promise<Class[]> {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes!class_enrollments_class_id_fkey (*)
    `)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching student classes:', error);
    return [];
  }

  return data?.map(enrollment => (enrollment as any).classes) || [];
}

// ============================================================================
// LESSON FUNCTIONS
// ============================================================================

export async function saveLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('lessons')
    .insert([lesson])
    .select()
    .single();

  if (error) {
    console.error('Error saving lesson:', error);
    throw error;
  }

  return data;
}

export async function updateLesson(lessonId: string, updates: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }

  return data;
}

export async function getLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data || [];
}

export async function getLessonsByClass(classId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data || [];
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}

// ============================================================================
// STUDENT PROGRESS FUNCTIONS
// ============================================================================

export async function saveStudentProgress(progress: Omit<StudentProgress, 'id'>) {
  const { data, error } = await supabase
    .from('student_progress')
    .upsert([progress], { onConflict: 'student_id,lesson_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving progress:', error);
    throw error;
  }

  return data;
}

export async function getStudentProgress(studentId: string, lessonId?: string): Promise<StudentProgress[]> {
  let query = supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', studentId);

  if (lessonId) {
    query = query.eq('lesson_id', lessonId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// QUIZ RESULT FUNCTIONS
// ============================================================================

export async function saveQuizResult(result: Omit<QuizResult, 'id'>) {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert([result])
    .select()
    .single();

  if (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }

  return data;
}

export async function getQuizResults(studentId: string, lessonId?: string): Promise<QuizResult[]> {
  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false });

  if (lessonId) {
    query = query.eq('lesson_id', lessonId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching quiz results:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// CHAT FUNCTIONS
// ============================================================================

export async function sendChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([message])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
}

export async function getChatMessages(classId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export function subscribeToChat(classId: string, callback: (message: ChatMessage) => void) {
  return supabase
    .channel(`chat:${classId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `class_id=eq.${classId}`
      },
      (payload) => {
        callback(payload.new as ChatMessage);
      }
    )
    .subscribe();
}

// ============================================================================
// BADGE FUNCTIONS
// ============================================================================

export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('requirement_value', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

export async function getStudentBadges(studentId: string): Promise<StudentBadge[]> {
  const { data, error } = await supabase
    .from('student_badges')
    .select(`
      *,
      badges (*)
    `)
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching student badges:', error);
    return [];
  }

  return data || [];
}

export async function awardBadge(studentId: string, badgeId: string) {
  const { data, error } = await supabase
    .from('student_badges')
    .insert([{ student_id: studentId, badge_id: badgeId }])
    .select()
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }

  // Update badge count
  const { data: profile } = await supabase
    .from('profiles')
    .select('badges_earned')
    .eq('id', studentId)
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({ badges_earned: (profile.badges_earned || 0) + 1 })
      .eq('id', studentId);
  }

  return data;
}

// ============================================================================
// LEADERBOARD FUNCTIONS
// ============================================================================

export async function getClassLeaderboard(classId: string) {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      profiles!class_enrollments_student_id_fkey (
        id,
        full_name,
        total_xp,
        streak_days,
        badges_earned
      )
    `)
    .eq('class_id', classId);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  const students = data?.map((enrollment: any) => enrollment.profiles) || [];
  
  // Sort by XP
  return students
    .sort((a: any, b: any) => (b.total_xp || 0) - (a.total_xp || 0))
    .map((student: any, index: number) => ({
      rank: index + 1,
      name: student.full_name,
      xp: student.total_xp || 0,
      avatar: '🎯',
      isCurrentUser: false
    }));
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

export async function getClassPerformance(classId: string) {
  const { data, error } = await supabase
    .from('class_performance')
    .select('*')
    .eq('class_id', classId)
    .single();

  if (error) {
    console.error('Error fetching class performance:', error);
    return null;
  }

  return data;
}

export async function getStudentPerformance(studentId: string) {
  const { data, error } = await supabase
    .from('student_performance')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (error) {
    console.error('Error fetching student performance:', error);
    return null;
  }

  return data;
}

// ============================================================================
// CURRICULUM FUNCTIONS
// ============================================================================

export interface Curriculum {
  id: string;
  class: string;
  subject: string;
  topics: string[];
  sub_topics: any;
  created_at: string;
  updated_at: string;
}

// Helper function to map user-selected class to curriculum class
export const getCurriculumClass = (selectedClass: string): string => {
  if (selectedClass.startsWith('JSS')) {
    return 'JSS 1-3';
  } else if (selectedClass.startsWith('SS')) {
    return 'SS 1-3';
  }
  return selectedClass;
};

export async function getAllCurriculum(): Promise<Curriculum[]> {
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    throw new Error('Authentication required to access curriculum data');
  }
  
  
  const { data, error } = await supabase
    .from('curriculum')
    .select('*')
    .order('class', { ascending: true });

  if (error) {
    console.error('Error fetching curriculum:', error);
    return [];
  }

  return data || [];
}

export async function getSubjectsByClass(classLevel: string): Promise<string[]> {
  const curriculumClass = getCurriculumClass(classLevel);
  
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    throw new Error('Authentication required to access curriculum data');
  }
  
  const { data, error } = await supabase
    .from('curriculum')
    .select('subject')
    .eq('class', curriculumClass);

  if (error) {
    console.error('Error fetching subjects for class:', error);
    return [];
  }


  // Extract unique subjects
  const subjects = [...new Set(data?.map(item => item.subject) || [])];
  return subjects;
}

export async function getTopicsBySubject(classLevel: string, subject: string): Promise<string[]> {
  const curriculumClass = getCurriculumClass(classLevel);
  
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    throw new Error('Authentication required to access curriculum data');
  }
  
  const { data, error } = await supabase
    .from('curriculum')
    .select('topics')
    .eq('class', curriculumClass)
    .eq('subject', subject)
    .single();

  if (error) {
    console.error('Error fetching topics for subject:', error);
    return [];
  }

  const topics = data?.topics || [];
  return topics;
}

// Test function to check if curriculum table exists and is accessible
export async function testCurriculumTableAccess(): Promise<{success: boolean, error?: string, data?: any}> {
  try {
    
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Supabase not properly configured - missing URL or API key' };
    }
    
    // Try a simple count query first
    const { count, error: countError } = await supabase
      .from('curriculum')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count query failed:', countError);
      return { success: false, error: `Count query failed: ${countError.message}` };
    }
    
    
    // Try to fetch one record
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Select query failed:', error);
      return { success: false, error: `Select query failed: ${error.message}` };
    }
    
    return { success: true, data: data };
    
  } catch (err) {
    console.error('Unexpected error testing table access:', err);
    return { success: false, error: `Unexpected error: ${String(err)}` };
  }
}

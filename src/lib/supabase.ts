/**
 * Supabase Client Configuration
 * Aligned with updated schema.sql structure
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = (typeof import.meta.env !== 'undefined' && import.meta.env['VITE_SUPABASE_URL']) || '';
const supabaseAnonKey = (typeof import.meta.env !== 'undefined' && import.meta.env['VITE_SUPABASE_ANON_KEY']) || '';
const supabaseServiceKey = (typeof import.meta.env !== 'undefined' && import.meta.env['VITE_SUPABASE_SERVICE_ROLE_KEY']) || '';

// Create Supabase client for regular operations (with RLS)
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || 'placeholder-key'
);

// Create Supabase client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl || '', 
  supabaseServiceKey || 'placeholder-service-key'
);

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey && !supabaseUrl.includes('placeholder'));
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

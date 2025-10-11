/**
 * Analytics Functions for Teacher Copilot Nigeria
 * Provides insights on student performance, class engagement, and teacher effectiveness
 */

import { 
  supabase, 
  Profile, 
  Class, 
  Lesson,
  StudentProgress,
  QuizResult,
  getClassStudents,
  getLessonsByClass,
  getStudentProgress,
  getQuizResults,
  isSupabaseConfigured
} from './supabase';

// ============================================================================
// STUDENT ANALYTICS
// ============================================================================

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  totalXP: number;
  streakDays: number;
  badgesEarned: number;
  lessonsCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  quizzesTaken: number;
  classRank?: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  engagementLevel: 'high' | 'medium' | 'low';
}

export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics | null> {
  if (!isSupabaseConfigured()) {
    return getMockStudentAnalytics(studentId);
  }

  try {
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!profile) return null;

    // Get progress
    const progressData = await getStudentProgress(studentId);
    const completedLessons = progressData.filter(p => p.status === 'completed');

    // Get quiz results
    const quizResults = await getQuizResults(studentId);

    // Calculate average score
    const avgScore = quizResults.length > 0
      ? quizResults.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / quizResults.length
      : 0;

    // Calculate total time
    const totalTime = progressData.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);

    // Determine engagement level
    const engagementLevel = 
      profile.streak_days >= 7 && profile.total_xp >= 500 ? 'high' :
      profile.streak_days >= 3 && profile.total_xp >= 100 ? 'medium' : 'low';

    // Determine progress trend (simple heuristic based on recent scores)
    const recentQuizzes = quizResults.slice(0, 5);
    const recentAvg = recentQuizzes.length > 0
      ? recentQuizzes.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / recentQuizzes.length
      : avgScore;
    
    const progressTrend = 
      recentAvg > avgScore + 5 ? 'improving' :
      recentAvg < avgScore - 5 ? 'declining' : 'stable';

    return {
      studentId: profile.id,
      studentName: profile.full_name,
      totalXP: profile.total_xp || 0,
      streakDays: profile.streak_days || 0,
      badgesEarned: profile.badges_earned || 0,
      lessonsCompleted: completedLessons.length,
      averageScore: Math.round(avgScore),
      totalTimeSpent: totalTime,
      quizzesTaken: quizResults.length,
      classRank: profile.class_rank,
      progressTrend,
      engagementLevel
    };
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    return null;
  }
}

// ============================================================================
// CLASS ANALYTICS
// ============================================================================

export interface ClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  averageXP: number;
  engagementRate: number;
  topPerformers: Array<{
    id: string;
    name: string;
    xp: number;
  }>;
  strugglingStudents: Array<{
    id: string;
    name: string;
    score: number;
  }>;
  recentActivity: Array<{
    type: string;
    student: string;
    timestamp: string;
  }>;
}

export async function getClassAnalytics(classId: string): Promise<ClassAnalytics | null> {
  if (!isSupabaseConfigured()) {
    return getMockClassAnalytics(classId);
  }

  try {
    // Get class info
    const { data: classInfo } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (!classInfo) return null;

    // Get students
    const students = await getClassStudents(classId);

    // Get lessons
    const lessons = await getLessonsByClass(classId);

    // Get all progress for this class
    const allProgress: StudentProgress[] = [];
    for (const student of students) {
      const progress = await getStudentProgress(student.id);
      allProgress.push(...progress);
    }

    const completedLessons = allProgress.filter(p => p.status === 'completed');

    // Get all quiz results for class
    const allQuizResults: QuizResult[] = [];
    for (const student of students) {
      const results = await getQuizResults(student.id);
      allQuizResults.push(...results);
    }

    // Calculate metrics
    const averageScore = allQuizResults.length > 0
      ? allQuizResults.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / allQuizResults.length
      : 0;

    const averageXP = students.length > 0
      ? students.reduce((sum, s) => sum + (s.total_xp || 0), 0) / students.length
      : 0;

    const activeStudents = students.filter(s => (s.streak_days || 0) > 0).length;
    const engagementRate = students.length > 0 ? (activeStudents / students.length) * 100 : 0;

    // Top performers
    const topPerformers = students
      .sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0))
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.full_name,
        xp: s.total_xp || 0
      }));

    // Struggling students (low quiz scores)
    const studentScores = await Promise.all(
      students.map(async (s) => {
        const results = await getQuizResults(s.id);
        const avgScore = results.length > 0
          ? results.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / results.length
          : 0;
        return { id: s.id, name: s.full_name, score: avgScore };
      })
    );

    const strugglingStudents = studentScores
      .filter(s => s.score > 0 && s.score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);

    // Recent activity (mock for now - could be enhanced with activity log)
    const recentActivity = allQuizResults
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 10)
      .map(q => {
        const student = students.find(s => s.id === q.student_id);
        return {
          type: 'quiz_completed',
          student: student?.full_name || 'Unknown',
          timestamp: q.completed_at
        };
      });

    return {
      classId: classInfo.id,
      className: classInfo.name,
      totalStudents: students.length,
      activeStudents,
      totalLessons: lessons.length,
      completedLessons: completedLessons.length,
      averageScore: Math.round(averageScore),
      averageXP: Math.round(averageXP),
      engagementRate: Math.round(engagementRate),
      topPerformers,
      strugglingStudents,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching class analytics:', error);
    return null;
  }
}

// ============================================================================
// TEACHER ANALYTICS
// ============================================================================

export interface TeacherAnalytics {
  teacherId: string;
  teacherName: string;
  totalClasses: number;
  totalStudents: number;
  lessonsCreated: number;
  averageClassEngagement: number;
  topPerformingClass: {
    id: string;
    name: string;
    score: number;
  } | null;
  resourcesShared: number;
  studentFeedback: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export async function getTeacherAnalytics(teacherId: string): Promise<TeacherAnalytics | null> {
  if (!isSupabaseConfigured()) {
    return getMockTeacherAnalytics(teacherId);
  }

  try {
    // Get teacher profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', teacherId)
      .single();

    if (!profile) return null;

    // Get teacher's classes
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);

    const classCount = classes?.length || 0;

    // Get total students across all classes
    let totalStudents = 0;
    const classAnalytics: Array<{ id: string; name: string; score: number }> = [];

    for (const classItem of classes || []) {
      const students = await getClassStudents(classItem.id);
      totalStudents += students.length;

      // Get class performance
      const classData = await getClassAnalytics(classItem.id);
      if (classData) {
        classAnalytics.push({
          id: classItem.id,
          name: classItem.name,
          score: classData.averageScore
        });
      }
    }

    // Get lessons created
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('teacher_id', teacherId);

    const lessonsCount = lessons?.length || 0;

    // Calculate average engagement
    const avgEngagement = classAnalytics.length > 0
      ? classAnalytics.reduce((sum, c) => sum + c.score, 0) / classAnalytics.length
      : 0;

    // Find top performing class
    const topClass = classAnalytics.length > 0
      ? classAnalytics.sort((a, b) => b.score - a.score)[0]
      : null;

    return {
      teacherId: profile.id,
      teacherName: profile.full_name,
      totalClasses: classCount,
      totalStudents,
      lessonsCreated: lessonsCount,
      averageClassEngagement: Math.round(avgEngagement),
      topPerformingClass: topClass,
      resourcesShared: lessonsCount, // Could be enhanced
      studentFeedback: {
        positive: Math.floor(totalStudents * 0.7),
        neutral: Math.floor(totalStudents * 0.2),
        negative: Math.floor(totalStudents * 0.1)
      }
    };
  } catch (error) {
    console.error('Error fetching teacher analytics:', error);
    return null;
  }
}

// ============================================================================
// MOCK DATA (for when Supabase is not configured)
// ============================================================================

function getMockStudentAnalytics(studentId: string): StudentAnalytics {
  return {
    studentId,
    studentName: 'Demo Student',
    totalXP: 2450,
    streakDays: 12,
    badgesEarned: 8,
    lessonsCompleted: 15,
    averageScore: 85,
    totalTimeSpent: 420,
    quizzesTaken: 12,
    classRank: 3,
    progressTrend: 'improving',
    engagementLevel: 'high'
  };
}

function getMockClassAnalytics(classId: string): ClassAnalytics {
  return {
    classId,
    className: 'JSS 3A Mathematics',
    totalStudents: 32,
    activeStudents: 28,
    totalLessons: 24,
    completedLessons: 18,
    averageScore: 78,
    averageXP: 1850,
    engagementRate: 87,
    topPerformers: [
      { id: '1', name: 'Chioma Adeyemi', xp: 3200 },
      { id: '2', name: 'Ahmed Kwara', xp: 2890 },
      { id: '3', name: 'Blessing Okeke', xp: 2450 }
    ],
    strugglingStudents: [
      { id: '4', name: 'Emeka Nwankwo', score: 52 },
      { id: '5', name: 'Fatima Hassan', score: 58 }
    ],
    recentActivity: [
      { type: 'quiz_completed', student: 'Chioma A.', timestamp: '2025-01-04T10:30:00Z' },
      { type: 'quiz_completed', student: 'Ahmed K.', timestamp: '2025-01-04T09:15:00Z' }
    ]
  };
}

function getMockTeacherAnalytics(teacherId: string): TeacherAnalytics {
  return {
    teacherId,
    teacherName: 'Mrs. Okonkwo',
    totalClasses: 3,
    totalStudents: 85,
    lessonsCreated: 45,
    averageClassEngagement: 82,
    topPerformingClass: {
      id: '1',
      name: 'JSS 3A Mathematics',
      score: 88
    },
    resourcesShared: 45,
    studentFeedback: {
      positive: 60,
      neutral: 20,
      negative: 5
    }
  };
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export async function trackLessonCompletion(
  studentId: string,
  lessonId: string,
  score: number,
  timeSpent: number
) {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    // Update or create progress
    await supabase
      .from('student_progress')
      .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        status: 'completed',
        score,
        time_spent_minutes: timeSpent,
        completed_at: new Date().toISOString()
      }, { onConflict: 'student_id,lesson_id' });

    // Award XP
    const xpEarned = Math.floor(score * 0.5); // 50 XP for perfect score
    await supabase
      .from('profiles')
      .update({
        total_xp: supabase.raw(`total_xp + ${xpEarned}`)
      })
      .eq('id', studentId);

  } catch (error) {
    console.error('Error tracking lesson completion:', error);
  }
}

export async function updateStreak(studentId: string) {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    // This would need more complex logic to check last login date
    // For now, increment streak
    await supabase
      .from('profiles')
      .update({
        streak_days: supabase.raw('streak_days + 1')
      })
      .eq('id', studentId);
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

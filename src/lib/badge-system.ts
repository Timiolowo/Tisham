/**
 * Badge System for Teacher Copilot Nigeria
 * Automatically awards badges based on student achievements
 */

import { 
  supabase, 
  getAllBadges,
  getStudentBadges,
  awardBadge,
  getProfile,
  isSupabaseConfigured,
  Badge
} from './supabase';

// ============================================================================
// BADGE CHECKING AND AWARDING
// ============================================================================

export async function checkAndAwardBadges(studentId: string) {
  if (!isSupabaseConfigured()) {
    console.log('Mock: Checking badges for student', studentId);
    return [];
  }

  try {
    // Get student profile
    const profile = await getProfile(studentId);
    if (!profile || profile.role !== 'student') {
      return [];
    }

    // Get all available badges
    const allBadges = await getAllBadges();
    
    // Get already earned badges
    const earnedBadges = await getStudentBadges(studentId);
    const earnedBadgeIds = earnedBadges.map(eb => (eb as any).badge_id || eb.badge_id);

    // Get student stats
    const { data: progressData } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    const lessonsCompleted = progressData?.length || 0;

    const newlyAwardedBadges: Badge[] = [];

    // Check each badge requirement
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) {
        continue;
      }

      let shouldAward = false;

      switch (badge.requirement_type) {
        case 'lessons_completed':
          shouldAward = lessonsCompleted >= badge.requirement_value;
          break;
        
        case 'total_xp':
          shouldAward = (profile.total_xp || 0) >= badge.requirement_value;
          break;
        
        case 'streak_days':
          shouldAward = (profile.streak_days || 0) >= badge.requirement_value;
          break;
        
        default:
          break;
      }

      if (shouldAward) {
        try {
          await awardBadge(studentId, badge.id);
          newlyAwardedBadges.push(badge);
          console.log(`Awarded badge "${badge.name}" to student ${studentId}`);
        } catch (error) {
          console.error(`Failed to award badge ${badge.name}:`, error);
        }
      }
    }

    return newlyAwardedBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

// ============================================================================
// BADGE NOTIFICATIONS
// ============================================================================

export interface BadgeNotification {
  badge: Badge;
  message: string;
}

export function createBadgeNotification(badge: Badge): BadgeNotification {
  const rarityMessages = {
    bronze: '🥉 You earned a Bronze badge!',
    silver: '🥈 Amazing! You earned a Silver badge!',
    gold: '🥇 Incredible! You earned a Gold badge!'
  };

  return {
    badge,
    message: rarityMessages[badge.rarity] || 'You earned a new badge!'
  };
}

// ============================================================================
// BADGE PROGRESS TRACKING
// ============================================================================

export interface BadgeProgress {
  badge: Badge;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isEarned: boolean;
}

export async function getBadgeProgress(studentId: string): Promise<BadgeProgress[]> {
  if (!isSupabaseConfigured()) {
    return getMockBadgeProgress();
  }

  try {
    // Get student profile
    const profile = await getProfile(studentId);
    if (!profile || profile.role !== 'student') {
      return [];
    }

    // Get all badges
    const allBadges = await getAllBadges();
    
    // Get earned badges
    const earnedBadges = await getStudentBadges(studentId);
    const earnedBadgeIds = earnedBadges.map(eb => (eb as any).badge_id || eb.badge_id);

    // Get student stats
    const { data: progressData } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    const lessonsCompleted = progressData?.length || 0;

    const badgeProgress: BadgeProgress[] = allBadges.map(badge => {
      let currentValue = 0;

      switch (badge.requirement_type) {
        case 'lessons_completed':
          currentValue = lessonsCompleted;
          break;
        case 'total_xp':
          currentValue = profile.total_xp || 0;
          break;
        case 'streak_days':
          currentValue = profile.streak_days || 0;
          break;
      }

      const percentage = Math.min(100, Math.floor((currentValue / badge.requirement_value) * 100));
      const isEarned = earnedBadgeIds.includes(badge.id);

      return {
        badge,
        currentValue,
        targetValue: badge.requirement_value,
        percentage,
        isEarned
      };
    });

    return badgeProgress;
  } catch (error) {
    console.error('Error getting badge progress:', error);
    return [];
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

function getMockBadgeProgress(): BadgeProgress[] {
  return [
    {
      badge: {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        rarity: 'bronze',
        requirement_type: 'lessons_completed',
        requirement_value: 1
      },
      currentValue: 15,
      targetValue: 1,
      percentage: 100,
      isEarned: true
    },
    {
      badge: {
        id: '2',
        name: 'Quick Learner',
        description: 'Complete 5 lessons',
        icon: '⚡',
        rarity: 'bronze',
        requirement_type: 'lessons_completed',
        requirement_value: 5
      },
      currentValue: 15,
      targetValue: 5,
      percentage: 100,
      isEarned: true
    },
    {
      badge: {
        id: '3',
        name: 'Scholar',
        description: 'Complete 10 lessons',
        icon: '📚',
        rarity: 'silver',
        requirement_type: 'lessons_completed',
        requirement_value: 10
      },
      currentValue: 15,
      targetValue: 10,
      percentage: 100,
      isEarned: true
    },
    {
      badge: {
        id: '4',
        name: 'Master Student',
        description: 'Complete 25 lessons',
        icon: '🏆',
        rarity: 'gold',
        requirement_type: 'lessons_completed',
        requirement_value: 25
      },
      currentValue: 15,
      targetValue: 25,
      percentage: 60,
      isEarned: false
    }
  ];
}

// ============================================================================
// GAMIFICATION UTILITIES
// ============================================================================

export function getXPForActivity(activityType: string): number {
  const xpValues: { [key: string]: number } = {
    lesson_completed: 50,
    quiz_passed: 30,
    quiz_perfect: 100,
    daily_challenge: 20,
    streak_milestone: 50,
    help_classmate: 10,
    resource_shared: 15
  };

  return xpValues[activityType] || 10;
}

export function getLevelFromXP(xp: number): number {
  // Simple level calculation: Level = sqrt(XP / 100)
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevel = currentLevel + 1;
  return (nextLevel - 1) * (nextLevel - 1) * 100;
}

export function getProgressToNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);
  const xpForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * currentLevel * 100;
  const progressXP = currentXP - xpForCurrentLevel;
  const requiredXP = xpForNextLevel - xpForCurrentLevel;
  
  return Math.floor((progressXP / requiredXP) * 100);
}

// ============================================================================
// LEADERBOARD UTILITIES
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  xp: number;
  level: number;
  avatar: string;
  isCurrentUser: boolean;
}

export async function getGlobalLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return getMockLeaderboard();
  }

  try {
    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name, total_xp, avatar_url')
      .eq('role', 'student')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (!students) return [];

    return students.map((student, index) => ({
      rank: index + 1,
      studentId: student.id,
      name: student.full_name,
      xp: student.total_xp || 0,
      level: getLevelFromXP(student.total_xp || 0),
      avatar: student.avatar_url || '🎯',
      isCurrentUser: false
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, studentId: '1', name: 'Chioma Adeyemi', xp: 3200, level: 6, avatar: '👧', isCurrentUser: false },
    { rank: 2, studentId: '2', name: 'Ahmed Kwara', xp: 2890, level: 5, avatar: '👦', isCurrentUser: false },
    { rank: 3, studentId: '3', name: 'Blessing Okeke', xp: 2450, level: 5, avatar: '👧', isCurrentUser: true },
    { rank: 4, studentId: '4', name: 'Chidi Okafor', xp: 2340, level: 5, avatar: '👦', isCurrentUser: false },
    { rank: 5, studentId: '5', name: 'Fatima Hassan', xp: 2100, level: 5, avatar: '👧', isCurrentUser: false }
  ];
}

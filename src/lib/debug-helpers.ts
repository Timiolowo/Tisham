/**
 * Debug Helpers for Browser Console
 * Use these in the browser console to test and debug
 * 
 * Usage: 
 * In browser console: window.teacherCopilot.testConnection()
 */

import { runAllTests, createSampleData } from './integration-test';
import { 
  getProfile,
  getTeacherClasses,
  getStudentClasses,
  getAllBadges,
  getClassLeaderboard,
  isSupabaseConfigured
} from './supabase';
import { 
  getStudentAnalytics,
  getClassAnalytics,
  getTeacherAnalytics
} from './analytics';
import {
  checkAndAwardBadges,
  getBadgeProgress,
  getGlobalLeaderboard
} from './badge-system';

// ============================================================================
// BROWSER CONSOLE HELPERS
// ============================================================================

export const debugHelpers = {
  // Connection & Setup
  testConnection: async () => {
    console.log('🔌 Testing Supabase connection...\n');
    const results = await runAllTests();
    return results;
  },

  checkConfig: () => {
    const configured = isSupabaseConfigured();
    console.log(`📋 Supabase configured: ${configured ? '✅ YES' : '❌ NO'}`);
    
    if (!configured) {
      console.log('\n⚠️ To configure Supabase:');
      console.log('1. Create a .env file in your project root');
      console.log('2. Add these variables:');
      console.log('   VITE_SUPABASE_URL=your-project-url');
      console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key');
      console.log('3. Restart the dev server');
    }
    
    return configured;
  },

  createSamples: async (userId: string) => {
    console.log('🎨 Creating sample data...');
    await createSampleData(userId);
  },

  // User & Profile
  getMyProfile: async () => {
    console.log('👤 Fetching your profile...\n');
    const user = await getCurrentUserProfile();
    console.table(user);
    return user;
  },

  // Classes
  getMyClasses: async () => {
    console.log('📚 Fetching your classes...\n');
    const user = await getCurrentUserProfile();
    
    if (!user) {
      console.error('❌ Not logged in');
      return [];
    }

    let classes = [];
    if (user.role === 'teacher') {
      classes = await getTeacherClasses(user.id);
    } else if (user.role === 'student') {
      classes = await getStudentClasses(user.id);
    }

    console.log(`Found ${classes.length} classes:`);
    console.table(classes);
    return classes;
  },

  // Analytics
  getMyAnalytics: async () => {
    console.log('📊 Fetching analytics...\n');
    const user = await getCurrentUserProfile();
    
    if (!user) {
      console.error('❌ Not logged in');
      return null;
    }

    let analytics = null;
    
    if (user.role === 'student') {
      analytics = await getStudentAnalytics(user.id);
      console.log('📈 Student Analytics:');
    } else if (user.role === 'teacher') {
      analytics = await getTeacherAnalytics(user.id);
      console.log('👨‍🏫 Teacher Analytics:');
    }

    console.table(analytics);
    return analytics;
  },

  getClassStats: async (classId: string) => {
    console.log(`📊 Fetching analytics for class ${classId}...\n`);
    const analytics = await getClassAnalytics(classId);
    console.table(analytics);
    return analytics;
  },

  // Badges & Gamification
  getMyBadges: async () => {
    console.log('🏆 Fetching your badges...\n');
    const user = await getCurrentUserProfile();
    
    if (!user || user.role !== 'student') {
      console.error('❌ Badge progress only available for students');
      return [];
    }

    const progress = await getBadgeProgress(user.id);
    
    const earned = progress.filter(p => p.isEarned);
    const available = progress.filter(p => !p.isEarned);

    console.log(`🎯 Earned: ${earned.length} badges`);
    console.log(`🎁 Available: ${available.length} badges\n`);
    
    console.log('✅ EARNED BADGES:');
    console.table(earned.map(p => ({
      name: p.badge.name,
      icon: p.badge.icon,
      rarity: p.badge.rarity,
      description: p.badge.description
    })));

    console.log('\n📋 NEXT BADGES:');
    console.table(available.slice(0, 5).map(p => ({
      name: p.badge.name,
      icon: p.badge.icon,
      progress: `${p.currentValue}/${p.targetValue}`,
      percentage: `${p.percentage}%`
    })));

    return progress;
  },

  checkBadges: async () => {
    console.log('🔍 Checking for new badges...\n');
    const user = await getCurrentUserProfile();
    
    if (!user || user.role !== 'student') {
      console.error('❌ Badge checking only available for students');
      return [];
    }

    const newBadges = await checkAndAwardBadges(user.id);
    
    if (newBadges.length > 0) {
      console.log(`🎉 Awarded ${newBadges.length} new badges!`);
      console.table(newBadges);
    } else {
      console.log('✅ No new badges to award');
    }

    return newBadges;
  },

  // Leaderboards
  getLeaderboard: async (classId?: string) => {
    console.log('🏅 Fetching leaderboard...\n');
    
    let leaderboard = [];
    
    if (classId) {
      console.log(`Class Leaderboard for ${classId}:`);
      leaderboard = await getClassLeaderboard(classId);
    } else {
      console.log('Global Leaderboard:');
      leaderboard = await getGlobalLeaderboard(10);
    }

    console.table(leaderboard);
    return leaderboard;
  },

  // Quick Stats
  quickStats: async () => {
    console.log('⚡ Quick Stats\n');
    console.log('='.repeat(50));
    
    const user = await getCurrentUserProfile();
    
    if (!user) {
      console.error('❌ Not logged in');
      return;
    }

    console.log(`👤 User: ${user.full_name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Role: ${user.role.toUpperCase()}`);
    console.log('='.repeat(50));

    if (user.role === 'student') {
      console.log(`⚡ XP: ${user.total_xp || 0}`);
      console.log(`🔥 Streak: ${user.streak_days || 0} days`);
      console.log(`🏆 Badges: ${user.badges_earned || 0}`);
      console.log(`📚 Level: ${user.class_level || 'N/A'}`);
    } else if (user.role === 'teacher') {
      console.log(`📚 Subjects: ${user.subjects?.join(', ') || 'None'}`);
      console.log(`👥 Classes: ${user.classes_taught?.length || 0}`);
      console.log(`📅 Experience: ${user.years_experience || 0} years`);
    }

    console.log('='.repeat(50));
  },

  // All Badges in System
  listAllBadges: async () => {
    console.log('🏆 All Available Badges\n');
    const badges = await getAllBadges();
    console.table(badges.map(b => ({
      name: b.name,
      icon: b.icon,
      rarity: b.rarity,
      requirement: `${b.requirement_type}: ${b.requirement_value}`,
      description: b.description
    })));
    return badges;
  },

  // Help
  help: () => {
    console.log(`
🎓 Teacher Copilot Nigeria - Debug Helpers
=============================================

SETUP & TESTING:
  teacherCopilot.checkConfig()          - Check if Supabase is configured
  teacherCopilot.testConnection()       - Run all integration tests
  teacherCopilot.createSamples(userId)  - Create sample data

PROFILE & CLASSES:
  teacherCopilot.getMyProfile()         - View your profile
  teacherCopilot.getMyClasses()         - List your classes
  teacherCopilot.quickStats()           - Quick overview

ANALYTICS:
  teacherCopilot.getMyAnalytics()       - Your performance analytics
  teacherCopilot.getClassStats(classId) - Class analytics

GAMIFICATION:
  teacherCopilot.getMyBadges()          - View badge progress
  teacherCopilot.checkBadges()          - Check for new badges
  teacherCopilot.getLeaderboard()       - Global leaderboard
  teacherCopilot.getLeaderboard(classId)- Class leaderboard
  teacherCopilot.listAllBadges()        - All available badges

HELP:
  teacherCopilot.help()                 - Show this help

Examples:
  > teacherCopilot.quickStats()
  > teacherCopilot.getMyBadges()
  > teacherCopilot.testConnection()
    `);
  }
};

// Helper to get current user profile
async function getCurrentUserProfile() {
  try {
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ No user logged in');
      return null;
    }

    const profile = await getProfile(user.id);
    return profile;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// ============================================================================
// ATTACH TO WINDOW FOR BROWSER CONSOLE ACCESS
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).teacherCopilot = debugHelpers;
  console.log(`
  🎓 Teacher Copilot Debug Helpers Loaded!
  
  Type: teacherCopilot.help()
  To see all available commands.
  `);
}

export default debugHelpers;

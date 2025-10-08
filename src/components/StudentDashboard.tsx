import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  Home, BookOpen, Trophy, Flame, Star, Target, TrendingUp,
  Brain, Sparkles, Award, Zap, Crown, Clock, Users, ChevronRight,
  Play, CheckCircle, Lock, Star as StarIcon, Bookmark, Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DailyChallenges } from "./DailyChallenges";
import { useAuth } from "../contexts/AuthContext";
import { 
  getStudentProgress, 
  getLessonsByClass, 
  getClassLeaderboard,
  isSupabaseConfigured 
} from "../lib/supabase";
import { SharedLayout } from "./SharedLayout";
import { runtimeEnv } from '../lib/runtime-env';

interface StudentDashboardProps {
  onNavigate: (page: any, role?: any) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Load student data from Supabase
  useEffect(() => {
    if (isSupabaseConfigured() && user) {
      loadStudentData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadStudentData = async () => {
    if (!user) return;
    
    try {
      // Load student's lessons and progress
      const progress = await getStudentProgress(user.id);
      
      // Load leaderboard
      const leaderboard = await getClassLeaderboard('demo-class');
      setLeaderboardData(leaderboard);
      
      // Load AI recommendations
      await loadAIRecommendations();
      
      // Update stats if we have real data from Supabase
      if (user.total_xp !== undefined) {
        studentStats.xp = user.total_xp;
      }
      if (user.streak_days !== undefined) {
        studentStats.streak = user.streak_days;
      }
      
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    if (!user) return;
    
    setIsLoadingRecommendations(true);
    try {
      const env = runtimeEnv.getEnv();
      const apiKey = env.VITE_GROQ_API_KEY;
      
      if (!apiKey || apiKey === 'your-groq-api-key-here') {
        // Fallback recommendations when API key is not configured
        setAiRecommendations(getFallbackRecommendations());
        setIsLoadingRecommendations(false);
        return;
      }

      const studentProfile = {
        name: user.full_name || user.email?.split('@')[0] || 'Student',
        class: user.class_level || 'JSS 3',
        subjects: user.subjects || ['Mathematics', 'English', 'Science'],
        interests: user.interests || ['Technology', 'Science'],
        performance: studentStats,
        goals: user.goals || 'Academic Excellence'
      };

      const prompt = `Based on this student profile, recommend 6 personalized courses/lessons that would be most beneficial for their learning journey:

Student Profile:
- Name: ${studentProfile.name}
- Class: ${studentProfile.class}
- Subjects: ${studentProfile.subjects.join(', ')}
- Interests: ${studentProfile.interests.join(', ')}
- Current Performance: ${studentStats.xp} XP, ${studentStats.streak} day streak, ${studentStats.badges} badges
- Goals: ${studentProfile.goals}

Please provide 6 course recommendations in this JSON format:
[
  {
    "id": "course-1",
    "title": "Course Title",
    "description": "Brief description of what the student will learn",
    "subject": "Subject Area",
    "difficulty": "Beginner|Intermediate|Advanced",
    "duration": "X hours",
    "skills": ["skill1", "skill2", "skill3"],
    "icon": "🎯",
    "color": "gradient-primary",
    "isRecommended": true,
    "reason": "Why this course is recommended for this student"
  }
]

Make the recommendations highly personalized based on their class level, interests, and current performance. Focus on courses that will help them improve in their weak areas and build on their strengths.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an AI educational advisor that provides personalized course recommendations for Nigerian secondary school students. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI recommendations');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const recommendations = JSON.parse(content);
        setAiRecommendations(recommendations);
      } catch (parseError) {
        console.error('Error parsing AI recommendations:', parseError);
        setAiRecommendations(getFallbackRecommendations());
      }
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      setAiRecommendations(getFallbackRecommendations());
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const getFallbackRecommendations = () => [
    {
      id: 'math-algebra',
      title: 'Algebra Fundamentals',
      description: 'Master basic algebraic concepts and problem-solving techniques',
      subject: 'Mathematics',
      difficulty: 'Intermediate',
      duration: '3 hours',
      skills: ['Problem Solving', 'Algebraic Thinking', 'Logical Reasoning'],
      icon: '📐',
      color: 'gradient-primary',
      isRecommended: true,
      reason: 'Builds on your mathematical foundation'
    },
    {
      id: 'english-grammar',
      title: 'Advanced Grammar & Composition',
      description: 'Improve your English writing and communication skills',
      subject: 'English',
      difficulty: 'Intermediate',
      duration: '4 hours',
      skills: ['Writing', 'Grammar', 'Communication'],
      icon: '📝',
      color: 'gradient-secondary',
      isRecommended: true,
      reason: 'Essential for academic success'
    },
    {
      id: 'science-physics',
      title: 'Physics in Daily Life',
      description: 'Understand physics concepts through real-world applications',
      subject: 'Physics',
      difficulty: 'Beginner',
      duration: '2.5 hours',
      skills: ['Critical Thinking', 'Problem Solving', 'Scientific Method'],
      icon: '⚡',
      color: 'gradient-success',
      isRecommended: true,
      reason: 'Makes science more relatable and interesting'
    },
    {
      id: 'study-skills',
      title: 'Effective Study Techniques',
      description: 'Learn proven methods to improve your study habits and retention',
      subject: 'Study Skills',
      difficulty: 'Beginner',
      duration: '2 hours',
      skills: ['Memory Techniques', 'Time Management', 'Focus'],
      icon: '🧠',
      color: 'gradient-cool',
      isRecommended: true,
      reason: 'Will help you excel in all subjects'
    }
  ];


  const studentStats = {
    xp: 2450,
    level: 8,
    streak: 12,
    badges: 15,
    nextLevelXP: 3000,
    rank: 3,
    totalStudents: 45
  };

  const badges = [
    { id: 1, name: 'Knowledge Explorer', icon: '🔍', earned: true, rarity: 'gold' },
    { id: 2, name: 'Quiz Master', icon: '🎯', earned: true, rarity: 'silver' },
    { id: 3, name: 'AI Curious', icon: '🤖', earned: true, rarity: 'bronze' },
    { id: 4, name: 'Early Bird', icon: '🌅', earned: true, rarity: 'gold' },
    { id: 5, name: 'Perfect Score', icon: '💯', earned: false, rarity: 'gold' },
    { id: 6, name: 'Team Player', icon: '🤝', earned: false, rarity: 'silver' },
  ];

  const sharedResources = [
    // No lessons available yet
  ];

  const careerHints = [
    // No career hints available yet
  ];

  const leaderboard = [
    // No leaderboard data available yet
  ];


  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="student"
      title={`Hello ${user?.full_name || user?.email?.split('@')[0] || 'Student'}`}
      subtitle=""
      activeMenu="dashboard"
      hideHeaderIcons={true}
    >
      <div className="p-4">
        <div className="max-w-7xl mx-auto h-full space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="rounded-2xl glass-card hover-lift overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-10"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-6 h-6 text-accent" />
                  <Crown className="w-4 h-4 text-accent/50" />
                </div>
                <p className="text-lg font-bold">{studentStats.xp}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl glass-card hover-lift overflow-hidden">
              <div className="absolute inset-0 gradient-secondary opacity-10"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <Star className="w-4 h-4 text-orange-500/50" />
                </div>
                <p className="text-lg font-bold">{studentStats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl glass-card hover-lift overflow-hidden">
              <div className="absolute inset-0 gradient-success opacity-10"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-6 h-6 text-success" />
                  <Award className="w-4 h-4 text-success/50" />
                </div>
                <p className="text-lg font-bold">{studentStats.badges}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl glass-card hover-lift overflow-hidden">
              <div className="absolute inset-0 gradient-warm opacity-10"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <Target className="w-4 h-4 text-primary/50" />
                </div>
                <p className="text-lg font-bold">#{studentStats.rank}</p>
                <p className="text-xs text-muted-foreground">Class Rank</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1">
              <TabsTrigger value="lessons" className="rounded-xl">My Lessons</TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-xl">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-6 animate-fade-in">
              {/* AI-Powered Course Recommendations */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Course Recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Personalized courses based on your profile and performance
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadAIRecommendations}
                    disabled={isLoadingRecommendations}
                    className="rounded-lg text-xs"
                  >
                    {isLoadingRecommendations ? (
                      <>
                        <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>

                {isLoadingRecommendations ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="rounded-xl animate-pulse">
                        <CardContent className="p-4">
                          <div className="w-8 h-8 bg-muted rounded-lg mb-3"></div>
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded mb-3 w-3/4"></div>
                          <div className="space-y-1">
                            <div className="h-2 bg-muted rounded"></div>
                            <div className="h-2 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiRecommendations.map((course) => (
                      <Card key={course.id} className="rounded-xl hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-2xl">{course.icon}</div>
                            {course.isRecommended && (
                              <Badge variant="secondary" className="text-xs">
                                <StarIcon className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-base mb-2">
                            {course.title}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{course.subject}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{course.duration}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {course.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Personalized
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Skills:</div>
                              <div className="flex flex-wrap gap-1">
                                {course.skills.slice(0, 2).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                    {skill}
                                  </Badge>
                                ))}
                                {course.skills.length > 2 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    +{course.skills.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-2">
                                💡 {course.reason}
                              </p>
                              <Button 
                                className="w-full rounded-lg text-sm"
                                size="sm"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start Learning
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily Challenges */}
              <DailyChallenges />
            </TabsContent>

            <TabsContent value="leaderboard" className="animate-fade-in">
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle>Class Leaderboard</CardTitle>
                  <CardDescription>Top students this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.map((student) => (
                    <div
                      key={student.rank}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        student.isCurrentUser
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 text-center font-bold text-muted-foreground">
                        #{student.rank}
                      </div>
                      <div className="text-base">{student.avatar}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{student.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3 text-accent" />
                          {student.xp} XP
                        </div>
                      </div>
                      {student.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                      {student.rank === 2 && <Star className="w-5 h-5 text-gray-400" />}
                      {student.rank === 3 && <Award className="w-5 h-5 text-orange-600" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SharedLayout>
  );
}

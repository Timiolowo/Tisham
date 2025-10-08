import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  Home, BookOpen, Trophy, Flame, Star, Target, TrendingUp,
  Brain, Sparkles, Users, Menu, Bell, User, Award, Zap, Crown, Settings, MessageSquare, BookMarked, X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DailyChallenges } from "./DailyChallenges";
import { useAuth } from "../contexts/AuthContext";
import { 
  getStudentProgress, 
  getLessonsByClass, 
  getClassLeaderboard,
  isSupabaseConfigured 
} from "../lib/supabase";

interface StudentDashboardProps {
  onNavigate: (page: any, role?: any) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState('lessons');
  const [lessons, setLessons] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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

  const menuItems = [
    { id: 'lessons', label: 'My Lessons', icon: BookOpen },
    { id: 'explorer', label: 'Concept Explorer', icon: Brain, onClick: () => onNavigate('concept-explorer') },
    { id: 'curriculum', label: 'My Curriculum', icon: BookMarked, onClick: () => onNavigate('my-curriculum') },
    { id: 'class-chat', label: 'Class Chat', icon: Users, onClick: () => onNavigate('class-chat') },
    { id: 'copilot', label: 'AI Chat', icon: MessageSquare, onClick: () => onNavigate('copilot') },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: () => onNavigate('settings') },
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
    {
      id: 1,
      title: 'Introduction to Robotics',
      teacher: 'Mrs. Okonkwo',
      subject: 'Computer Science',
      type: 'Lesson',
      status: 'new',
      xp: 50
    },
    {
      id: 2,
      title: 'Algebra Basics Quiz',
      teacher: 'Mr. Adeyemi',
      subject: 'Mathematics',
      type: 'Quiz',
      status: 'completed',
      score: 85,
      xp: 40
    },
    {
      id: 3,
      title: 'Solar Energy Systems',
      teacher: 'Dr. Bello',
      subject: 'Physics',
      type: 'Lesson',
      status: 'in-progress',
      xp: 60
    }
  ];

  const careerHints = [
    {
      title: 'Mechatronics Engineer',
      description: 'Based on your interest in Robotics',
      icon: '🤖',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Data Scientist',
      description: 'You excel at Mathematics!',
      icon: '📊',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Renewable Energy Specialist',
      description: 'Your Physics skills are strong',
      icon: '⚡',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Chioma A.', xp: 3200, avatar: '👑' },
    { rank: 2, name: 'Ahmed K.', xp: 2890, avatar: '⭐' },
    { rank: 3, name: 'You', xp: 2450, avatar: '🎯', isCurrentUser: true },
    { rank: 4, name: 'Blessing O.', xp: 2340, avatar: '💫' },
    { rank: 5, name: 'Emeka N.', xp: 2100, avatar: '✨' },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'w-full' : sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r h-full flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSidebarCollapsed(false)}
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sm">TeachMate</p>
                <p className="text-xs text-muted-foreground">St. Mary's School</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6"
              onClick={() => setSidebarCollapsed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveMenu(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeMenu === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* XP Progress in Sidebar */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Level {studentStats.level}</span>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <Progress 
              value={(studentStats.xp / studentStats.nextLevelXP) * 100} 
              variant="xp" 
              showLabel 
              className="h-3 mb-3" 
            />
            <p className="text-xs text-muted-foreground">
              {studentStats.xp} / {studentStats.nextLevelXP} XP
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-full">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Navigate between different sections</SheetDescription>
                  </SheetHeader>
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl truncate">Welcome back, Chidi! 👋</h1>
                <p className="text-sm text-muted-foreground truncate">JSS 3 • Keep up the great work!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Streak Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-semibold">{studentStats.streak}</span>
              </div>

              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

         <main className="flex-1 overflow-hidden p-4">
           <div className="max-w-7xl mx-auto h-full space-y-6 overflow-y-auto">
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
                {/* Daily Challenges */}
                <DailyChallenges />

                 {/* Career Hints */}
                 <div>
                   <h3 className="text-lg font-semibold mb-4">🚀 Career Paths for You</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {careerHints.map((career, i) => (
                      <Card key={i} className="rounded-2xl glass-card hover-lift overflow-hidden group cursor-pointer">
                        <div className={`absolute inset-0 bg-gradient-to-br ${career.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                        <CardContent className="p-4 relative">
                          <div className="text-base mb-2">{career.icon}</div>
                          <h4 className="font-semibold mb-1 text-sm">{career.title}</h4>
                          <p className="text-xs text-muted-foreground">{career.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                 {/* Shared Resources */}
                 <div>
                   <h3 className="text-lg font-semibold mb-4">📚 Your Lessons & Quizzes</h3>
                  <div className="space-y-3">
                    {sharedResources.map((resource) => (
                      <Card key={resource.id} className="rounded-2xl glass-card hover-lift hover-glow group cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              resource.type === 'Quiz' ? 'gradient-secondary' : 'gradient-primary'
                            }`}>
                              {resource.type === 'Quiz' ? (
                                <Target className="w-6 h-6 text-white" />
                              ) : (
                                <BookOpen className="w-6 h-6 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold mb-1 text-sm sm:text-base truncate">{resource.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {resource.teacher} • {resource.subject}
                                  </p>
                                </div>
                                {resource.status === 'new' && (
                                  <Badge className="bg-accent text-accent-foreground text-xs">New!</Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-3 flex-wrap">
                                {resource.status === 'completed' ? (
                                  <>
                                    <div className="flex items-center gap-1 text-xs text-success">
                                      <Trophy className="w-3 h-3" />
                                      <span>Score: {resource.score}%</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-accent">
                                      <Zap className="w-3 h-3" />
                                      <span>+{resource.xp} XP earned</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" className="rounded-xl text-xs h-8">
                                      {resource.status === 'in-progress' ? 'Continue' : 'Start Learning'}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="rounded-xl text-xs h-8 group"
                                      onClick={() => onNavigate('learn-with-ai')}
                                    >
                                      <Sparkles className="w-3 h-3 mr-1 group-hover:text-primary transition-colors" />
                                      Learn with AI
                                    </Button>
                                    <span className="text-xs text-muted-foreground">+{resource.xp} XP</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
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
        </main>
      </div>
    </div>
  );
}

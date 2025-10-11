import React from "react";
import { 
  FileText, ClipboardList, Languages, MessageSquare, 
  BookOpen, BarChart3, Map, Settings,
  Sparkles, Clock, BookMarked, Award, Users
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SharedLayout } from "./SharedLayout";
import { useAuth } from "../contexts/AuthContext";

interface TeacherDashboardProps {
  onNavigate: (page: any, role?: any) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const { user } = useAuth();
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Teacher';
  const firstName = userName.split(' ')[0];

  const stats = [
    { label: 'Lessons Created', value: '0', icon: FileText, color: 'text-blue-500' },
    { label: 'Students Helped', value: '0', icon: Users, color: 'text-green-500' },
    { label: 'Resources Shared', value: '0', icon: BookOpen, color: 'text-purple-500' },
    { label: 'XP Earned', value: '0', icon: Award, color: 'text-orange-500' },
  ];

  const content = (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-medium mb-1">Welcome back, {firstName}!</h1>
            <p className="text-sm text-muted-foreground">Ready to create amazing lessons with AI? Let's get started!</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card 
            className="rounded-2xl cursor-pointer gradient-primary text-white hover-lift hover-glow group overflow-hidden"
            onClick={() => onNavigate('lesson-generator')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Lesson Generator</h3>
                  <p className="text-xs opacity-90">Create AI-powered lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="rounded-2xl cursor-pointer gradient-secondary text-white hover-lift hover-glow group overflow-hidden"
            onClick={() => onNavigate('assessment')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Assessment Generator</h3>
                  <p className="text-xs opacity-90">Create quizzes & tests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="rounded-2xl cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white hover-lift hover-glow group overflow-hidden"
            onClick={() => onNavigate('simplify')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Simplify & Translate</h3>
                  <p className="text-xs opacity-90">Make content accessible</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="rounded-2xl cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover-lift hover-glow group overflow-hidden"
            onClick={() => onNavigate('copilot')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Tishami AI</h3>
                  <p className="text-xs opacity-90">Get instant help</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Teaching Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Professional Development */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Professional Development</h2>
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Continue Learning</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('teacher-learning')}
                className="rounded-lg"
              >
                <BookMarked className="w-4 h-4 mr-1" />
                Explore
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">AI Teaching Mastery</h4>
                  <p className="text-xs text-muted-foreground">Learn to leverage AI in your teaching</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  15 min
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Award className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Digital Pedagogy</h4>
                  <p className="text-xs text-muted-foreground">Modern teaching methodologies</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  20 min
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Your Latest Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No lessons created yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start creating amazing lessons with AI to see your activity here
              </p>
              <Button 
                onClick={() => onNavigate('lesson-generator')}
                className="rounded-lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Your First Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Tisham"
      subtitle="Continue your learning journey"
      activeMenu="dashboard"
      children={content}
    />
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { 
  FileText, ClipboardList, Languages, MessageSquare, 
  BookOpen, BarChart3, Map, Settings,
  Sparkles, Clock, BookMarked, Award, Users
} from "lucide-react";
import { SharedLayout } from "./SharedLayout";
import { useAuth } from "../contexts/AuthContext";
import { ScrollReveal } from "./ScrollReveal";

interface TeacherDashboardProps {
  onNavigate: (page: any, role?: any) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const { user } = useAuth();
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Teacher';

  const stats = [
    { label: 'Lessons Created', value: '0', icon: FileText, color: 'text-primary' },
    { label: 'Assessments Generated', value: '0', icon: ClipboardList, color: 'text-secondary' },
    { label: 'Hours Saved with AI', value: '0', icon: Clock, color: 'text-accent' },
    { label: 'Subjects Covered', value: '0', icon: BookMarked, color: 'text-green-500' },
  ];

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="TeachMate"
      subtitle="Continue your learning journey"
      activeMenu="dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-3 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold mb-1">Welcome back, {userName}! 👋</h1>
                <p className="text-sm text-muted-foreground">Ready to create amazing lessons with AI? Let's get started!</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Actions Grid */}
        <ScrollReveal direction="up" delay={0.2}>
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <Button 
                onClick={() => onNavigate('lesson-generator')}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <FileText className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Generate Lesson</span>
              </Button>
              <Button 
                onClick={() => onNavigate('assessment')}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <ClipboardList className="w-6 h-6 text-secondary" />
                <span className="text-sm font-medium">Create Assessment</span>
              </Button>
              <Button 
                onClick={() => onNavigate('copilot')}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <MessageSquare className="w-6 h-6 text-accent" />
                <span className="text-sm font-medium">AI Copilot</span>
              </Button>
              <Button 
                onClick={() => onNavigate('library')}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <BookOpen className="w-6 h-6 text-green-500" />
                <span className="text-sm font-medium">Resource Library</span>
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Professional Development */}
        <ScrollReveal direction="up" delay={0.3}>
          <div>
            <h2 className="text-lg font-semibold mb-3">Professional Development</h2>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Enhance your teaching skills with AI-powered resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Teaching with AI</p>
                        <p className="text-sm text-muted-foreground">Master AI tools for education</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Start</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Assessment Design</p>
                        <p className="text-sm text-muted-foreground">Create effective evaluations</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Start</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Recent Activity */}
        <ScrollReveal direction="up" delay={0.4}>
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Your Latest Lessons</CardTitle>
                <CardDescription>Recently generated content and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recent activities yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Start creating lessons to see your activity here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    </SharedLayout>
  );
}
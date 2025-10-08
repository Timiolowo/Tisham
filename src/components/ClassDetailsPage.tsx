import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { 
  ArrowLeft, Users, MessageCircle, Copy, BookOpen, ClipboardList,
  GraduationCap, Send, UserPlus, BarChart3, Calendar, Clock
} from "lucide-react";
import { SharedLayout } from "./SharedLayout";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../contexts/AuthContext";

interface ClassDetailsPageProps {
  onNavigate: (page: any, role?: any) => void;
  classId: string;
}

export function ClassDetailsPage({ onNavigate, classId }: ClassDetailsPageProps) {
  const { user } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [activeQuizzes, setActiveQuizzes] = useState<any[]>([]);
  const [sharedLessons, setSharedLessons] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Sample data - in production, this would come from API calls
  useEffect(() => {
    // Simulate loading class data
    setTimeout(() => {
      setClassData({
        id: classId,
        name: "JSS 3A Mathematics",
        class_code: "CLS1234",
        subject: "Mathematics",
        class_level: "JSS 3",
        school_year: "2025",
        students: 15,
        teacher_id: user?.id
      });

      setStudents([
        { id: 1, name: "Chioma Adeyemi", xp: 3200, lastActive: "2 hours ago", status: "active" },
        { id: 2, name: "Ahmed Kwara", xp: 2890, lastActive: "5 hours ago", status: "active" },
        { id: 3, name: "Chidi Okafor", xp: 2450, lastActive: "1 day ago", status: "active" },
        { id: 4, name: "Blessing Okeke", xp: 2340, lastActive: "3 hours ago", status: "active" },
        { id: 5, name: "Emeka Nwankwo", xp: 2100, lastActive: "1 week ago", status: "inactive" }
      ]);

      setActiveQuizzes([
        { id: 1, name: "Algebra Basics Quiz", due: "Due in 2 days", students: 12, total: 15 },
        { id: 2, name: "Geometry Test", due: "Due in 1 week", students: 8, total: 15 },
        { id: 3, name: "Trigonometry Assessment", due: "Due in 3 days", students: 15, total: 15 }
      ]);

      setSharedLessons([
        { id: 1, name: "Introduction to Algebra", views: 45, completions: 32, avgScore: 85 },
        { id: 2, name: "Quadratic Equations", views: 38, completions: 28, avgScore: 78 },
        { id: 3, name: "Graphing Functions", views: 42, completions: 35, avgScore: 82 },
        { id: 4, name: "Polynomial Operations", views: 29, completions: 22, avgScore: 76 },
        { id: 5, name: "Factoring Techniques", views: 35, completions: 28, avgScore: 80 }
      ]);

      setChatMessages([
        { id: 1, sender: "Teacher", message: "Welcome to our Mathematics class! Let's start with today's lesson.", time: "9:00 AM", type: "teacher" },
        { id: 2, sender: "Chioma Adeyemi", message: "Good morning, sir! Ready to learn.", time: "9:05 AM", type: "student" },
        { id: 3, sender: "Ahmed Kwara", message: "I have a question about yesterday's homework.", time: "9:07 AM", type: "student" },
        { id: 4, sender: "Teacher", message: "Sure Ahmed, what's your question?", time: "9:08 AM", type: "teacher" }
      ]);

      setLoading(false);
    }, 1000);
  }, [classId, user?.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: user?.full_name || "Teacher",
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: user?.role === 'teacher' ? 'teacher' : 'student'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage("");
    toast.success("Message sent!");
  };

  const handleCopyClassCode = () => {
    navigator.clipboard.writeText(classData?.class_code || "");
    toast.success("Class code copied to clipboard!");
  };

  if (loading) {
    return (
      <SharedLayout 
        onNavigate={onNavigate}
        userRole="teacher"
        title="Loading..."
        subtitle="Loading class details"
        hideHeaderIcons={true}
        activeMenu="class-management"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading class details...</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title={classData?.name || "Class Details"}
      subtitle="Manage class and communicate"
      hideHeaderIcons={true}
      activeMenu="class-management"
    >
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onNavigate('class-management')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{classData?.name}</h1>
            <p className="text-muted-foreground">{classData?.subject} • {classData?.class_level}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl gradient-primary mx-auto mb-2 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{students.length}</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl gradient-secondary mx-auto mb-2 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{activeQuizzes.length}</div>
              <div className="text-xs text-muted-foreground">Active Quizzes</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl gradient-success mx-auto mb-2 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{sharedLessons.length}</div>
              <div className="text-xs text-muted-foreground">Shared Lessons</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl gradient-warm mx-auto mb-2 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{chatMessages.length}</div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1">
            <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl">Students</TabsTrigger>
            <TabsTrigger value="content" className="rounded-xl">Content</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl">Chat</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Class Information */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Class Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={classData?.class_code} 
                        readOnly 
                        className="rounded-xl font-mono" 
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCopyClassCode}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={classData?.subject} readOnly className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Input value={classData?.class_level} readOnly className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>School Year</Label>
                    <Input value={classData?.school_year} readOnly className="rounded-xl" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">New student joined</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Quiz completed</div>
                      <div className="text-xs text-muted-foreground">4 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <div className="w-8 h-8 rounded-full gradient-success flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Lesson shared</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4 animate-fade-in">
            <Card className="rounded-2xl glass-card">
              <CardHeader>
                <CardTitle>Students ({students.length})</CardTitle>
                <CardDescription>Manage your class students</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {students.map((student) => (
                    <div key={student.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{student.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>{student.xp} XP</span>
                          <span>•</span>
                          <span>Active {student.lastActive}</span>
                        </div>
                      </div>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Quizzes */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Active Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeQuizzes.map((quiz) => (
                    <div key={quiz.id} className="p-3 bg-muted rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{quiz.name}</div>
                        <Badge variant="outline" className="text-xs">{quiz.due}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{quiz.students}/{quiz.total} students participated</span>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {Math.round((quiz.students / quiz.total) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Shared Lessons */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Shared Lessons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sharedLessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 bg-muted rounded-xl">
                      <div className="font-medium text-sm mb-2">{lesson.name}</div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold">{lesson.views}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{lesson.completions}</div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{lesson.avgScore}%</div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4 animate-fade-in">
            <Card className="rounded-2xl glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Class Chat
                </CardTitle>
                <CardDescription>Communicate with your students</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-xl ${
                        message.type === 'teacher' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="font-medium text-xs mb-1">{message.sender}</div>
                        <div className="text-sm">{message.message}</div>
                        <div className="text-xs opacity-70 mt-1">{message.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="rounded-xl resize-none"
                      rows={2}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="rounded-xl self-end"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </SharedLayout>
  );
}

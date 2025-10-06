import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sparkles, GraduationCap, Users, Loader2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {
  onNavigate: (page: any, role?: any) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(teacherEmail, teacherPassword, 'teacher');
      toast.success("Welcome back, Teacher!");
      onNavigate('dashboard', 'teacher');
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Using demo mode.");
      // Still navigate for demo purposes
      onNavigate('dashboard', 'teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(studentId, studentPassword, 'student');
      toast.success("Welcome back, Student!");
      onNavigate('dashboard', 'student');
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Using demo mode.");
      // Still navigate for demo purposes
      onNavigate('dashboard', 'student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1632215861513-130b66fe97f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdlcmlhbiUyMHN0dWRlbnRzJTIwY2xhc3Nyb29tfGVufDF8fHx8MTc1OTYxMzA4MHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Nigerian students learning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-white">
          <div className="text-center space-y-6 backdrop-blur-sm bg-black/30 p-8 rounded-3xl">
            <h2 className="text-base lg:text-base font-bold">
              Empowering Nigerian Education
            </h2>
            <p className="text-lg opacity-90">
              Join thousands of teachers transforming classrooms with AI
            </p>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-base font-bold">1000+</p>
                <p className="text-sm opacity-80">Schools</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold">5000+</p>
                <p className="text-sm opacity-80">Teachers</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold">50K+</p>
                <p className="text-sm opacity-80">Students</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 gradient-primary">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-base sm:text-base font-bold">TeachMate</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to continue</p>
        </div>

        {/* Login Tabs */}
        <Card className="rounded-3xl glass-card border-2 border-primary/10 shadow-2xl animate-slide-up">
          <CardContent className="p-6">
            <Tabs defaultValue="teacher" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1">
                <TabsTrigger value="teacher" className="rounded-xl">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="student" className="rounded-xl">
                  <Users className="w-4 h-4 mr-2" />
                  Student
                </TabsTrigger>
              </TabsList>

              {/* Teacher Login */}
              <TabsContent value="teacher" className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Teacher Login</h3>
                  <p className="text-sm text-muted-foreground">Access your teaching dashboard</p>
                </div>
                
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">Email Address</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="teacher@school.edu"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      placeholder="••••••••"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-2xl gradient-primary" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In as Teacher'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Student Login */}
              <TabsContent value="student" className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Student Login</h3>
                  <p className="text-sm text-muted-foreground">Start your learning journey</p>
                </div>
                
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      placeholder="STU-12345"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="••••••••"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-2xl gradient-secondary" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In as Student'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => onNavigate('landing')}
                className="text-sm"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

          {/* Demo Credentials */}
          <Card className="mt-4 rounded-2xl glass-card border border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center mb-2">
                <strong>Demo Credentials:</strong>
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Teacher: any email / any password</p>
                <p>Student: any ID / any password</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

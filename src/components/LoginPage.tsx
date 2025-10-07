import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sparkles, GraduationCap, Users, School, Loader2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {
  onNavigate: (page: any, role?: any) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Removed role selection - will auto-detect from database
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      onNavigate('dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
      toast.error(errorMessage);
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

          {/* Login Form */}
          <Card className="rounded-3xl glass-card border-2 border-primary/10 shadow-2xl animate-slide-up">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Welcome Back</h3>
                  <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
                </div>

                {/* Single Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                      'Sign In'
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center space-y-2">
            <Button 
              variant="link" 
              onClick={() => onNavigate('register')}
              className="text-sm text-primary"
            >
              Don't have an account? Sign up
            </Button>
            <br />
            <Button 
              variant="link" 
              onClick={() => onNavigate('landing')}
              className="text-sm"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
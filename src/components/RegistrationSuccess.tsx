import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Mail, ArrowRight, School, Users, GraduationCap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface RegistrationSuccessProps {
  onNavigate: (page: string) => void;
  userRole?: 'school_admin' | 'teacher' | 'student';
  email?: string;
  schoolCode?: string;
}

export function RegistrationSuccess({ onNavigate, userRole = 'teacher', email, schoolCode }: RegistrationSuccessProps) {
  const successMessages = {
    school_admin: {
      title: "School Registration Successful!",
      description: "Welcome to Tisham! Your school has been created and you're now the administrator.",
      icon: School,
      nextSteps: [
        "Check your email for verification link",
        "Share your school code with teachers and students",
        "Set up your school profile and classes",
        "Invite teachers to join your school"
      ]
    },
    teacher: {
      title: "Teacher Registration Successful!",
      description: "Welcome to Tisham! You can now access the teacher dashboard.",
      icon: Users,
      nextSteps: [
        "Check your email for verification link",
        "Complete your profile setup",
        "Start creating amazing lessons",
        "Set up your classes and invite students"
      ]
    },
    student: {
      title: "Student Registration Successful!",
      description: "Welcome to Tisham! Your student account has been created.",
      icon: GraduationCap,
      nextSteps: [
        "Check your email for verification link",
        "Join your classes using the class code",
        "Start your learning journey",
        "Complete your profile setup"
      ]
    }
  };

  const currentMessage = successMessages[userRole];
  const IconComponent = currentMessage.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md mx-auto rounded-3xl glass-card border-2 border-primary/10 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <IconComponent className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {currentMessage.title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {currentMessage.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {email && (
            <div className="flex items-center space-x-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Verification Email Sent</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Check {email} for verification link</p>
              </div>
            </div>
          )}

          {schoolCode && userRole === 'school_admin' && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">Your School Code</p>
              <p className="text-lg font-mono tracking-wider text-green-800 dark:text-green-200">{schoolCode}</p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">Share this code with teachers and students to join your school</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Next Steps:</h4>
            <ul className="space-y-2">
              {currentMessage.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => onNavigate('login')} 
              className="w-full rounded-2xl gradient-primary"
              size="lg"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onNavigate('landing')} 
              className="w-full rounded-2xl"
              size="lg"
            >
              Back to Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a 
                href="mailto:otimilehinoladipupo@gmail.com" 
                className="text-primary hover:underline font-medium"
              >
                otimilehinoladipupo@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

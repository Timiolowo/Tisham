import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, School, GraduationCap, Users } from 'lucide-react';

interface RegistrationSuccessProps {
  onNavigate: (page: any) => void;
}

export function RegistrationSuccess({ onNavigate }: RegistrationSuccessProps) {
  const [schoolCode, setSchoolCode] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    setSchoolCode(urlParams.get('schoolCode') || '');
    setRole(urlParams.get('role') || '');
  }, []);

  const getSuccessMessage = () => {
    switch (role) {
      case 'school_admin':
        return {
          title: "School Registration Successful!",
          description: "Your school has been registered successfully. Use this code to invite teachers.",
          codeLabel: "Your School Code",
          code: schoolCode,
          buttonText: "Go to Dashboard",
          icon: <School className="w-12 h-12 text-primary" />
        };
      case 'teacher':
        return {
          title: "Teacher Registration Successful!",
          description: "Welcome to TeachMate! You can now access the teacher dashboard.",
          codeLabel: "Your Teacher ID",
          code: "TCH" + Math.floor(10000 + Math.random() * 90000),
          buttonText: "Go to Dashboard",
          icon: <GraduationCap className="w-12 h-12 text-primary" />
        };
      case 'student':
        return {
          title: "Student Registration Successful!",
          description: "Welcome to TeachMate! You can now access your student dashboard.",
          codeLabel: "Your Student ID",
          code: "STU" + Math.floor(10000 + Math.random() * 90000),
          buttonText: "Go to Dashboard",
          icon: <Users className="w-12 h-12 text-primary" />
        };
      default:
        return {
          title: "Registration Successful!",
          description: "Your account has been created successfully.",
          codeLabel: "",
          code: "",
          buttonText: "Go to Dashboard",
          icon: <CheckCircle2 className="w-12 h-12 text-primary" />
        };
    }
  };

  const success = getSuccessMessage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg rounded-3xl shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {success.icon}
          </div>
          <h2 className="text-2xl font-bold mb-4">{success.title}</h2>
          <p className="text-muted-foreground mb-8">
            {success.description}
          </p>
          {success.code && (
            <div className="bg-muted p-6 rounded-2xl mb-8">
              <p className="text-sm text-muted-foreground mb-2">{success.codeLabel}</p>
              <p className="text-2xl font-mono tracking-wider">{success.code}</p>
            </div>
          )}
          <div className="space-y-3">
            <Button className="w-full rounded-2xl" size="lg" onClick={() => onNavigate('login')}>
              {success.buttonText}
            </Button>
            {role === 'school_admin' && (
              <Button variant="outline" className="w-full rounded-2xl" size="lg">
                Invite Teachers
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

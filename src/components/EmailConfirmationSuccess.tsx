import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface EmailConfirmationSuccessProps {
  onNavigate: (page: any) => void;
  email?: string;
}

export function EmailConfirmationSuccess({ onNavigate, email }: EmailConfirmationSuccessProps) {
  const [confirmedEmail, setConfirmedEmail] = useState<string | undefined>(email);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // Get email from URL parameters if not provided as prop
    if (!confirmedEmail) {
      const urlParams = new URLSearchParams(window.location.search);
      const emailFromUrl = urlParams.get('email');
      if (emailFromUrl) {
        setConfirmedEmail(emailFromUrl);
      }
    }
  }, [confirmedEmail]);

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onNavigate('login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNavigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md mx-auto rounded-3xl glass-card border-2 border-primary/10 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            Email Confirmed!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your account has been successfully verified
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>
                {confirmedEmail ? `Verified: ${confirmedEmail}` : "Your email has been verified"}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You can now sign in to your Tisham account and start using all the features.
            </p>
            
            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
              <p className="text-sm text-primary font-medium text-center">
                Redirecting to login in {countdown} seconds...
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => onNavigate('login')} 
              className="w-full rounded-2xl gradient-primary"
              size="lg"
            >
              Continue to Sign In {countdown > 0 && `(${countdown}s)`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              onClick={() => onNavigate('landing')} 
              variant="outline" 
              className="w-full rounded-2xl"
            >
              Back to Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble? Contact our support team at{' '}
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

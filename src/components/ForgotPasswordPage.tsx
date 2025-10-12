import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ForgotPasswordPageProps {
  onNavigate: (page: any) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use Supabase password reset
      const response = await fetch('/.netlify/functions/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        toast.success("Password reset email sent!");
      } else {
        toast.error(data.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Having trouble? Contact our support team at{' '}
              <a 
                href="mailto:otimilehinoladipupo@gmail.com" 
                className="text-primary hover:underline font-medium"
              >
                otimilehinoladipupo@gmail.com
              </a>
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full rounded-2xl" 
                size="lg"
                onClick={() => onNavigate('login')}
              >
                Back to Login
              </Button>
              <Button 
                variant="outline" 
                className="w-full rounded-2xl" 
                size="lg"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Try Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleResetPassword} className="space-y-4">
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

            <Button type="submit" className="w-full rounded-2xl gradient-primary" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Button 
              variant="link" 
              onClick={() => onNavigate('login')}
              className="text-sm text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Button>
            <br />
            <Button 
              variant="link" 
              onClick={() => onNavigate('landing')}
              className="text-sm"
            >
              ← Back to Home
            </Button>
            <br />
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{' '}
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

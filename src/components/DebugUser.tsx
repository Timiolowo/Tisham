import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface DebugUserProps {
  onBack: () => void;
}

export function DebugUser({ onBack }: DebugUserProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const debugUser = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/debug-teacher-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.userExists && data.profileExists) {
        if (data.schoolExists) {
          toast.success(`User found! Role: ${data.profile.role}, School: ${data.school.name}`);
        } else {
          toast.warning(`User found but no school data. Role: ${data.profile.role}, School ID: ${data.profile.school_id || 'None'}`);
        }
      } else if (data.userExists && !data.profileExists) {
        toast.error("User exists but no profile found. Registration incomplete.");
      } else {
        toast.error("User does not exist. Please register first.");
      }
    } catch (error) {
      console.error('Debug error:', error);
      toast.error("Debug failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Debug User Status</CardTitle>
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email to debug"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button 
            onClick={debugUser} 
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading ? "Checking..." : "Debug User"}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-muted rounded-xl">
              <h3 className="font-semibold mb-2">Debug Results:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold mb-2">Common Issues:</h3>
            <ul className="text-sm space-y-1">
              <li>• <strong>User doesn't exist:</strong> Need to register first</li>
              <li>• <strong>Email not confirmed:</strong> Must click email confirmation link</li>
              <li>• <strong>Wrong password:</strong> Check password is correct</li>
              <li>• <strong>No profile:</strong> Profile creation failed during registration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

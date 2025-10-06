import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface SchoolRegistrationProps {
  onNavigate: (page: any, role?: any) => void;
}

export function SchoolRegistration({ onNavigate }: SchoolRegistrationProps) {
  const [registered, setRegistered] = useState(false);
  const [schoolCode] = useState('TCN' + Math.floor(100000 + Math.random() * 900000));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-3xl shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-base sm:text-base mb-4">Registration Successful!</h2>
            <p className="text-muted-foreground mb-8">
              Your school has been registered successfully. Use this code to invite teachers.
            </p>
            <div className="bg-muted p-6 rounded-2xl mb-8">
              <p className="text-sm text-muted-foreground mb-2">Your School Code</p>
              <p className="text-base sm:text-base tracking-wider">{schoolCode}</p>
            </div>
            <div className="space-y-3">
              <Button className="w-full rounded-2xl" size="lg" onClick={() => onNavigate('login')}>
                Continue to Dashboard
              </Button>
              <Button variant="outline" className="w-full rounded-2xl" size="lg">
                Invite Teachers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => onNavigate('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="rounded-3xl shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-base sm:text-base">Register Your School</CardTitle>
            <CardDescription>
              Join thousands of schools using TeachMate across Nigeria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input 
                  id="schoolName" 
                  placeholder="e.g., Government Secondary School"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolType">School Type</Label>
                  <Select required>
                    <SelectTrigger id="schoolType" className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select required>
                    <SelectTrigger id="state" className="rounded-xl">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lagos">Lagos</SelectItem>
                      <SelectItem value="abuja">Abuja FCT</SelectItem>
                      <SelectItem value="kano">Kano</SelectItem>
                      <SelectItem value="rivers">Rivers</SelectItem>
                      <SelectItem value="oyo">Oyo</SelectItem>
                      <SelectItem value="kaduna">Kaduna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga">Local Government Area</Label>
                <Input 
                  id="lga" 
                  placeholder="e.g., Ikeja"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">School Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="admin@school.edu.ng"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="mb-4">Administrator Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Full Name</Label>
                    <Input 
                      id="adminName" 
                      placeholder="e.g., Dr. Adewale Johnson"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-2xl" size="lg">
                Create School Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

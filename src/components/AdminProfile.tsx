import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Copy, School, Users, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface AdminProfileProps {
  user: any;
  school: any;
}

export function AdminProfile({ user, school }: AdminProfileProps) {
  const [copied, setCopied] = useState(false);

  const copySchoolCode = () => {
    if (school?.school_code) {
      navigator.clipboard.writeText(school.school_code);
      setCopied(true);
      toast.success('School code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!school) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading school information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">School Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Administrator
        </Badge>
      </div>

      {/* School Code Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            School Code
          </CardTitle>
          <CardDescription>
            Share this code with teachers to allow them to join your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-muted px-4 py-3 rounded-lg font-mono text-lg font-bold">
              {school.school_code}
            </div>
            <Button 
              onClick={copySchoolCode}
              variant={copied ? "default" : "outline"}
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Teachers will need this code to register and join your school
          </p>
        </CardContent>
      </Card>

      {/* School Information */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">School Name</label>
              <p className="text-sm">{school.name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">School Type</label>
              <p className="text-sm capitalize">{school.school_type}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">State</label>
              <p className="text-sm capitalize">{school.state}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {school.contact_email}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {school.contact_phone}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {school.address}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <Users className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Invite Teachers</div>
                <div className="text-sm text-muted-foreground">Share school code with teachers</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <School className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Manage School</div>
                <div className="text-sm text-muted-foreground">Update school information</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

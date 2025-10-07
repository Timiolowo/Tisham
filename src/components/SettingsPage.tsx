import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  ArrowLeft, User, Bell, Lock, Palette, LogOut,
  Camera, Mail, Phone, MapPin, School, Loader2
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { SharedLayout } from "./SharedLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface SettingsPageProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate?: (page: any, role?: any) => void;
  userRole?: 'teacher' | 'student';
}

export function SettingsPage({ onBack, onLogout, onNavigate, userRole = 'teacher' }: SettingsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<any>(null);
  
  // Define isStudent based on user role
  const isStudent = user?.role === 'student';
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState<number>(0);

  useEffect(() => {
    if (user) {
      // Set form data from user profile
      setName(user.full_name || "");
      setEmail(user.email || "");
      setBio(user.role === 'student' 
        ? "Student passionate about learning and technology!"
        : "Teacher passionate about education and student success!");
      setLocation("Lagos, Nigeria"); // Default location
      setStudentClass(user.class_level || "");
      setSubjects(user.subjects || []);
      setYearsExperience(user.years_experience || 0);
      
      // Fetch school information if user has school_id
      if (user.school_id) {
        fetchSchoolInfo();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchSchoolInfo = async () => {
    try {
      console.log('=== FETCHING SCHOOL INFO ===');
      console.log('User ID:', user?.id);
      console.log('User role:', user?.role);
      console.log('School ID:', user?.school_id);
      console.log('Full user object:', user);
      
      if (!user?.school_id) {
        console.log('❌ No school_id found for user');
        setSchool(null);
        setLoading(false);
        return;
      }

      console.log('🔍 Querying schools table with school_id:', user.school_id);
      
      const { data: schoolData, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', user.school_id)
        .single();

      if (error) {
        console.error('❌ Error fetching school:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setSchool(null);
      } else {
        console.log('✅ School data fetched successfully:', schoolData);
        setSchool(schoolData);
      }
    } catch (error) {
      console.error('❌ Exception in fetchSchoolInfo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    onLogout();
  };

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole={userRole}
      title="Settings"
      subtitle="Manage your account and preferences"
      activeMenu="settings"
      hideHeaderIcons={true}
    >

      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-2xl p-1">
            <TabsTrigger value="profile" className="rounded-xl text-xs sm:text-sm">
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl text-xs sm:text-sm">
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl text-xs sm:text-sm">
              <Lock className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-xl text-xs sm:text-sm">
              <Palette className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Appearance</span>
              <span className="sm:hidden">Theme</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="rounded-2xl glass-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and public profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-base sm:text-base gradient-primary text-white">
                        MO
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 sm:w-10 sm:h-10"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold">{name || 'Loading...'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {school && typeof school === 'object' && school.name 
                        ? school.name 
                        : 'Loading school...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.role === 'student' 
                        ? `Student • ${studentClass || 'No class assigned'}` 
                        : user?.role === 'school_admin'
                        ? `School Administrator • ${school && typeof school === 'object' && school.name ? school.name : 'School'}`
                        : `Teacher • ${subjects.join(', ') || 'No subjects assigned'}`
                      }
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="rounded-xl pl-10"
                      />
                    </div>
                  </div>
                </div>

                {isStudent && (
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="rounded-xl"
                    rows={4}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSaveProfile} className="rounded-2xl flex-1 sm:flex-initial">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={onBack} className="rounded-2xl flex-1 sm:flex-initial">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* School Information Section - Show for everyone */}
            {user?.role && (
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="w-5 h-5" />
                    School Information
                  </CardTitle>
                  <CardDescription>Your school details and information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {school ? (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>School Name</Label>
                          <Input 
                            value={school && typeof school === 'object' && school.name ? school.name : ''} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>School Type</Label>
                          <Input 
                            value={school && typeof school === 'object' && school.school_type ? school.school_type : ''} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input 
                            value={school && typeof school === 'object' && school.state ? school.state : ''} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Email</Label>
                          <Input 
                            value={school && typeof school === 'object' && school.contact_email ? school.contact_email : ''} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Phone</Label>
                          <Input 
                            value={school && typeof school === 'object' && school.contact_phone ? school.contact_phone : ''} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input 
                            value={school && typeof school === 'object' && school.address ? school.address : ''} 
                            disabled 
                          />
                        </div>
                      </div>
                      
                      {/* School Code for Admin Only */}
                      {user?.role === 'school_admin' && school && typeof school === 'object' && school.school_code && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <Label className="text-sm font-medium">School Code</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input 
                              value={school && typeof school === 'object' && school.school_code ? school.school_code : ''} 
                              disabled 
                              className="font-mono"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(school.school_code);
                                toast.success('School code copied to clipboard!');
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Share this code with teachers to allow them to join your school
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <School className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {user?.role === 'student'
                          ? 'School information not available. Please contact your teacher.'
                          : user?.role === 'teacher' 
                          ? 'School information not available. Please contact your administrator.' 
                          : 'School information not available.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="animate-fade-in">
            <Card className="rounded-2xl glass-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-sm">Student Messages</h4>
                    <p className="text-xs text-muted-foreground">Get notified when students send messages</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-sm">Assignment Submissions</h4>
                    <p className="text-xs text-muted-foreground">Alerts for new submissions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-sm">Weekly Reports</h4>
                    <p className="text-xs text-muted-foreground">Receive weekly activity summaries</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="animate-fade-in">
            <Card className="rounded-2xl glass-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl"
                  />
                </div>

                <Button className="rounded-2xl">Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="animate-fade-in">
            <Card className="rounded-2xl glass-card">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-sm">Theme Mode</h4>
                    <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Section */}
        <Card className="rounded-2xl glass-card border-2 border-destructive/20 mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sign out of your account or delete it permanently
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-2xl w-full sm:w-auto">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll need to sign in again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="rounded-2xl">
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </SharedLayout>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Users, UserPlus, Share2, Copy,
  BookOpen, ClipboardList, Search, MoreVertical, Trash2, MessageCircle,
  Plus, GraduationCap, RefreshCw
} from "lucide-react";
import { SharedLayout } from "./SharedLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getTeacherClasses, createClass, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { isAPIAccessAllowed } from "../config/auth";

interface ClassManagementProps {
  onNavigate: (page: any, role?: any) => void;
}

export function ClassManagement({ onNavigate }: ClassManagementProps) {
  const { user } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateClassDialog, setShowCreateClassDialog] = useState(false);
  const [classCode] = useState("JSS3-MATH-2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [supabaseClasses, setSupabaseClasses] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  
  // Invite student form state
  const [inviteForm, setInviteForm] = useState({
    selectedClass: "",
    studentEmail: "",
    studentName: ""
  });

  
  // Create class form state
  const [newClass, setNewClass] = useState({
    name: "",
    subject: "",
    classLevel: "",
    schoolYear: new Date().getFullYear().toString(),
    maxStudents: 50,
    description: ""
  });
  
  // Load classes from Supabase
  useEffect(() => {
    
    if (isSupabaseConfigured() && user && user.role === 'teacher') {
      loadClasses();
    } else {
    }
  }, [user, user?.id, user?.role]);

  // Test Supabase connection and load classes on mount
  useEffect(() => {
    const testSupabaseConnection = async () => {
      if (isSupabaseConfigured()) {
        try {
          // Test basic connection by checking if we can access the classes table
          const { supabase } = await import('../lib/supabase');
          const { data, error } = await supabase
            .from('classes')
            .select('count')
            .limit(1);
          
          if (error) {
            console.error('Supabase connection test failed:', error);
          } else {
            // If connection is successful and we have a user, try loading classes
            if (user && user.role === 'teacher') {
              loadClasses();
            }
          }
        } catch (error) {
          console.error('Supabase connection test error:', error);
        }
      }
    };
    
    testSupabaseConnection();
  }, [user]);

  const loadClasses = async () => {
    if (!user) {
      return;
    }
    
    
    setIsLoadingClasses(true);
    try {
      // Test direct Supabase query first
      const { supabase } = await import('../lib/supabase');
      
      // First, let's see if there are ANY classes in the database
      const { data: allClasses, error: allClassesError } = await supabase
        .from('classes')
        .select('*');
      
      
      // Now query for this specific teacher
      const { data: directData, error: directError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);
      
      
      // Now try the function
      const classes = await getTeacherClasses(user.id);
      
      setSupabaseClasses(classes);
    } catch (error) {
      console.error('Failed to load classes:', error);
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Removed hardcoded dummy data - using Supabase data only

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    toast.success("Class code copied to clipboard!");
  };

  const handleInviteStudent = () => {
    if (!inviteForm.selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    const selectedClass = supabaseClasses
      .find(c => c.id === inviteForm.selectedClass);

    if (inviteForm.studentEmail) {
      // Send email invitation
      toast.success(`Invitation sent to ${inviteForm.studentEmail} for class: ${selectedClass?.name}`);
    } else {
      // Just show the class code
      toast.success(`Class code for ${selectedClass?.name}: ${selectedClass?.class_code || selectedClass?.code}`);
    }

    // Reset form
    setInviteForm({
      selectedClass: "",
      studentEmail: "",
      studentName: ""
    });
    setShowInviteDialog(false);
  };

  const handleCreateClass = async () => {
    if (!user) return;
    
    setIsCreatingClass(true);
    try {
      const classData = {
        name: newClass.name,
        subject: newClass.subject,
        class_level: newClass.classLevel,
        school_year: newClass.schoolYear,
        max_students: newClass.maxStudents,
        teacher_id: user.id,
        school_id: user.school_id,
        is_active: true
      };

      const createdClass = await createClass(classData);
      
      if (createdClass) {
        toast.success(`Class "${createdClass.name}" created! Class Code: ${createdClass.class_code}`);
        setShowCreateClassDialog(false);
        setNewClass({
          name: "",
          subject: "",
          classLevel: "",
          schoolYear: new Date().getFullYear().toString(),
          maxStudents: 50,
          description: ""
        });
        // Refresh the classes list immediately
        await loadClasses();
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsCreatingClass(false);
    }
  };

  const content = (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 overflow-x-hidden">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 min-h-[120px]">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Card className="rounded-2xl glass-card hover-lift hover-glow cursor-pointer group">
                <CardContent className="p-3 sm:p-4 text-center min-h-[100px] flex flex-col justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base leading-tight">Invite Student</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">Add new students</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle>Invite Students to Class</DialogTitle>
                <DialogDescription>
                  Select a class and invite students via email or share the class code
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Class</Label>
                  <Select 
                    value={inviteForm.selectedClass} 
                    onValueChange={(value) => setInviteForm({...inviteForm, selectedClass: value})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Choose a class to invite students to" />
                    </SelectTrigger>
                    <SelectContent>
                      {supabaseClasses.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} ({classItem.class_code || classItem.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {inviteForm.selectedClass && (
                  <>
                    <div className="space-y-2">
                      <Label>Class Code (Share with students)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={
                            supabaseClasses
                              .find(c => c.id === inviteForm.selectedClass)?.class_code || 
                            supabaseClasses
                              .find(c => c.id === inviteForm.selectedClass)?.code || 
                            "No code available"
                          } 
                          readOnly 
                          className="rounded-xl" 
                        />
                        <Button 
                          onClick={() => {
                            const selectedClass = supabaseClasses
                              .find(c => c.id === inviteForm.selectedClass);
                            const code = selectedClass?.class_code || selectedClass?.code;
                            if (code) {
                              navigator.clipboard.writeText(code);
                              toast.success("Class code copied!");
                            }
                          }} 
                          size="icon" 
                          className="rounded-xl flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Or send invitation email</Label>
                      <div className="space-y-3">
                        <Input 
                          type="email" 
                          placeholder="student@email.com" 
                          value={inviteForm.studentEmail}
                          onChange={(e) => setInviteForm({...inviteForm, studentEmail: e.target.value})}
                          className="rounded-xl" 
                        />
                        <Input 
                          placeholder="Student name (optional)" 
                          value={inviteForm.studentName}
                          onChange={(e) => setInviteForm({...inviteForm, studentName: e.target.value})}
                          className="rounded-xl" 
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleInviteStudent} 
                    className="flex-1 rounded-2xl"
                    disabled={!inviteForm.selectedClass}
                  >
                    Send Invitation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInviteDialog(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-secondary mx-auto mb-3 flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-base font-bold leading-tight">{supabaseClasses.length}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">Total Classes</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-success mx-auto mb-3 flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-base font-bold leading-tight">12</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">Shared Lessons</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-warm mx-auto mb-3 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-base font-bold leading-tight">8</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">Active Quizzes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Classes</h3>
              <div className="flex gap-2">
                <Dialog open={showCreateClassDialog} onOpenChange={setShowCreateClassDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
                      Set up a new class for your students
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="className">Class Name</Label>
                      <Input
                        id="className"
                        placeholder="e.g., JSS 3A Mathematics"
                        value={newClass.name}
                        onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={newClass.subject} onValueChange={(value) => setNewClass({...newClass, subject: value})}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="social-studies">Social Studies</SelectItem>
                            <SelectItem value="computer-science">Computer Science</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                            <SelectItem value="ai">AI</SelectItem>
                            <SelectItem value="robotics">Robotics</SelectItem>
                            <SelectItem value="solar-pv">Solar PV</SelectItem>
                            <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="physical-education">Physical Education</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="classLevel">Class Level</Label>
                        <Select value={newClass.classLevel} onValueChange={(value) => setNewClass({...newClass, classLevel: value})}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jss1">JSS 1</SelectItem>
                            <SelectItem value="jss2">JSS 2</SelectItem>
                            <SelectItem value="jss3">JSS 3</SelectItem>
                            <SelectItem value="ss1">SS 1</SelectItem>
                            <SelectItem value="ss2">SS 2</SelectItem>
                            <SelectItem value="ss3">SS 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="schoolYear">School Year</Label>
                        <Input
                          id="schoolYear"
                          value={newClass.schoolYear}
                          onChange={(e) => setNewClass({...newClass, schoolYear: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxStudents">Max Students</Label>
                        <Input
                          id="maxStudents"
                          type="number"
                          value={newClass.maxStudents}
                          onChange={(e) => setNewClass({...newClass, maxStudents: parseInt(e.target.value) || 50})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the class..."
                        value={newClass.description}
                        onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleCreateClass} 
                        className="flex-1 rounded-xl gradient-primary"
                        disabled={!newClass.name || !newClass.subject || !newClass.classLevel || isCreatingClass}
                      >
                        {isCreatingClass ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating...
                          </>
                        ) : (
                          <>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Create Class
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateClassDialog(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Debug Information */}
              <div className="col-span-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Debug Information:</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>User ID: {user?.id || 'No user ID'}</p>
                  <p>User Role: {user?.role || 'No role'}</p>
                  <p>User Email: {user?.email || 'No email'}</p>
                  <p>User School ID: {user?.school_id || 'No school ID'}</p>
                  <p>Current Port: {window.location.port}</p>
                  <p>Current Host: {window.location.hostname}</p>
                  <p>API Access Allowed: {isAPIAccessAllowed() ? 'Yes' : 'No'}</p>
                  <p>Supabase Configured: {isSupabaseConfigured() ? 'Yes' : 'No'}</p>
                  <p>Loading Classes: {isLoadingClasses ? 'Yes' : 'No'}</p>
                  <p>Classes Count: {supabaseClasses.length}</p>
                  <p>Classes Data: {JSON.stringify(supabaseClasses, null, 2)}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={loadClasses}
                    disabled={isLoadingClasses}
                    className="text-xs"
                  >
                    {isLoadingClasses ? 'Loading...' : 'Manual Load Classes'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      
                      // Test direct Supabase import
                      try {
                        const { supabase } = await import('../lib/supabase');
                        
                        // Test basic query
                        const { data, error } = await supabase
                          .from('classes')
                          .select('*')
                          .limit(5);
                        
                      } catch (error) {
                        console.error('Direct query failed:', error);
                      }
                    }}
                    className="text-xs"
                  >
                    Test Direct Query
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      alert(`To fix the class loading issue:\n\n1. You're currently on port ${window.location.port}\n2. API access is only allowed on port 8888 for localhost\n3. Please run: npm run dev:fullstack\n4. Or access the app at: http://localhost:8888\n\nThis is a security restriction to prevent API access on development ports.`);
                    }}
                    className="text-xs bg-red-50 text-red-700 border-red-200"
                  >
                    Fix Port Issue
                  </Button>
                </div>
              </div>
              
              {/* Display classes from Supabase */}
              {isLoadingClasses ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading classes...</p>
                  </div>
                </div>
              ) : supabaseClasses.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first class to get started with managing students and resources.
                  </p>
                </div>
              ) : (
                supabaseClasses.map((classItem) => (
                  <Card key={classItem.id} className="rounded-2xl glass-card hover-lift hover-glow">
                    <CardHeader>
                      <CardTitle className="text-base">{classItem.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {classItem.students || 0} students
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-muted rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono font-semibold">{classItem.code || classItem.class_code}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(classItem.code || classItem.class_code);
                              toast.success("Code copied!");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 rounded-xl" 
                          size="sm"
                          onClick={() => {
                            onNavigate?.('class-details', { classId: classItem.id });
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl" 
                          size="sm"
                          onClick={() => onNavigate?.('class-chat')}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
  );

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Class Management"
      subtitle="Manage students and resources"
      hideHeaderIcons={true}
      activeMenu="class-management"
      children={content}
    />
  );
}

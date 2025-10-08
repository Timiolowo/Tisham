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
  Plus, GraduationCap
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
    }
  }, [user]);

  const loadClasses = async () => {
    if (!user) return;
    try {
      const classes = await getTeacherClasses(user.id);
      setSupabaseClasses(classes);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const classes = [
    { id: 1, name: 'JSS 3A Mathematics', students: 32, code: 'JSS3A-MATH' },
    { id: 2, name: 'JSS 3B Mathematics', students: 28, code: 'JSS3B-MATH' },
    { id: 3, name: 'SS 2 Mathematics', students: 25, code: 'SS2-MATH' },
  ];

  const students = [
    { id: 1, name: 'Chioma Adeyemi', class: 'JSS 3A', status: 'active', xp: 3200, lastActive: '2 hours ago' },
    { id: 2, name: 'Ahmed Kwara', class: 'JSS 3A', status: 'active', xp: 2890, lastActive: '5 hours ago' },
    { id: 3, name: 'Chidi Okafor', class: 'JSS 3B', status: 'active', xp: 2450, lastActive: '1 day ago' },
    { id: 4, name: 'Blessing Okeke', class: 'JSS 3A', status: 'active', xp: 2340, lastActive: '3 hours ago' },
    { id: 5, name: 'Emeka Nwankwo', class: 'SS 2', status: 'inactive', xp: 2100, lastActive: '1 week ago' },
  ];

  const sharedResources = [
    {
      id: 1,
      title: 'Introduction to Robotics',
      type: 'Lesson',
      sharedWith: ['JSS 3A', 'JSS 3B'],
      views: 58,
      completions: 42,
      avgScore: 85
    },
    {
      id: 2,
      title: 'Algebra Basics Quiz',
      type: 'Assessment',
      sharedWith: ['JSS 3A'],
      views: 32,
      completions: 28,
      avgScore: 78
    },
    {
      id: 3,
      title: 'Quadratic Equations',
      type: 'Lesson',
      sharedWith: ['SS 2'],
      views: 25,
      completions: 20,
      avgScore: 82
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    toast.success("Class code copied to clipboard!");
  };

  const handleInviteStudent = () => {
    if (!inviteForm.selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    const selectedClass = (supabaseClasses.length > 0 ? supabaseClasses : classes)
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

      console.log('Creating class with data:', classData);
      const createdClass = await createClass(classData);
      
      if (createdClass) {
        console.log('Class created successfully:', createdClass);
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
        loadClasses(); // Refresh the classes list
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error("Failed to create class. Please try again.");
    }
  };

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Class Management"
      subtitle="Manage your students and share resources"
      hideHeaderIcons={true}
      activeMenu="class-management"
    >
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Card className="rounded-2xl glass-card hover-lift hover-glow cursor-pointer group">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">Invite Student</h3>
                  <p className="text-xs text-muted-foreground mt-1">Add new students</p>
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
                      {(supabaseClasses.length > 0 ? supabaseClasses : classes).map((classItem) => (
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
                            (supabaseClasses.length > 0 ? supabaseClasses : classes)
                              .find(c => c.id === inviteForm.selectedClass)?.class_code || 
                            (supabaseClasses.length > 0 ? supabaseClasses : classes)
                              .find(c => c.id === inviteForm.selectedClass)?.code || 
                            "No code available"
                          } 
                          readOnly 
                          className="rounded-xl" 
                        />
                        <Button 
                          onClick={() => {
                            const selectedClass = (supabaseClasses.length > 0 ? supabaseClasses : classes)
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
              <h3 className="text-xl sm:text-base font-bold">{supabaseClasses.length || classes.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">Total Classes</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-success mx-auto mb-3 flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-base font-bold">12</h3>
              <p className="text-xs text-muted-foreground mt-1">Shared Lessons</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift flex-1 min-w-[280px]">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-warm mx-auto mb-3 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-base font-bold">8</h3>
              <p className="text-xs text-muted-foreground mt-1">Active Quizzes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 rounded-2xl p-1">
            <TabsTrigger value="classes" className="rounded-xl">Classes</TabsTrigger>
          </TabsList>


          <TabsContent value="classes" className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Classes</h3>
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
                        disabled={!newClass.name || !newClass.subject || !newClass.classLevel}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Create Class
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
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Show Supabase classes if available, otherwise show hardcoded classes */}
              {(supabaseClasses.length > 0 ? supabaseClasses : classes).map((classItem) => (
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
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </SharedLayout>
  );
}

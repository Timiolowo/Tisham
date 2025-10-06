import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { 
  FileText, ClipboardList, Languages, MessageSquare, 
  BookOpen, BarChart3, Map, Settings,
  Sparkles, Clock, BookMarked, Award, Users
} from "lucide-react";
import { SharedLayout } from "./SharedLayout";

interface TeacherDashboardProps {
  onNavigate: (page: any, role?: any) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {


  const stats = [
    { label: 'Lessons Created', value: '24', icon: FileText, color: 'text-primary' },
    { label: 'Assessments Generated', value: '12', icon: ClipboardList, color: 'text-secondary' },
    { label: 'Hours Saved with AI', value: '36', icon: Clock, color: 'text-accent' },
    { label: 'Subjects Covered', value: '5', icon: BookMarked, color: 'text-green-500' },
  ];

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Welcome, Mrs. Okonkwo"
      subtitle="Mathematics Teacher • JSS 2 & 3"
    >
      <div className="space-y-3 h-full overflow-y-auto">
             {/* Welcome Section */}
             <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-3 border border-primary/20">
               <div className="flex items-center justify-between">
                 <div>
                   <h1 className="text-lg font-bold mb-1">Welcome back, Mrs. Okonkwo! 👋</h1>
                   <p className="text-sm text-muted-foreground">Ready to create amazing lessons with AI? Let's get started!</p>
                 </div>
                 <div className="hidden md:flex items-center gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-primary">24</div>
                     <div className="text-xs text-muted-foreground">Lessons Created</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-secondary">36</div>
                     <div className="text-xs text-muted-foreground">Hours Saved</div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Quick Actions Grid */}
             <div>
               <h2 className="text-base font-semibold mb-2">Quick Actions</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                 <Card 
                   className="rounded-2xl cursor-pointer gradient-primary text-white hover-lift hover-glow group overflow-hidden"
                   onClick={() => onNavigate('lesson-generator')}
                 >
                   <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                   <CardContent className="p-3 relative">
                     <FileText className="w-6 h-6 mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                     <h3 className="text-sm font-semibold mb-1">Generate Lesson</h3>
                     <p className="opacity-90 text-xs">Create curriculum-aligned lessons with AI</p>
                   </CardContent>
                 </Card>

                 <Card 
                   className="rounded-2xl cursor-pointer gradient-secondary text-white hover-lift hover-glow group overflow-hidden"
                   onClick={() => onNavigate('assessment')}
                 >
                   <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                   <CardContent className="p-3 relative">
                     <ClipboardList className="w-6 h-6 mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                     <h3 className="text-sm font-semibold mb-1">Create Assessment</h3>
                     <p className="opacity-90 text-xs">Generate quizzes and tests instantly</p>
                   </CardContent>
                 </Card>

                 <Card 
                   className="rounded-2xl cursor-pointer bg-gradient-to-br from-accent to-orange-500 text-white hover-lift hover-glow group overflow-hidden"
                   onClick={() => onNavigate('copilot')}
                 >
                   <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                   <CardContent className="p-3 relative">
                     <MessageSquare className="w-6 h-6 mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                     <h3 className="text-sm font-semibold mb-1">AI Copilot</h3>
                     <p className="opacity-90 text-xs">Get instant teaching assistance</p>
                   </CardContent>
                 </Card>

                 <Card 
                   className="rounded-2xl cursor-pointer bg-gradient-to-br from-green-500 to-emerald-500 text-white hover-lift hover-glow group overflow-hidden"
                   onClick={() => onNavigate('class-management')}
                 >
                   <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                   <CardContent className="p-3 relative">
                     <Users className="w-6 h-6 mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                     <h3 className="text-sm font-semibold mb-1">My Classes</h3>
                     <p className="opacity-90 text-xs">Manage your students and classes</p>
                   </CardContent>
                 </Card>
               </div>
             </div>

             {/* Stats Grid */}
             <div>
               <h2 className="text-base font-semibold mb-2">Your Teaching Stats</h2>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                     <Card key={stat.label} className="rounded-2xl hover-lift">
                       <CardContent className="p-3">
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                             <p className="text-lg font-bold">{stat.value}</p>
                           </div>
                           <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                             <Icon className="w-5 h-5" />
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                );
              })}
               </div>
            </div>

             {/* Professional Development */}
             <div>
               <h2 className="text-base font-semibold mb-2">Professional Development</h2>
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-accent" />
                       <CardTitle>Continue Your Learning Journey</CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => onNavigate('teacher-learning')}
                  >
                    View All
                  </Button>
                </div>
                   <CardDescription>Track your progress and unlock new skills</CardDescription>
              </CardHeader>
              <CardContent>
                   <div className="space-y-6">
                  <div>
                       <div className="flex justify-between mb-3">
                         <span className="text-sm font-medium">AI-Powered Lesson Planning</span>
                      <span className="text-sm font-semibold text-primary">65%</span>
                    </div>
                    <Progress value={65} variant="gradient" showLabel className="h-3" />
                  </div>
                  <div>
                       <div className="flex justify-between mb-3">
                         <span className="text-sm font-medium">Digital Classroom Management</span>
                      <span className="text-sm font-semibold text-accent">30%</span>
                    </div>
                    <Progress value={30} variant="accent" showLabel className="h-3" />
                  </div>
                  <Button 
                    variant="outline" 
                       className="w-full rounded-xl"
                    onClick={() => onNavigate('teacher-learning')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Continue Learning with AI
                  </Button>
                </div>
                </CardContent>
              </Card>
            </div>

             {/* Recent Activity */}
             <div>
               <h2 className="text-base font-semibold mb-2">Recent Activity</h2>
            <Card className="rounded-2xl">
              <CardHeader>
                   <CardTitle>Your Latest Lessons</CardTitle>
                   <CardDescription>Recently generated content and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                       { title: 'Introduction to Robotics', subject: 'Computer Science', class: 'JSS 3', date: '2 days ago', status: 'completed' },
                       { title: 'Algebraic Expressions', subject: 'Mathematics', class: 'JSS 2', date: '3 days ago', status: 'in-progress' },
                       { title: 'Solar Energy Systems', subject: 'Physics', class: 'JSS 3', date: '5 days ago', status: 'completed' },
                  ].map((lesson, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                             <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                             <p className="font-semibold text-sm">{lesson.title}</p>
                             <p className="text-xs text-muted-foreground">
                            {lesson.subject} • {lesson.class}
                          </p>
                        </div>
                      </div>
                         <div className="flex items-center gap-3">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             lesson.status === 'completed' 
                               ? 'bg-green-100 text-green-700' 
                               : 'bg-yellow-100 text-yellow-700'
                           }`}>
                             {lesson.status === 'completed' ? 'Completed' : 'In Progress'}
                           </span>
                           <p className="text-xs text-muted-foreground">{lesson.date}</p>
                         </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
             </div>
      </div>
    </SharedLayout>
  );
}

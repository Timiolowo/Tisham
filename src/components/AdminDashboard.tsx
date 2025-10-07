import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, Users, BookOpen, Clock, TrendingUp, UserPlus, Download, Settings } from "lucide-react";
import { SharedLayout } from "./SharedLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../contexts/AuthContext";

interface AdminDashboardProps {
  onBack: () => void;
  onNavigate: (page: any, role?: any) => void;
}

export function AdminDashboard({ onBack, onNavigate }: AdminDashboardProps) {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role === 'school_admin';
  const stats = [
    { label: 'Total Teachers', value: '24', icon: Users, color: 'text-primary' },
    { label: 'Active Students', value: '680', icon: Users, color: 'text-secondary' },
    { label: 'Active Subjects', value: '12', icon: BookOpen, color: 'text-accent' },
    { label: 'Hours Saved', value: '856', icon: Clock, color: 'text-green-500' },
  ];

  const usageData = [
    { subject: 'Mathematics', lessons: 45 },
    { subject: 'English', lessons: 38 },
    { subject: 'Computer Sci.', lessons: 32 },
    { subject: 'Physics', lessons: 28 },
    { subject: 'Chemistry', lessons: 24 },
    { subject: 'Biology', lessons: 22 },
  ];

  const teachers = [
    {
      name: 'Mrs. Okonkwo',
      subjects: 'Mathematics',
      lastActive: '2 hours ago',
      lessonsCreated: 18,
      status: 'active'
    },
    {
      name: 'Mr. Adeyemi',
      subjects: 'English, Literature',
      lastActive: '5 hours ago',
      lessonsCreated: 15,
      status: 'active'
    },
    {
      name: 'Mrs. Ibrahim',
      subjects: 'Computer Science',
      lastActive: '1 day ago',
      lessonsCreated: 12,
      status: 'active'
    },
    {
      name: 'Mr. Okafor',
      subjects: 'Physics, Chemistry',
      lastActive: '3 hours ago',
      lessonsCreated: 14,
      status: 'active'
    },
    {
      name: 'Miss Bello',
      subjects: 'Biology',
      lastActive: '2 days ago',
      lessonsCreated: 8,
      status: 'inactive'
    },
  ];

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="School Dashboard"
      subtitle="Overview of your school's activity and performance"
      activeMenu="admin"
      hideHeaderIcons={true}
    >

      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="rounded-2xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-base sm:text-base">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Actions - Only for School Admins */}
        {isSchoolAdmin && (
          <Card className="rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                School Management
              </CardTitle>
              <CardDescription>
                Manage teachers, students, and school settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  className="rounded-xl h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
                  onClick={() => onNavigate('manage-teachers')}
                >
                  <Users className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">Manage Teachers</div>
                    <div className="text-xs text-muted-foreground">Add, edit, or remove teachers</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  className="rounded-xl h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
                  onClick={() => onNavigate('manage-students')}
                >
                  <BookOpen className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">Manage Students</div>
                    <div className="text-xs text-muted-foreground">View and manage student accounts</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  className="rounded-xl h-auto p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
                  onClick={() => onNavigate('school-settings')}
                >
                  <Settings className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">School Settings</div>
                    <div className="text-xs text-muted-foreground">Configure school preferences</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Usage Chart */}
          <Card className="rounded-2xl lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage by Subject</CardTitle>
                  <CardDescription>Total lessons created per subject</CardDescription>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                  />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="lessons" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">New Lessons</span>
                  <span className="text-xl sm:text-base">32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Assessments</span>
                  <span className="text-xl sm:text-base">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Active Teachers</span>
                  <span className="text-xl sm:text-base">22</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Efficiency Gain</p>
                    <p className="text-xl sm:text-base">+42%</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compared to last month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Teachers Table - Mobile Responsive */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Teachers Activity</CardTitle>
                <CardDescription>Monitor teacher engagement and productivity</CardDescription>
              </div>
              <Button variant="outline" className="rounded-xl hidden sm:flex">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Lessons Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm">{teacher.name.charAt(0)}</span>
                          </div>
                          <span>{teacher.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{teacher.subjects}</TableCell>
                      <TableCell className="text-muted-foreground">{teacher.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{teacher.lessonsCreated}</span>
                          {teacher.lessonsCreated > 10 && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={teacher.status === 'active' ? 'default' : 'secondary'}
                          className={teacher.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                        >
                          {teacher.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {teachers.map((teacher, i) => (
                <Card key={i} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{teacher.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.subjects}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={teacher.status === 'active' ? 'default' : 'secondary'}
                        className={teacher.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {teacher.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Active</p>
                        <p className="font-medium">{teacher.lastActive}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lessons Created</p>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{teacher.lessonsCreated}</span>
                          {teacher.lessonsCreated > 10 && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </SharedLayout>
  );
}

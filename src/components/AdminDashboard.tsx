import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, Users, BookOpen, Clock, TrendingUp, UserPlus, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminDashboardProps {
  onBack: () => void;
  onNavigate: (page: any, role?: any) => void;
}

export function AdminDashboard({ onBack, onNavigate }: AdminDashboardProps) {
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
    <div className="h-screen max-h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-base truncate">School Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                St. Mary's Secondary School • Overview & Analytics
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" className="rounded-xl flex-1 sm:flex-initial text-xs sm:text-sm">
              <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Invite Teacher</span>
              <span className="sm:hidden">Invite</span>
            </Button>
            <Button variant="outline" className="rounded-xl flex-1 sm:flex-initial text-xs sm:text-sm">
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </header>

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

        {/* Teachers Table */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Teachers Activity</CardTitle>
                <CardDescription>Monitor teacher engagement and productivity</CardDescription>
              </div>
              <Button variant="outline" className="rounded-xl">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

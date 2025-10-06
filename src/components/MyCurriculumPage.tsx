import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { 
  ArrowLeft, BookOpen, CheckCircle, Clock, Target, 
  Calendar, User, PlayCircle, Award, TrendingUp, Sparkles
} from "lucide-react";

interface MyCurriculumPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

interface CurriculumItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  assignedDate: string;
  dueDate: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  topics: string[];
  description: string;
}

export function MyCurriculumPage({ onBack, onNavigate }: MyCurriculumPageProps) {
  const [assignedCurricula, setAssignedCurricula] = useState<CurriculumItem[]>([]);

  useEffect(() => {
    // Load assigned curricula from localStorage (will be Supabase later)
    const saved = localStorage.getItem('assignedCurricula');
    
    if (saved) {
      const allCurricula = JSON.parse(saved);
      // Filter for current student's class (for now, show all)
      setAssignedCurricula(allCurricula);
    } else {
      // Mock data for demo
      const mockData: CurriculumItem[] = [
        {
          id: '1',
          title: 'Introduction to Robotics',
          subject: 'Computer Science',
          teacher: 'Mrs. Okonkwo',
          assignedDate: '2024-01-15',
          dueDate: '2024-02-15',
          progress: 65,
          status: 'in-progress',
          topics: ['Robot Components', 'Sensors', 'Programming Basics', 'Practical Projects'],
          description: 'Learn the fundamentals of robotics, from basic components to building your first robot.'
        },
        {
          id: '2',
          title: 'Algebraic Expressions',
          subject: 'Mathematics',
          teacher: 'Mr. Adeyemi',
          assignedDate: '2024-01-10',
          dueDate: '2024-02-10',
          progress: 100,
          status: 'completed',
          topics: ['Variables', 'Equations', 'Factorization', 'Problem Solving'],
          description: 'Master algebraic expressions and learn to solve complex equations systematically.'
        },
        {
          id: '3',
          title: 'Solar Energy Systems',
          subject: 'Physics',
          teacher: 'Dr. Bello',
          assignedDate: '2024-01-20',
          dueDate: '2024-03-01',
          progress: 0,
          status: 'not-started',
          topics: ['Solar Panels', 'Energy Conversion', 'Storage Systems', 'Applications'],
          description: 'Explore renewable energy through solar power systems and their real-world applications.'
        }
      ];
      setAssignedCurricula(mockData);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'in-progress': return 'bg-accent/10 text-accent border-accent/20';
      case 'not-started': return 'bg-muted/50 text-muted-foreground border-border';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      default: return status;
    }
  };

  const stats = {
    total: assignedCurricula.length,
    completed: assignedCurricula.filter(c => c.status === 'completed').length,
    inProgress: assignedCurricula.filter(c => c.status === 'in-progress').length,
    notStarted: assignedCurricula.filter(c => c.status === 'not-started').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-base font-bold truncate">My Curriculum</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Track your learning progress and assigned lessons
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-base font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-base font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-bold">{stats.notStarted}</p>
                  <p className="text-xs text-muted-foreground">Not Started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Curriculum List */}
        {assignedCurricula.length === 0 ? (
          <Card className="rounded-2xl glass-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Curriculum Assigned Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your teachers will assign lessons and topics for you to learn
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {assignedCurricula.map(curriculum => (
              <Card key={curriculum.id} className="rounded-2xl glass-card hover-lift group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{curriculum.title}</CardTitle>
                      <CardDescription>{curriculum.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(curriculum.status)}>
                      {getStatusLabel(curriculum.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-3 h-3" />
                      <span>{curriculum.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{curriculum.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {new Date(curriculum.dueDate).toLocaleDateString('en-NG')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-3 h-3" />
                      <span>{curriculum.topics.length} Topics</span>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Topics Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {curriculum.topics.slice(0, 3).map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {curriculum.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{curriculum.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {curriculum.status !== 'not-started' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{curriculum.progress}%</span>
                      </div>
                      <Progress 
                        value={curriculum.progress} 
                        variant={curriculum.status === 'completed' ? 'success' : 'gradient'} 
                        className="h-2" 
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 rounded-2xl gradient-primary"
                      disabled={curriculum.status === 'completed'}
                      onClick={() => {
                        if (onNavigate && curriculum.status !== 'completed') {
                          // Navigate to Learn with AI page with curriculum details
                          onNavigate('learn-with-ai', undefined, curriculum.id, curriculum.title);
                        }
                      }}
                    >
                      {curriculum.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : curriculum.status === 'in-progress' ? (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start Learning
                        </>
                      )}
                    </Button>
                    {curriculum.status === 'completed' && (
                      <Button 
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => {
                          if (onNavigate) {
                            // Navigate to Learn with AI for review
                            onNavigate('learn-with-ai', undefined, curriculum.id, curriculum.title);
                          }
                        }}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

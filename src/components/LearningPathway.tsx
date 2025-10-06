import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Award, Clock, CheckCircle2, Lock, Play, Download } from "lucide-react";
import { SharedLayout } from "./SharedLayout";

interface LearningPathwayProps {
  onNavigate: (page: any, role?: any) => void;
}

export function LearningPathway({ onNavigate }: LearningPathwayProps) {
  const [completedModules] = useState(() => {
    const saved = localStorage.getItem('teacherCompletedModules');
    return saved ? JSON.parse(saved) : [];
  });

  const modules = [
    {
      id: 1,
      title: 'AI-Powered Lesson Planning',
      description: 'Master the art of creating engaging lesson plans using AI tools',
      duration: '2 hours',
      progress: completedModules.includes(1) ? 100 : 0,
      completed: completedModules.includes(1),
      locked: false,
      topics: ['Understanding AI', 'Prompt Engineering', 'Content Customization']
    },
    {
      id: 2,
      title: 'Differentiated Instruction',
      description: 'Learn to adapt teaching methods for diverse learning needs',
      duration: '3 hours',
      progress: completedModules.includes(2) ? 100 : 0,
      completed: completedModules.includes(2),
      locked: false,
      topics: ['Learning Styles', 'Adaptive Assessments', 'Personalization']
    },
    {
      id: 3,
      title: 'Digital Classroom Management',
      description: 'Effective strategies for managing online classrooms',
      duration: '2.5 hours',
      progress: completedModules.includes(3) ? 100 : 0,
      completed: completedModules.includes(3),
      locked: false,
      topics: ['Virtual Setup', 'Engagement', 'Parent Communication']
    },
    {
      id: 4,
      title: 'Assessment Design & Analytics',
      description: 'Create effective assessments and interpret data',
      duration: '3.5 hours',
      progress: completedModules.includes(4) ? 100 : 0,
      completed: completedModules.includes(4),
      locked: false,
      topics: ['Test Design', 'Auto-Grading', 'Data Analysis']
    },
    {
      id: 5,
      title: 'Gamification in Education',
      description: 'Engage students through game-based learning',
      duration: '2 hours',
      progress: completedModules.includes(5) ? 100 : 0,
      completed: completedModules.includes(5),
      locked: false,
      topics: ['Gamification Principles', 'Badges & Points', 'Challenges']
    },
    {
      id: 6,
      title: 'Nigerian Curriculum Integration',
      description: 'Align methods with Nigerian education standards',
      duration: '2 hours',
      progress: completedModules.includes(6) ? 100 : 0,
      completed: completedModules.includes(6),
      locked: false,
      topics: ['Education Framework', 'Cultural Context', 'Exam Prep']
    }
  ];

  const totalModules = modules.length;
  const completedCount = modules.filter(m => m.completed).length;
  const overallProgress = Math.round((completedCount / totalModules) * 100);
  const allCompleted = completedCount === totalModules;

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Learning Pathway"
      subtitle="Professional Development Modules"
      hideHeaderIcons={true}
      activeMenu="pathway"
    >

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Progress Card */}
        <Card className="rounded-2xl gradient-success text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl md:text-base mb-1">Your Learning Journey</h2>
                <p className="text-sm sm:text-base opacity-90">
                  {completedCount} of {totalModules} modules completed
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-base sm:text-base md:text-base mb-1">{overallProgress}%</div>
                <p className="text-xs sm:text-sm opacity-90">Overall Progress</p>
              </div>
            </div>
            <Progress value={overallProgress} variant="success" showLabel className="h-4 bg-white/20" />
          </CardContent>
        </Card>

        {/* Achievement Banner */}
        {allCompleted && (
          <Card className="rounded-2xl mb-6 border-success bg-gradient-to-r from-success/10 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-success/20 rounded-xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">🎉 Congratulations!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've completed all modules! Download your certificate.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => onNavigate?.('certificate')}
                  className="rounded-2xl gradient-success"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificate Button */}
        {allCompleted && (
          <div className="flex justify-center">
            <Button 
              onClick={() => onNavigate('certificate')}
              className="rounded-2xl gradient-success"
            >
              <Award className="w-4 h-4 mr-2" />
              Get Certificate
            </Button>
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, index) => (
            <Card 
              key={module.id} 
              className={`rounded-2xl ${module.locked ? 'opacity-60' : 'hover:shadow-lg transition-shadow'} glass-card`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant={module.completed ? 'default' : 'outline'} className="bg-primary/10 text-primary border-0">
                    Module {index + 1}
                  </Badge>
                  {module.completed && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  {module.locked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>

                {/* Topics */}
                <div className="space-y-2 mb-4">
                  {module.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                {module.progress > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} variant="gradient" className="h-2.5" />
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{module.duration}</span>
                  </div>
                  <Button 
                    size="sm"
                    variant={module.completed ? 'outline' : 'default'}
                    disabled={module.locked}
                    onClick={() => onNavigate?.('teacher-learning')}
                    className="rounded-xl"
                  >
                    {module.locked ? (
                      <>
                        <Lock className="w-3 h-3 mr-2" />
                        Locked
                      </>
                    ) : module.completed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-2" />
                        {module.progress > 0 ? 'Continue' : 'Start'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </SharedLayout>
  );
}

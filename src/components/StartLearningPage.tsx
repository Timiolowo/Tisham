import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  Play, Pause, CheckCircle, Clock, BookOpen, Users, Star, 
  ArrowLeft, ArrowRight, Brain, Target, Trophy, Zap, 
  ChevronRight, ChevronLeft, Bookmark, Share2, Volume2
} from "lucide-react";
import { SharedLayout } from "./SharedLayout";
import { useAuth } from "../contexts/AuthContext";
import { runtimeEnv } from '../lib/runtime-env';

interface StartLearningPageProps {
  onNavigate: (page: any, role?: any) => void;
  courseId?: string;
}

interface CourseContent {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  duration: string;
  skills: string[];
  icon: string;
  reason: string;
  lessons: Lesson[];
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'activity';
  content: string;
  isCompleted: boolean;
  isLocked: boolean;
  order: number;
}

export function StartLearningPage({ onNavigate, courseId = 'math-algebra' }: StartLearningPageProps) {
  const { user } = useAuth();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<CourseContent | null>(null);

  // Mock course data - in real app, this would come from API
  const mockCourse: CourseContent = {
    id: courseId,
    title: "Algebra Fundamentals",
    description: "Master basic algebraic concepts and problem-solving techniques",
    subject: "Mathematics",
    difficulty: "Intermediate",
    duration: "3 hours",
    skills: ["Problem Solving", "Algebraic Thinking", "Logical Reasoning"],
    icon: "📐",
    reason: "Builds on your mathematical foundation",
    progress: 25,
    totalLessons: 8,
    completedLessons: 2,
    lessons: [
      {
        id: "lesson-1",
        title: "Introduction to Variables",
        description: "Learn what variables are and how to use them in algebraic expressions",
        duration: "15 min",
        type: "video",
        content: "Welcome to Algebra Fundamentals! In this lesson, we'll explore the concept of variables and how they represent unknown values in mathematical expressions.",
        isCompleted: true,
        isLocked: false,
        order: 1
      },
      {
        id: "lesson-2",
        title: "Basic Algebraic Operations",
        description: "Master addition, subtraction, multiplication, and division with variables",
        duration: "20 min",
        type: "reading",
        content: "Now that you understand variables, let's learn how to perform basic operations with them. This includes combining like terms and simplifying expressions.",
        isCompleted: true,
        isLocked: false,
        order: 2
      },
      {
        id: "lesson-3",
        title: "Solving Simple Equations",
        description: "Learn to solve equations with one variable using basic operations",
        duration: "25 min",
        type: "video",
        content: "Time to put your skills to work! We'll learn how to solve equations step by step, starting with simple one-variable equations.",
        isCompleted: false,
        isLocked: false,
        order: 3
      },
      {
        id: "lesson-4",
        title: "Practice Problems",
        description: "Apply your knowledge with guided practice exercises",
        duration: "30 min",
        type: "activity",
        content: "Practice makes perfect! Work through a series of problems to reinforce your understanding of algebraic concepts.",
        isCompleted: false,
        isLocked: false,
        order: 4
      },
      {
        id: "lesson-5",
        title: "Quiz: Variables and Operations",
        description: "Test your understanding with a comprehensive quiz",
        duration: "15 min",
        type: "quiz",
        content: "Ready to test your knowledge? This quiz will help you identify areas that need more practice.",
        isCompleted: false,
        isLocked: false,
        order: 5
      },
      {
        id: "lesson-6",
        title: "Advanced Problem Solving",
        description: "Tackle more complex algebraic problems and word problems",
        duration: "35 min",
        type: "video",
        content: "Now we'll apply algebra to real-world problems, including word problems and multi-step equations.",
        isCompleted: false,
        isLocked: true,
        order: 6
      },
      {
        id: "lesson-7",
        title: "Graphing Linear Equations",
        description: "Learn to visualize algebraic relationships through graphing",
        duration: "40 min",
        type: "video",
        content: "Discover how to graph linear equations and understand the relationship between algebra and geometry.",
        isCompleted: false,
        isLocked: true,
        order: 7
      },
      {
        id: "lesson-8",
        title: "Final Assessment",
        description: "Comprehensive test covering all course concepts",
        duration: "45 min",
        type: "quiz",
        content: "Put all your learning together in this final assessment that covers everything from basic variables to graphing.",
        isCompleted: false,
        isLocked: true,
        order: 8
      }
    ]
  };

  useEffect(() => {
    setCourse(mockCourse);
    setProgress(mockCourse.progress);
  }, [courseId]);

  const handleStartLesson = () => {
    setIsPlaying(true);
    // Simulate lesson progress
    setTimeout(() => {
      setIsPlaying(false);
      // Mark lesson as completed
      if (course) {
        const updatedLessons = [...course.lessons];
        updatedLessons[currentLesson].isCompleted = true;
        setCourse({ ...course, lessons: updatedLessons });
        
        // Update progress
        const completedCount = updatedLessons.filter(lesson => lesson.isCompleted).length;
        const newProgress = (completedCount / course.totalLessons) * 100;
        setProgress(newProgress);
      }
    }, 3000);
  };

  const handleNextLesson = () => {
    if (course && currentLesson < course.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'activity': return <Brain className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-700';
      case 'reading': return 'bg-green-100 text-green-700';
      case 'quiz': return 'bg-purple-100 text-purple-700';
      case 'activity': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!course) {
    return (
      <SharedLayout 
        onNavigate={onNavigate}
        userRole="student"
        title="Loading Course..."
        subtitle=""
        activeMenu="dashboard"
        hideHeaderIcons={true}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SharedLayout>
    );
  }

  const currentLessonData = course.lessons[currentLesson];

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="student"
      title={course.title}
      subtitle={`${course.subject} • ${course.difficulty}`}
      activeMenu="dashboard"
      hideHeaderIcons={true}
    >
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Course Header */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{course.icon}</div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                  <p className="text-muted-foreground mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>4.8 (127 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Course Progress</span>
                <span className="text-muted-foreground">{course.completedLessons}/{course.totalLessons} lessons completed</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Lesson */}
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getLessonIcon(currentLessonData.type)}
                      <span>Lesson {currentLesson + 1}: {currentLessonData.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {currentLessonData.description}
                    </CardDescription>
                  </div>
                  <Badge className={getLessonTypeColor(currentLessonData.type)}>
                    {currentLessonData.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentLessonData.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>Lesson {currentLesson + 1} of {course.totalLessons}</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{currentLessonData.content}</p>
                </div>

                <div className="flex items-center gap-3">
                  {currentLessonData.isCompleted ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleStartLesson}
                      disabled={isLoading || currentLessonData.isLocked}
                      className="rounded-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Loading...
                        </>
                      ) : isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Lesson
                        </>
                      )}
                    </Button>
                  )}
                  
                  {currentLessonData.isLocked && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      </div>
                      <span className="text-sm">Complete previous lessons to unlock</span>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousLesson}
                    disabled={currentLesson === 0}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {currentLesson + 1} of {course.totalLessons}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleNextLesson}
                    disabled={currentLesson === course.lessons.length - 1}
                    className="rounded-lg"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Why This Course?</h4>
                  <p className="text-sm text-muted-foreground">
                    💡 {course.reason}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Course Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentLesson 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50'
                      } ${lesson.isLocked ? 'opacity-50' : ''}`}
                      onClick={() => !lesson.isLocked && setCurrentLesson(index)}
                    >
                      <div className="flex-shrink-0">
                        {lesson.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : lesson.isLocked ? (
                          <div className="w-5 h-5 border-2 border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-muted-foreground rounded"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {index + 1}. {lesson.title}
                          </span>
                          <Badge className={`text-xs ${getLessonTypeColor(lesson.type)}`}>
                            {lesson.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}

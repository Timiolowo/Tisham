import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  ArrowLeft, BookOpen, Brain, Sparkles, PlayCircle, CheckCircle,
  Clock, Trophy, Target, Lightbulb, TrendingUp, Award, Loader2,
  Star, Zap, ChevronRight, GraduationCap, Download
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { explainConcept } from "../lib/groq";
import { getGroqApiKey } from "../lib/env";

interface TeacherLearningProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

interface LearningModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  completed: boolean;
  topics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xp: number;
}

interface AILearningContent {
  overview: string;
  keyPoints: string[];
  practicalApplications: string[];
  examples: string[];
  quiz: {
    question: string;
    options: string[];
    correct: number;
  }[];
}

export function TeacherLearning({ onBack, onNavigate }: TeacherLearningProps) {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiContent, setAiContent] = useState<AILearningContent | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [currentTab, setCurrentTab] = useState("lesson");
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  useEffect(() => {
    setHasApiKey(!!getGroqApiKey());
    // Load completed modules from localStorage
    const saved = localStorage.getItem('teacherCompletedModules');
    if (saved) {
      setCompletedModules(JSON.parse(saved));
    }
  }, []);

  const learningModules: LearningModule[] = [
    {
      id: 1,
      title: "AI-Powered Lesson Planning",
      description: "Master the art of creating engaging lesson plans using AI tools",
      duration: "2 hours",
      progress: completedModules.includes(1) ? 100 : 0,
      completed: completedModules.includes(1),
      topics: [
        "Understanding AI in Education",
        "Effective Prompt Engineering for Lessons",
        "Customizing AI-Generated Content",
        "Aligning Lessons with Curriculum"
      ],
      difficulty: "Beginner",
      xp: 100
    },
    {
      id: 2,
      title: "Differentiated Instruction with Technology",
      description: "Learn to adapt teaching methods for diverse learning needs",
      duration: "3 hours",
      progress: completedModules.includes(2) ? 100 : 0,
      completed: completedModules.includes(2),
      topics: [
        "Understanding Learning Styles",
        "Creating Adaptive Assessments",
        "Using AI for Personalization",
        "Tracking Individual Progress"
      ],
      difficulty: "Intermediate",
      xp: 150
    },
    {
      id: 3,
      title: "Digital Classroom Management",
      description: "Effective strategies for managing online and hybrid classrooms",
      duration: "2.5 hours",
      progress: completedModules.includes(3) ? 100 : 0,
      completed: completedModules.includes(3),
      topics: [
        "Setting Up Virtual Classrooms",
        "Engagement Strategies",
        "Behavior Management Online",
        "Parent Communication Tools"
      ],
      difficulty: "Beginner",
      xp: 120
    },
    {
      id: 4,
      title: "Assessment Design & Analytics",
      description: "Create effective assessments and interpret learning data",
      duration: "3.5 hours",
      progress: completedModules.includes(4) ? 100 : 0,
      completed: completedModules.includes(4),
      topics: [
        "Formative vs Summative Assessment",
        "Creating Valid Test Items",
        "Using AI for Auto-Grading",
        "Interpreting Student Data"
      ],
      difficulty: "Advanced",
      xp: 200
    },
    {
      id: 5,
      title: "Gamification in Education",
      description: "Engage students through game-based learning strategies",
      duration: "2 hours",
      progress: completedModules.includes(5) ? 100 : 0,
      completed: completedModules.includes(5),
      topics: [
        "Principles of Gamification",
        "Points, Badges & Leaderboards",
        "Creating Learning Challenges",
        "Balancing Fun and Learning"
      ],
      difficulty: "Intermediate",
      xp: 130
    },
    {
      id: 6,
      title: "Nigerian Curriculum Integration",
      description: "Align modern teaching methods with Nigerian education standards",
      duration: "2 hours",
      progress: completedModules.includes(6) ? 100 : 0,
      completed: completedModules.includes(6),
      topics: [
        "Nigerian Education Framework",
        "Cultural Contextualization",
        "Local Resources & Examples",
        "Exam Preparation Strategies"
      ],
      difficulty: "Intermediate",
      xp: 140
    }
  ];

  const allModulesCompleted = completedModules.length === learningModules.length;
  const totalXPEarned = completedModules.reduce((sum, id) => {
    const module = learningModules.find(m => m.id === id);
    return sum + (module?.xp || 0);
  }, 0);

  const generateAIContent = async (module: LearningModule) => {
    setIsGeneratingContent(true);
    setAiContent(null);
    
    try {
      const topic = module.topics[currentTopicIndex];
      const prompt = `As an expert educator, create comprehensive learning content for a teacher professional development module on "${topic}" within the broader course "${module.title}".

Please provide:
1. A clear overview (2-3 paragraphs) explaining the concept
2. 5 key points teachers must understand
3. 4 practical applications they can use in Nigerian classrooms
4. 3 real-world examples specific to Nigerian education context
5. 2 quiz questions to test understanding

Format as JSON with this structure:
{
  "overview": "...",
  "keyPoints": ["point 1", "point 2", ...],
  "practicalApplications": ["app 1", "app 2", ...],
  "examples": ["example 1", "example 2", "example 3"],
  "quiz": [
    {
      "question": "...",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correct": 0
    }
  ]
}`;

      if (hasApiKey) {
        const response = await explainConcept(topic, prompt);
        
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setAiContent(parsed);
          } else {
            throw new Error("No JSON found");
          }
        } catch {
          setAiContent(createDemoContent(topic));
        }
      } else {
        setAiContent(createDemoContent(topic));
      }
      
      toast.success("Learning content generated!");
    } catch (error) {
      console.error('Content generation error:', error);
      setAiContent(createDemoContent(module.topics[currentTopicIndex]));
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const createDemoContent = (topic: string): AILearningContent => {
    return {
      overview: `${topic} is a crucial component of modern teaching that empowers educators to create more effective learning experiences. In the Nigerian context, this becomes even more important as we work to provide quality education across diverse settings. This module will guide you through practical strategies that you can implement immediately in your classroom, regardless of available resources.`,
      keyPoints: [
        `Understand the theoretical foundation of ${topic}`,
        "Apply evidence-based strategies in your teaching practice",
        "Adapt methods for diverse Nigerian classroom settings",
        "Measure impact on student learning outcomes",
        "Collaborate with colleagues to share successes"
      ],
      practicalApplications: [
        "Daily lesson planning: Integrate concepts into your regular planning routine",
        "Student engagement: Use strategies to increase participation and interest",
        "Assessment design: Create better evaluation tools for your students",
        "Professional growth: Document your journey and reflect on improvements"
      ],
      examples: [
        "A teacher in Lagos used these strategies to increase student participation by 40% in one term",
        "Primary school in Abuja adapted the approach for mixed-ability classes with excellent results",
        "Rural classroom in Kano implemented low-tech versions that achieved significant learning gains"
      ],
      quiz: [
        {
          question: `What is the primary goal when implementing ${topic} in Nigerian classrooms?`,
          options: [
            "Improve student learning outcomes",
            "Impress school administrators",
            "Use expensive technology",
            "Follow international trends"
          ],
          correct: 0
        },
        {
          question: `How should teachers adapt ${topic} for resource-constrained settings?`,
          options: [
            "Focus on principles, not specific tools",
            "Abandon the approach entirely",
            "Only use in well-equipped schools",
            "Wait for more funding"
          ],
          correct: 0
        }
      ]
    };
  };

  const handleStartModule = (module: LearningModule) => {
    setSelectedModule(module);
    setCurrentTopicIndex(0);
    setQuizAnswers({});
    setCurrentTab("lesson");
    generateAIContent(module);
  };

  const handleNextTopic = () => {
    if (selectedModule && currentTopicIndex < selectedModule.topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
      generateAIContent(selectedModule);
      setCurrentTab("lesson");
    }
  };

  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
      if (selectedModule) {
        generateAIContent(selectedModule);
        setCurrentTab("lesson");
      }
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleCompleteModule = () => {
    if (!selectedModule) return;

    // Check if all quiz questions answered correctly
    const allCorrect = aiContent?.quiz.every((q, idx) => quizAnswers[idx] === q.correct);
    
    if (!allCorrect) {
      toast.error("Please answer all quiz questions correctly to complete this module");
      setCurrentTab("quiz");
      return;
    }

    // Mark module as completed
    const newCompleted = [...completedModules, selectedModule.id];
    setCompletedModules(newCompleted);
    localStorage.setItem('teacherCompletedModules', JSON.stringify(newCompleted));
    
    toast.success(`Module completed! +${selectedModule.xp} XP earned! 🎉`);
    setSelectedModule(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success/10 text-success border-success/20';
      case 'Intermediate': return 'bg-accent/10 text-accent border-accent/20';
      case 'Advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted';
    }
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedModule(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">{selectedModule.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Topic {currentTopicIndex + 1} of {selectedModule.topics.length}
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-2">
              {selectedModule.topics.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    idx < currentTopicIndex
                      ? 'bg-success'
                      : idx === currentTopicIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto p-4 sm:p-6">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {/* Current Topic */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{selectedModule.topics[currentTopicIndex]}</CardTitle>
                      <CardDescription>AI-Powered Learning Content</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {isGeneratingContent ? (
                <Card className="rounded-2xl glass-card">
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-semibold mb-2">Generating Your Learning Content...</p>
                    <p className="text-sm text-muted-foreground">
                      AI is creating personalized content for you
                    </p>
                  </CardContent>
                </Card>
              ) : aiContent ? (
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lesson">📖 Lesson</TabsTrigger>
                    <TabsTrigger value="quiz">🎯 Knowledge Check</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lesson" className="space-y-6 mt-6">
                    {/* Overview */}
                    <Card className="rounded-2xl glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-accent" />
                          Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {aiContent.overview}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Key Points */}
                    <Card className="rounded-2xl glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Key Learning Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiContent.keyPoints.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                              </div>
                              <p className="text-sm text-muted-foreground flex-1">{point}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Practical Applications */}
                    <Card className="rounded-2xl glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-accent" />
                          Practical Applications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiContent.practicalApplications.map((app, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground flex-1">{app}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Examples */}
                    <Card className="rounded-2xl glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-success" />
                          Real-World Examples
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiContent.examples.map((example, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-success/5 border border-success/10">
                              <p className="text-sm text-muted-foreground">{example}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="quiz" className="space-y-6 mt-6">
                    {/* Quiz Questions */}
                    <Card className="rounded-2xl glass-card border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          Knowledge Check
                        </CardTitle>
                        <CardDescription>
                          Answer all questions correctly to complete this topic
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {aiContent.quiz.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-3">
                            <p className="font-semibold">
                              {qIdx + 1}. {q.question}
                            </p>
                            <div className="grid gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[qIdx] === oIdx;
                                const isCorrect = oIdx === q.correct;
                                const showResult = isSelected;

                                return (
                                  <Button
                                    key={oIdx}
                                    variant="outline"
                                    onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                    className={`justify-start text-left h-auto p-3 rounded-xl ${
                                      showResult
                                        ? isCorrect
                                          ? 'border-success bg-success/10 text-success'
                                          : 'border-destructive bg-destructive/10 text-destructive'
                                        : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        showResult
                                          ? isCorrect
                                            ? 'bg-success text-white'
                                            : 'bg-destructive text-white'
                                          : 'bg-muted'
                                      }`}>
                                        {showResult && isCorrect ? (
                                          <CheckCircle className="w-4 h-4" />
                                        ) : (
                                          <span className="text-xs font-semibold">
                                            {String.fromCharCode(65 + oIdx)}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-sm flex-1">{opt}</span>
                                    </div>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : null}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousTopic}
                  disabled={currentTopicIndex === 0}
                  className="flex-1 rounded-2xl"
                >
                  Previous Topic
                </Button>
                {currentTopicIndex === selectedModule.topics.length - 1 ? (
                  <Button
                    onClick={handleCompleteModule}
                    className="flex-1 rounded-2xl gradient-success"
                  >
                    Complete Module
                    <Trophy className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextTopic}
                    className="flex-1 rounded-2xl gradient-primary"
                  >
                    Next Topic
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-base font-bold truncate">Continue Learning</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              AI-powered professional development for modern educators
            </p>
          </div>
          {allModulesCompleted && (
            <Button 
              onClick={() => onNavigate?.('certificate')}
              className="rounded-2xl gradient-success hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Get Certificate
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold">{completedModules.length}/{learningModules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-base font-bold">{totalXPEarned}</p>
                  <p className="text-xs text-muted-foreground">Total XP Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-base font-bold">{allModulesCompleted ? 'Yes!' : 'Not Yet'}</p>
                  <p className="text-xs text-muted-foreground">Certificate Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Unlock Banner */}
        {allModulesCompleted && (
          <Card className="rounded-2xl border-success bg-gradient-to-r from-success/10 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Congratulations! 🎉</h3>
                    <p className="text-sm text-muted-foreground">
                      You've completed all modules! Download your certificate now.
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

        {/* API Key Notice */}
        {!hasApiKey && (
          <Card className="rounded-2xl border-accent/20 bg-gradient-to-r from-accent/5 to-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">AI-Powered Learning Available!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add your Groq API key in Settings to unlock personalized AI-generated learning content for each topic.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Demo content will be shown for now.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Modules */}
        <div className="grid md:grid-cols-2 gap-6">
          {learningModules.map(module => (
            <Card key={module.id} className="rounded-2xl glass-card hover-lift group">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="flex-1">{module.title}</CardTitle>
                      {module.completed && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>

                {/* Progress */}
                {module.completed && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success font-semibold">✓ Completed</span>
                      <span className="font-semibold">100%</span>
                    </div>
                    <Progress value={100} variant="success" className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Topics */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Topics Covered:</p>
                  <div className="space-y-1">
                    {module.topics.slice(0, 3).map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3" />
                        <span>{topic}</span>
                      </div>
                    ))}
                    {module.topics.length > 3 && (
                      <p className="text-xs text-muted-foreground ml-5">
                        +{module.topics.length - 3} more topics
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {module.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-accent" />
                      +{module.xp} XP
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartModule(module)}
                    className="rounded-xl gradient-primary"
                    disabled={module.completed}
                  >
                    {module.completed ? 'Completed' : 'Start'}
                    {!module.completed && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

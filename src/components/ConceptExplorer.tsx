import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { 
  ArrowLeft, Search, Sparkles, BookOpen, TrendingUp, Zap, Brain,
  Play, CheckCircle, Lock, Star, Briefcase, GraduationCap, DollarSign,
  MapPin, Loader2, Target, Award, Clock, Users
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { explainConcept } from "../lib/groq";
// Get Groq API key from environment
import { runtimeEnv } from '../lib/runtime-env';
import { SharedLayout } from "./SharedLayout";
import { useAuth } from "../contexts/AuthContext";

const getGroqApiKey = () => {
  const env = runtimeEnv.getEnv();
  return env.VITE_GROQ_API_KEY || '';
};

interface ConceptExplorerProps {
  onBack: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface Concept {
  id: number;
  name: string;
  icon: string;
  color: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  xpReward: number;
  students: number;
  description: string;
  progress?: number;
  bookmarked?: boolean;
}

interface CareerInfo {
  title: string;
  description: string;
  education: string[];
  skills: string[];
  salary: string;
  growth: string;
  nigerianContext: string;
  pathways: string[];
}

export function ConceptExplorer({ onBack, onNavigate }: ConceptExplorerProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [careerInfo, setCareerInfo] = useState<CareerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState("explore");
  const [exploredConcepts, setExploredConcepts] = useState<number[]>([]);
  const [bookmarkedConcepts, setBookmarkedConcepts] = useState<number[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [conceptExplanation, setConceptExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    const apiKey = getGroqApiKey();
    setHasApiKey(!!apiKey && apiKey !== 'your_groq_api_key_here' && apiKey !== '');
  }, []);

  const handleExploreConcept = async (concept: Concept) => {
    setSelectedConcept(concept);
    setIsExplaining(true);
    
    // Add to explored concepts
    if (!exploredConcepts.includes(concept.id)) {
      setExploredConcepts([...exploredConcepts, concept.id]);
    }

    try {
      if (hasApiKey) {
        const explanation = await explainConcept(concept.name, 'JSS 3');
        setConceptExplanation(explanation);
      } else {
        // Fallback explanation when API key is not available
        setConceptExplanation(`Welcome to ${concept.name}! This is a fascinating ${concept.category.toLowerCase()} concept that ${concept.description.toLowerCase()}. 

Key things to know:
• Difficulty Level: ${concept.difficulty}
• Estimated Learning Time: ${concept.estimatedTime}
• XP Reward: ${concept.xpReward} points
• Students Learning: ${concept.students}

This concept is part of the ${concept.category} category and will help you develop important skills in this area. Start exploring to learn more!`);
      }
    } catch (error) {
      console.error('Error getting concept explanation:', error);
      setConceptExplanation(`Welcome to ${concept.name}! This is an exciting ${concept.category.toLowerCase()} concept to explore. ${concept.description}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleBookmarkConcept = (conceptId: number) => {
    if (bookmarkedConcepts.includes(conceptId)) {
      setBookmarkedConcepts(bookmarkedConcepts.filter(id => id !== conceptId));
    } else {
      setBookmarkedConcepts([...bookmarkedConcepts, conceptId]);
    }
  };

  const handleStartLearning = (concept: Concept) => {
    // Navigate to start learning page with concept ID
    if (onNavigate) {
      onNavigate('start-learning', { courseId: concept.id });
    }
  };

  const allConcepts: Concept[] = [
    { 
      id: 1, 
      name: 'Robotics', 
      icon: '🤖', 
      color: 'from-blue-500 to-cyan-500', 
      category: 'Technology',
      difficulty: 'Intermediate',
      estimatedTime: '15 mins',
      xpReward: 80,
      students: 156,
      description: 'Learn about robots, automation, and how machines help humans',
      progress: 65,
      bookmarked: true
    },
    { 
      id: 2, 
      name: 'Solar Energy', 
      icon: '☀️', 
      color: 'from-yellow-500 to-orange-500', 
      category: 'Science',
      difficulty: 'Beginner',
      estimatedTime: '12 mins',
      xpReward: 60,
      students: 142,
      description: 'Understanding renewable energy from the sun',
      progress: 30
    },
    { 
      id: 3, 
      name: 'Climate Change', 
      icon: '🌍', 
      color: 'from-green-500 to-emerald-500', 
      category: 'Science',
      difficulty: 'Intermediate',
      estimatedTime: '18 mins',
      xpReward: 90,
      students: 128,
      description: 'How our planet is changing and what we can do',
      progress: 0
    },
    { 
      id: 4, 
      name: 'DNA & Genetics', 
      icon: '🧬', 
      color: 'from-purple-500 to-pink-500', 
      category: 'Science',
      difficulty: 'Advanced',
      estimatedTime: '20 mins',
      xpReward: 100,
      students: 98,
      description: 'Explore the building blocks of life',
      progress: 0
    },
    { 
      id: 5, 
      name: 'AI & Machine Learning', 
      icon: '🧠', 
      color: 'from-indigo-500 to-purple-500', 
      category: 'Technology',
      difficulty: 'Advanced',
      estimatedTime: '25 mins',
      xpReward: 120,
      students: 234,
      description: 'How computers learn and make decisions',
      progress: 15,
      bookmarked: true
    },
    { 
      id: 6, 
      name: 'Space Exploration', 
      icon: '🚀', 
      color: 'from-slate-700 to-blue-900', 
      category: 'Science',
      difficulty: 'Intermediate',
      estimatedTime: '22 mins',
      xpReward: 95,
      students: 189,
      description: 'Journey beyond Earth to discover the cosmos',
      progress: 0
    },
    { 
      id: 7, 
      name: 'Cryptocurrency', 
      icon: '💰', 
      color: 'from-amber-500 to-yellow-500', 
      category: 'Technology',
      difficulty: 'Intermediate',
      estimatedTime: '16 mins',
      xpReward: 85,
      students: 167,
      description: 'Understanding digital money and blockchain',
      progress: 0
    },
    { 
      id: 8, 
      name: 'Human Brain', 
      icon: '🧠', 
      color: 'from-pink-500 to-rose-500', 
      category: 'Science',
      difficulty: 'Advanced',
      estimatedTime: '20 mins',
      xpReward: 100,
      students: 145,
      description: 'How your brain works and makes you unique',
      progress: 0
    }
  ];

  const popularCareers = [
    { id: "software-engineer", title: "Software Engineer", icon: "💻", category: "Technology" },
    { id: "doctor", title: "Medical Doctor", icon: "🩺", category: "Healthcare" },
    { id: "teacher", title: "Teacher/Educator", icon: "👨‍🏫", category: "Education" },
    { id: "entrepreneur", title: "Entrepreneur", icon: "🚀", category: "Business" },
    { id: "lawyer", title: "Lawyer", icon: "⚖️", category: "Law" },
    { id: "engineer", title: "Civil Engineer", icon: "🏗️", category: "Engineering" },
    { id: "accountant", title: "Accountant", icon: "📊", category: "Finance" },
    { id: "nurse", title: "Nurse", icon: "👩‍⚕️", category: "Healthcare" },
    { id: "architect", title: "Architect", icon: "🏛️", category: "Design" },
    { id: "data-scientist", title: "Data Scientist", icon: "📈", category: "Technology" },
    { id: "pharmacist", title: "Pharmacist", icon: "💊", category: "Healthcare" },
    { id: "journalist", title: "Journalist", icon: "📰", category: "Media" }
  ];

  const generateCareerInfo = async (careerTitle: string) => {
    setIsLoading(true);
    setCareerInfo(null);

    try {
      const prompt = `As a career counselor for Nigerian students, provide comprehensive information about the career: "${careerTitle}".

Please provide detailed information in the following JSON format:
{
  "title": "${careerTitle}",
  "description": "2-3 sentences about what this career involves",
  "education": ["Required qualifications", "Recommended degrees", "Certifications"],
  "skills": ["Key skill 1", "Key skill 2", "Key skill 3", "Key skill 4"],
  "salary": "Salary range in Nigeria (Naira) or globally",
  "growth": "Career growth prospects and job market outlook",
  "nigerianContext": "2-3 sentences about this career specifically in Nigeria - opportunities, challenges, and demand",
  "pathways": ["Step 1: How to start", "Step 2: Education path", "Step 3: Experience needed", "Step 4: Career progression"]
}`;

      if (hasApiKey) {
        const response = await explainConcept(careerTitle, prompt);
        
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setCareerInfo(parsed);
          } else {
            throw new Error("No JSON found");
          }
        } catch {
          setCareerInfo(createDemoCareerInfo(careerTitle));
        }
      } else {
        setCareerInfo(createDemoCareerInfo(careerTitle));
      }

      toast.success("Career information loaded!");
    } catch (error) {
      console.error('Career info generation error:', error);
      toast.error("Failed to load career info");
      setCareerInfo(createDemoCareerInfo(careerTitle));
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoCareerInfo = (careerTitle: string): CareerInfo => {
    return {
      title: careerTitle,
      description: `A ${careerTitle.toLowerCase()} plays a crucial role in society, combining technical skills with practical problem-solving to make a positive impact. This career offers opportunities for growth, creativity, and making a difference.`,
      education: [
        "Bachelor's degree in relevant field",
        "Professional certifications (where applicable)",
        "Continuous professional development",
        "Specialized training programs"
      ],
      skills: [
        "Strong analytical and problem-solving abilities",
        "Excellent communication skills",
        "Technical expertise in the field",
        "Adaptability and continuous learning mindset"
      ],
      salary: "₦2,000,000 - ₦10,000,000 annually (varies by experience and location)",
      growth: "Strong growth prospects with increasing demand in Nigeria and globally. Opportunities for specialization, leadership roles, and entrepreneurship.",
      nigerianContext: `In Nigeria, ${careerTitle.toLowerCase()}s are in high demand, especially in major cities like Lagos, Abuja, and Port Harcourt. The field offers good earning potential and opportunities for professional growth. However, candidates should be prepared to continuously update their skills to remain competitive.`,
      pathways: [
        "Complete relevant secondary school education (WAEC/NECO with good grades)",
        "Pursue university degree in the field or related discipline",
        "Gain practical experience through internships and entry-level positions",
        "Obtain professional certifications and consider postgraduate studies",
        "Build expertise and progress to senior roles or start your own practice"
      ]
    };
  };

  const handleCareerSelect = (career: { id: string; title: string }) => {
    setSelectedCareer(career.id);
    generateCareerInfo(career.title);
  };

  const handleSearchCareer = () => {
    if (searchQuery.trim()) {
      setSelectedCareer('custom');
      generateCareerInfo(searchQuery);
    }
  };

  const categories = [
    { id: 'all', label: 'All Concepts', icon: Brain },
    { id: 'Science', label: 'Science', icon: BookOpen },
    { id: 'Technology', label: 'Technology', icon: Zap }
  ];

  const filteredConcepts = allConcepts.filter(concept => {
    const matchesCategory = selectedCategory === 'all' || concept.category === selectedCategory;
    const matchesSearch = concept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         concept.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredCareers = popularCareers.filter(career =>
    career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    career.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success/10 text-success border-success/20';
      case 'Intermediate': return 'bg-accent/10 text-accent border-accent/20';
      case 'Advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted';
    }
  };

  // If viewing career detail
  if (selectedCareer && careerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedCareer(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-base font-bold truncate">{careerInfo.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Career Information</p>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-4 sm:p-6">
          <ScrollArea className="h-[calc(100vh-200px)] hide-scrollbar">
            <div className="space-y-6">
              {/* Overview */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{careerInfo.description}</p>
                </CardContent>
              </Card>

              {/* Education Requirements */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Education Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {careerInfo.education.map((edu, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                        <span className="text-muted-foreground">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Key Skills */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Key Skills Needed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {careerInfo.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                        </div>
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Salary & Growth */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="rounded-2xl glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-success" />
                      Salary Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{careerInfo.salary}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Career Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{careerInfo.growth}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Nigerian Context */}
              <Card className="rounded-2xl glass-card border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    In Nigeria 🇳🇬
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{careerInfo.nigerianContext}</p>
                </CardContent>
              </Card>

              {/* Career Pathway */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    How to Get Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {careerInfo.pathways.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => setSelectedCareer(null)} 
                variant="outline" 
                className="w-full rounded-2xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explore More Careers
              </Button>
            </div>
          </ScrollArea>
        </main>
      </div>
    );
  }

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="student"
      title="Concept & Career Explorer"
      subtitle=""
      activeMenu="explorer"
      hideHeaderIcons={true}
    >

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="explore">
              <Brain className="w-4 h-4 mr-2" />
              Concepts
            </TabsTrigger>
            <TabsTrigger value="careers">
              <Briefcase className="w-4 h-4 mr-2" />
              Careers
            </TabsTrigger>
          </TabsList>

          {/* Concepts Tab */}
          <TabsContent value="explore" className="space-y-6">
            {/* Search & Categories */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="rounded-xl"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Concepts Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConcepts.map(concept => (
                <Card 
                  key={concept.id} 
                  className="rounded-2xl glass-card hover-lift hover-glow group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-base p-3 rounded-xl bg-gradient-to-r ${concept.color}`}>
                        {concept.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkConcept(concept.id);
                          }}
                          className="p-1 h-8 w-8"
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              bookmarkedConcepts.includes(concept.id) 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                        <Badge className={getDifficultyColor(concept.difficulty)}>
                          {concept.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {concept.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {concept.description}
                    </p>

                    {concept.progress !== undefined && concept.progress > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{concept.progress}%</span>
                        </div>
                        <Progress value={concept.progress} variant="gradient" className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{concept.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{concept.students}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span className="font-semibold">+{concept.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExploreConcept(concept)}
                        className="flex-1 rounded-lg"
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        Explore
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleStartLearning(concept)}
                        className="flex-1 rounded-lg"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Concept Exploration Modal */}
            {selectedConcept && (
              <Card className="rounded-2xl glass-card mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl p-3 rounded-xl bg-gradient-to-r ${selectedConcept.color}`}>
                        {selectedConcept.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{selectedConcept.name}</CardTitle>
                        <CardDescription>{selectedConcept.description}</CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedConcept(null)}
                      className="rounded-lg"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isExplaining ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-muted-foreground">Getting AI explanation...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-primary" />
                          AI-Powered Explanation
                        </h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {conceptExplanation}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleStartLearning(selectedConcept)}
                          className="rounded-lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning This Concept
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedConcept(null)}
                          className="rounded-lg"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="space-y-6">
            {/* Search */}
            <Card className="rounded-2xl glass-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for any career... (e.g., Pilot, Chef, Scientist)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchCareer()}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  <Button onClick={handleSearchCareer} className="rounded-xl gradient-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Explore
                  </Button>
                </div>
                {!hasApiKey && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Add Groq API key in Settings for AI-powered career insights!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Popular Careers */}
            <div>
              <h2 className="text-xl font-bold mb-4">Popular Careers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCareers.map(career => (
                  <Card 
                    key={career.id} 
                    className="rounded-2xl glass-card hover-lift hover-glow cursor-pointer group"
                    onClick={() => handleCareerSelect(career)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="text-base">{career.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {career.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {career.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <Card className="rounded-2xl glass-card">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-semibold mb-2">Generating Career Information...</p>
                  <p className="text-sm text-muted-foreground">
                    AI is creating personalized career guidance for you
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </SharedLayout>
  );
}

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription } from "./ui/alert";
import { CircularScore } from "./ui/score-card";
import { 
  ArrowLeft, Sparkles, Lightbulb, BookOpen, Zap, Star, Trophy, 
  CheckCircle, Play, RotateCcw, Send, MessageCircle, Loader2, 
  ThumbsUp, ThumbsDown, Info, ChevronRight, ChevronLeft, X
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { explainConcept } from "../lib/groq";
// Get Groq API key from environment
import { runtimeEnv } from '../lib/runtime-env';

const getGroqApiKey = () => {
  const env = runtimeEnv.getEnv();
  return env.VITE_GROQ_API_KEY || '';
};
import { saveQuizResult, saveStudentProgress, isSupabaseConfigured } from "../lib/supabase";

interface LearnWithAIPageProps {
  onBack: () => void;
  resourceTitle?: string;
  lessonId?: string;
  studentId?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LessonSection {
  id: number;
  title: string;
  content: string;
  examples: Array<{ title: string; icon: string; description: string }>;
  miniQuiz?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export function LearnWithAIPage({ 
  onBack, 
  resourceTitle = "Introduction to Robotics",
  lessonId = "demo-lesson",
  studentId = "demo-student" 
}: LearnWithAIPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentStep, setCurrentStep] = useState<'intro' | 'learn' | 'qa' | 'quiz' | 'complete'>('intro');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [miniQuizAnswer, setMiniQuizAnswer] = useState<number | null>(null);
  const [sectionProgress, setSectionProgress] = useState<number[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Check if API key is configured
  useEffect(() => {
    const apiKey = getGroqApiKey();
    setHasApiKey(!!(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey !== ''));
  }, []);

  const lessonSections: LessonSection[] = [
    {
      id: 1,
      title: "What is Robotics?",
      content: `**Robotics** is the science of designing, building, and using robots! 🤖

A robot is a machine that can:
- **Sense** its environment (using sensors like cameras and touch sensors)
- **Think** and make decisions (using a computer or microcontroller)
- **Act** on those decisions (using motors and actuators)

Think of it like this:
- 👀 **Sensors** = Eyes and Ears (help robot see and hear)
- 🧠 **Processor/Brain** = Thinking part (makes decisions)
- 🦾 **Actuators** = Arms and Legs (do the work)`,
      examples: [
        {
          title: "ATM Machines",
          icon: "🏧",
          description: "Robots that count money, read your card, check your account, and dispense cash automatically!"
        },
        {
          title: "Traffic Lights",
          icon: "🚦",
          description: "Smart systems that detect cars using sensors and control traffic flow by changing lights."
        },
        {
          title: "Automatic Doors",
          icon: "🚪",
          description: "Doors in malls and hospitals that sense when you're near and open automatically!"
        }
      ],
      miniQuiz: {
        question: "What are the THREE main parts of a robot?",
        options: [
          "Sensors, Processor, Actuators",
          "Screen, Keyboard, Mouse",
          "Battery, Wire, Switch",
          "Camera, Light, Speaker"
        ],
        correct: 0,
        explanation: "Correct! Every robot needs sensors to sense, a processor to think, and actuators to act!"
      }
    },
    {
      id: 2,
      title: "How Do Robots Sense the World?",
      content: `Robots use **sensors** to understand what's happening around them, just like how you use your eyes, ears, and hands!

**Common Robot Sensors:**

🔍 **Light Sensors** - Detect brightness and darkness
- Used in: Automatic street lights, phone auto-brightness

🤚 **Touch Sensors** - Feel when something touches them
- Used in: Elevator buttons, smartphone screens

📏 **Distance Sensors** - Measure how far away objects are
- Used in: Car parking sensors, automatic doors

🌡️ **Temperature Sensors** - Detect hot and cold
- Used in: Air conditioners, fridges

🎤 **Sound Sensors** - Hear sounds and voices
- Used in: Alexa, Google Home, Siri`,
      examples: [
        {
          title: "Car Parking Sensors",
          icon: "🚗",
          description: "Use ultrasonic sensors to detect how close you are to walls or other cars. Beeps faster as you get closer!"
        },
        {
          title: "Automatic Taps",
          icon: "💧",
          description: "Use infrared sensors to detect your hands and turn water on automatically. Common in Nigerian airports!"
        },
        {
          title: "Security Cameras",
          icon: "📹",
          description: "Use motion sensors to detect movement and start recording. Keeps our homes and businesses safe!"
        }
      ],
      miniQuiz: {
        question: "What sensor helps a car know it's getting close to a wall when parking?",
        options: [
          "Light sensor",
          "Distance sensor (Ultrasonic)",
          "Temperature sensor",
          "Color sensor"
        ],
        correct: 1,
        explanation: "Correct! Distance sensors (ultrasonic) measure how far away objects are - perfect for parking!"
      }
    },
    {
      id: 3,
      title: "Robot Brains - How They Think",
      content: `Just like you have a brain to think, robots have a **processor** or **microcontroller** that acts as their brain! 🧠

**What Does a Robot Brain Do?**

1. 📊 **Receives Information** from sensors
   - "The light sensor says it's dark"
   - "The touch sensor says someone pressed the button"

2. 🤔 **Makes Decisions** based on programming
   - IF it's dark, THEN turn on the light
   - IF button pressed, THEN open the door

3. 📤 **Sends Commands** to actuators
   - "Motor: Turn on now!"
   - "LED: Light up!"

**Popular Robot Brains:**

🟦 **Arduino** - Great for beginners, used in many Nigerian schools!
🍓 **Raspberry Pi** - More powerful, can run like a small computer
🔧 **Microbit** - Simple and fun for learning programming`,
      examples: [
        {
          title: "Smart Fan",
          icon: "🌀",
          description: "Temperature sensor detects heat → Brain decides it's too hot → Motor turns on the fan. Some even adjust speed!"
        },
        {
          title: "Washing Machine",
          icon: "🧺",
          description: "You select a program → Brain follows steps → Controls water, spinning, and timing automatically!"
        },
        {
          title: "Vending Machine",
          icon: "🥤",
          description: "You select drink → Brain checks if it's available → Controls motors to drop your drink → Takes your money!"
        }
      ],
      miniQuiz: {
        question: "What is the 'brain' of a robot called?",
        options: [
          "Sensor",
          "Actuator",
          "Processor/Microcontroller",
          "Battery"
        ],
        correct: 2,
        explanation: "Correct! The processor or microcontroller is the brain that makes all the decisions!"
      }
    },
    {
      id: 4,
      title: "Robot Muscles - Actuators",
      content: `**Actuators** are the parts that make robots move and do work - they're like muscles! 💪

**Types of Actuators:**

⚙️ **Motors** - Make things spin and rotate
   - DC Motors: Spin continuously (wheels, fans)
   - Servo Motors: Move to specific angles (robot arms)
   - Stepper Motors: Very precise movements (3D printers)

🔌 **Solenoids** - Push/pull movements
   - Used in: Door locks, bells

💡 **LED/Lights** - Visual outputs
   - Show status, give feedback

🔊 **Speakers** - Sound outputs
   - Alarms, voice, music

🌡️ **Heaters/Coolers** - Temperature control
   - Air conditioners, refrigerators`,
      examples: [
        {
          title: "Robot Vacuum",
          icon: "🤖",
          description: "Motors move the wheels to navigate your room, another motor spins the brush, and a pump creates suction!"
        },
        {
          title: "Printer",
          icon: "🖨️",
          description: "Stepper motors move the print head precisely, while other motors feed the paper through!"
        },
        {
          title: "Automatic Gates",
          icon: "🚧",
          description: "A strong motor opens and closes the gate when you press the remote or sensor detects your car!"
        }
      ],
      miniQuiz: {
        question: "What type of actuator would you use to make a robot's wheels move?",
        options: [
          "LED lights",
          "Speaker",
          "DC Motor",
          "Temperature sensor"
        ],
        correct: 2,
        explanation: "Perfect! DC Motors are great for making wheels spin continuously!"
      }
    },
    {
      id: 5,
      title: "Robotics in Nigeria",
      content: `Nigeria is making amazing progress in robotics! 🇳🇬✨

**Nigerian Robotics Achievements:**

🤖 **Educational Robots**
- Many schools now teaching robotics
- Robotics competitions growing
- Nigerian students winning international awards!

🏥 **Healthcare Robots**
- Robots helping in Nigerian hospitals
- Automated medicine dispensers
- Telemedicine robots for remote areas

🚜 **Agricultural Robots**
- Drones monitoring farms
- Automated irrigation systems
- Crop disease detection robots

🏭 **Industrial Robots**
- Manufacturing automation in Lagos, Kano
- Quality control systems
- Packaging and sorting robots

**Famous Nigerian Robotics Projects:**

💪 **Omeife** - Life-sized humanoid robot built in Nigeria!
🚗 **Self-driving car projects** - Universities working on autonomous vehicles
🌾 **Farm monitoring drones** - Helping Nigerian farmers increase yields`,
      examples: [
        {
          title: "School Projects",
          icon: "🎓",
          description: "Nigerian students building line-following robots, obstacle-avoiding cars, and smart home systems!"
        },
        {
          title: "Market Automation",
          icon: "🏪",
          description: "Automated payment systems, inventory tracking, and smart scales in modern Nigerian markets!"
        },
        {
          title: "Transportation",
          icon: "🚇",
          description: "Automated ticketing in Lagos BRT, smart traffic lights, and parking payment systems!"
        }
      ],
      miniQuiz: {
        question: "What is the name of Nigeria's famous life-sized humanoid robot?",
        options: [
          "Omeife",
          "Robo-Naija",
          "NaijaBot",
          "Lagos-1"
        ],
        correct: 0,
        explanation: "Excellent! Omeife is Nigeria's first life-sized humanoid robot - a proud achievement!"
      }
    }
  ];

  const finalQuizQuestions = [
    {
      question: "What are the three essential components that make up a robot?",
      options: [
        "Sensors, Processor, Actuators",
        "Screen, Keyboard, Mouse",
        "Battery, Motor, Switch",
        "Camera, Speaker, Microphone"
      ],
      correct: 0
    },
    {
      question: "Which sensor would help a robot detect when it's dark outside?",
      options: [
        "Touch sensor",
        "Light sensor",
        "Sound sensor",
        "Distance sensor"
      ],
      correct: 1
    },
    {
      question: "What does the 'brain' of a robot do?",
      options: [
        "Only stores information",
        "Only moves the robot",
        "Receives data, makes decisions, sends commands",
        "Just turns the robot on and off"
      ],
      correct: 2
    },
    {
      question: "Which actuator would you use to make a robot's wheels spin?",
      options: [
        "LED",
        "Speaker",
        "DC Motor",
        "Sensor"
      ],
      correct: 2
    },
    {
      question: "What is Nigeria's famous humanoid robot called?",
      options: [
        "NaijaBot",
        "Omeife",
        "Lagos-1",
        "RoboNG"
      ],
      correct: 1
    }
  ];

  // Load AI explanation when reaching learn step
  useEffect(() => {
    if (currentStep === 'learn' && currentSection === 0 && !aiExplanation && !isLoadingExplanation && hasApiKey) {
      loadAIExplanation();
    }
  }, [currentStep, hasApiKey]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadAIExplanation = async () => {
    setIsLoadingExplanation(true);
    try {
      const explanation = await explainConcept(resourceTitle, "JSS 3");
      setAiExplanation(explanation);
    } catch (error) {
      console.log('Using default content:', error);
      // Silent fallback to default content
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!chatInput.trim() || isLoadingChat) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoadingChat(true);

    try {
      const response = await explainConcept(
        `Student question about ${resourceTitle}, Section: ${lessonSections[currentSection].title}. Question: ${chatInput}`,
        "JSS 3"
      );
      
      const aiMessage: ChatMessage = { role: 'assistant', content: response };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.log('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error && (error.message.includes('API key') || error.message.includes('configured'))
          ? "💡 **AI Chat is currently not configured.**\n\nTo enable AI-powered answers, your teacher needs to set up the Groq API key. For now, you can:\n\n✅ Continue with the lesson\n✅ Take the quiz below\n✅ Ask your teacher directly\n\nClick 'Yes, I Understand!' to continue learning! 😊"
          : "I'm having trouble connecting. Please try again! 🙏"
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleMiniQuizAnswer = async (answerIndex: number) => {
    const currentMiniQuiz = lessonSections[currentSection].miniQuiz;
    if (!currentMiniQuiz) return;

    setMiniQuizAnswer(answerIndex);

    if (answerIndex === currentMiniQuiz.correct) {
      toast.success("Correct! 🎉 +5 XP");
      
      // Mark section as completed
      if (!sectionProgress.includes(currentSection)) {
        setSectionProgress([...sectionProgress, currentSection]);
      }
      
      // Save to Supabase if configured
      if (isSupabaseConfigured() && studentId !== 'demo-student') {
        try {
          await saveQuizResult({
            student_id: studentId,
            lesson_id: lessonId,
            quiz_type: 'mini',
            score: 1,
            total_questions: 1,
            xp_earned: 5,
            completed_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to save mini quiz result:', error);
        }
      }
      
      // Don't reset - let user see correct answer until they click Next
    } else {
      toast.error("Not quite right. Try again!");
      // Reset after wrong answer so they can try again
      setTimeout(() => setMiniQuizAnswer(null), 1500);
    }
  };

  const handleNextSection = () => {
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also scroll the main content area to top
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      if (currentSection < lessonSections.length - 1) {
        setCurrentSection(currentSection + 1);
        setMiniQuizAnswer(null);
      } else {
        setCurrentStep('qa');
      }
    }, 100);
  };

  const handlePrevSection = () => {
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also scroll the main content area to top
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      if (currentSection > 0) {
        setCurrentSection(currentSection - 1);
        setMiniQuizAnswer(null);
      }
    }, 100);
  };

  const handleAnswerSelect = async (index: number) => {
    setSelectedAnswer(index.toString());
    
    if (index === finalQuizQuestions[currentQuestion].correct) {
      setQuizScore(quizScore + 1);
      toast.success("Correct! 🎉 +10 XP");
      
      setTimeout(async () => {
        if (currentQuestion < finalQuizQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
        } else {
          // Quiz completed!
          setCurrentStep('complete');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          
          // Save final quiz results to Supabase
          if (isSupabaseConfigured() && studentId !== 'demo-student') {
            try {
              const finalScore = quizScore + 1; // +1 for current correct answer
              const totalXP = (sectionProgress.length * 5) + (finalScore * 10);
              
              await saveQuizResult({
                student_id: studentId,
                lesson_id: lessonId,
                quiz_type: 'final',
                score: finalScore,
                total_questions: finalQuizQuestions.length,
                xp_earned: finalScore * 10,
                completed_at: new Date().toISOString()
              });
              
              // Update lesson progress
              await saveStudentProgress({
                student_id: studentId,
                lesson_id: lessonId,
                status: 'completed',
                score: Math.round((finalScore / finalQuizQuestions.length) * 100),
                xp_earned: totalXP,
                completed_at: new Date().toISOString()
              });
              
              console.log('Progress saved to Supabase!');
            } catch (error) {
              console.error('Failed to save quiz results:', error);
              toast.error('Failed to save progress, but you still earned XP!');
            }
          }
        }
      }, 1500);
    } else {
      toast.error("Not quite! Try again 💪");
      setTimeout(() => setSelectedAnswer(null), 1500);
    }
  };

  const handleStartLearning = () => {
    setCurrentStep('learn');
    setCurrentSection(0);
  };

  const handleUnderstand = (understood: boolean) => {
    if (understood) {
      setCurrentStep('quiz');
      setCurrentQuestion(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      toast.success("Great! Let's test your knowledge! 🎯");
    } else {
      toast.success("No problem! Ask me any questions below 👇");
    }
  };

  const handleRetake = () => {
    setCurrentStep('learn');
    setCurrentSection(0);
    setCurrentQuestion(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setChatMessages([]);
    setSectionProgress([]);
  };

  const currentLessonSection = lessonSections[currentSection];
  const progressPercentage = ((currentSection + 1) / lessonSections.length) * 100;

  const progressValue = 
    currentStep === 'learn' ? 25 :
    currentStep === 'qa' ? 50 :
    currentStep === 'quiz' ? 75 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-[confetti_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-base font-bold truncate">Learn with AI</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{resourceTitle}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {currentStep !== 'intro' && (
            <div>
              <Progress 
                value={progressValue} 
                variant={currentStep === 'complete' ? 'success' : 'gradient'} 
                showLabel 
                className="h-3" 
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {currentStep === 'learn' && `Section ${currentSection + 1} of ${lessonSections.length}`}
                {currentStep === 'qa' && "Ask Questions & Review"}
                {currentStep === 'quiz' && "Final Assessment"}
                {currentStep === 'complete' && "Completed!"}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <ScrollArea className="h-[calc(100vh-200px)] hide-scrollbar" ref={mainScrollRef}>
          <div className="space-y-6">
            {/* Intro Step */}
            {currentStep === 'intro' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl sm:text-base font-bold mb-2">Ready to learn?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    This interactive lesson has {lessonSections.length} sections with examples and mini-quizzes!
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="rounded-2xl hover-lift text-center glass-card">
                    <CardContent className="p-6">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 text-primary" />
                      <h4 className="font-semibold mb-2">{lessonSections.length} Sections</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Step-by-step learning</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl hover-lift text-center glass-card">
                    <CardContent className="p-6">
                      <MessageCircle className="w-10 h-10 mx-auto mb-3 text-accent" />
                      <h4 className="font-semibold mb-2">Mini Quizzes</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Test as you learn</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl hover-lift text-center glass-card">
                    <CardContent className="p-6">
                      <Trophy className="w-10 h-10 mx-auto mb-3 text-success" />
                      <h4 className="font-semibold mb-2">Earn XP</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Quiz yourself and grow</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={handleStartLearning}
                  size="lg"
                  className="w-full rounded-2xl gradient-primary"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </div>
            )}

            {/* Learn Step with Sections */}
            {currentStep === 'learn' && (
              <div className="space-y-6 animate-fade-in">
                {/* Section Progress Indicator */}
                <div className="flex items-center justify-between gap-2">
                  {lessonSections.map((section, idx) => (
                    <div
                      key={section.id}
                      className={`flex-1 h-2.5 rounded-full transition-all duration-500 relative overflow-hidden ${
                        idx < currentSection
                          ? 'bg-gradient-to-r from-success to-primary shadow-md shadow-success/20'
                          : idx === currentSection
                          ? 'bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/30'
                          : 'bg-muted/50'
                      }`}
                    >
                      {idx === currentSection && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      )}
                    </div>
                  ))}
                </div>

                {/* API Key Info Banner */}
                {!hasApiKey && currentSection === 0 && (
                  <Alert className="rounded-2xl bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Learning Mode:</strong> You're viewing quality lesson content. For AI-powered personalized help, ask your teacher about Groq API.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Main Content Card */}
                <Card className="rounded-2xl bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      {currentLessonSection.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-sm sm:prose-base max-w-none">
                      <p className="whitespace-pre-line leading-relaxed">
                        {currentLessonSection.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Real-World Examples */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-base sm:text-lg">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    Real-World Examples
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                    {currentLessonSection.examples.map((example, i) => (
                      <Card key={i} className="rounded-2xl hover-lift glass-card">
                        <CardContent className="p-4 sm:p-6 text-center">
                          <div className="text-base sm:text-base mb-3">{example.icon}</div>
                          <h5 className="font-semibold mb-2 text-sm sm:text-base">{example.title}</h5>
                          <p className="text-xs sm:text-sm text-muted-foreground">{example.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Mini Quiz */}
                {currentLessonSection.miniQuiz && (
                  <Card className="rounded-2xl bg-accent/5 border-accent/20">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Quick Check! 📝
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="font-semibold">{currentLessonSection.miniQuiz.question}</p>
                      <div className="space-y-2">
                        {currentLessonSection.miniQuiz.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleMiniQuizAnswer(idx)}
                            disabled={miniQuizAnswer !== null}
                            className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                              miniQuizAnswer === idx
                                ? idx === currentLessonSection.miniQuiz!.correct
                                  ? 'border-success bg-success/10 text-success'
                                  : 'border-destructive bg-destructive/10 text-destructive'
                                : 'border-border hover:border-accent hover:bg-accent/5'
                            } ${miniQuizAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {miniQuizAnswer === currentLessonSection.miniQuiz.correct && (
                        <Alert className="bg-success/10 border-success/20">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <AlertDescription className="text-sm text-success">
                            {currentLessonSection.miniQuiz.explanation}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handlePrevSection}
                    variant="outline"
                    className="rounded-2xl"
                    disabled={currentSection === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      // Check if mini quiz exists and is answered correctly
                      if (currentLessonSection.miniQuiz && miniQuizAnswer !== currentLessonSection.miniQuiz.correct) {
                        toast.error("Please answer the quiz correctly before proceeding! 📝");
                        return;
                      }
                      handleNextSection();
                    }}
                    className="flex-1 rounded-2xl gradient-primary"
                  >
                    {currentSection === lessonSections.length - 1 ? 'Complete Section' : 'Next Section'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Q&A / Comprehension Check Step */}
            {currentStep === 'qa' && (
              <div className="space-y-6 animate-fade-in">
                {/* Good Luck / Well Done Card */}
                <Card className="rounded-2xl border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-center text-xl sm:text-base">
                        Great job! Do you understand? 🤔
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-center text-sm sm:text-base text-muted-foreground">
                        You've completed all {lessonSections.length} sections! If you have any questions, ask below. Otherwise, let's test your knowledge!
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => handleUnderstand(true)}
                          className="rounded-2xl gradient-success flex-1 sm:flex-initial"
                          size="lg"
                        >
                          <ThumbsUp className="w-5 h-5 mr-2" />
                          Yes, Ready for Final Quiz!
                        </Button>
                        <Button
                          onClick={() => handleUnderstand(false)}
                          variant="outline"
                          className="rounded-2xl flex-1 sm:flex-initial"
                          size="lg"
                        >
                          <ThumbsDown className="w-5 h-5 mr-2" />
                          I Have Questions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                {/* Chat Interface */}
                <Card className="rounded-2xl glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Ask Me Anything!
                    </CardTitle>
                    {!hasApiKey && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 AI chat requires API setup. For now, review the lessons and take the quiz!
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Chat Messages */}
                    <div 
                      ref={chatScrollRef}
                      className="h-64 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-xl"
                    >
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                          <div>
                            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Ask me any questions about {resourceTitle}!
                            </p>
                          </div>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            <div
                              className={`px-4 py-2 rounded-xl max-w-[80%] break-words ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoadingChat && (
                        <div className="flex gap-2">
                          <div className="px-4 py-2 rounded-xl bg-card">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your question..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                        className="rounded-xl flex-1"
                        disabled={isLoadingChat}
                      />
                      <Button
                        onClick={handleSendQuestion}
                        disabled={!chatInput.trim() || isLoadingChat}
                        size="icon"
                        className="rounded-xl"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep('learn');
                          setCurrentSection(0);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 rounded-2xl"
                      >
                        Review Lessons Again
                      </Button>
                      <Button
                        onClick={onBack}
                        className="flex-1 rounded-2xl gradient-primary"
                      >
                        Finish & Exit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Final Quiz Step */}
            {currentStep === 'quiz' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="outline" className="text-sm">
                    Question {currentQuestion + 1} of {finalQuizQuestions.length}
                  </Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Score: {quizScore}/{finalQuizQuestions.length}
                  </Badge>
                </div>

                <Card className="rounded-2xl border-2 border-primary/20">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-6">
                      {finalQuizQuestions[currentQuestion].question}
                    </h3>

                    <div className="space-y-3">
                      {finalQuizQuestions[currentQuestion].options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswerSelect(i)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            selectedAnswer === i.toString()
                              ? i === finalQuizQuestions[currentQuestion].correct
                                ? 'border-success bg-success/10 text-success'
                                : 'border-destructive bg-destructive/10 text-destructive'
                              : 'border-border hover:border-primary hover:bg-primary/5'
                          } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer hover-lift'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                              selectedAnswer === i.toString()
                                ? i === finalQuizQuestions[currentQuestion].correct
                                  ? 'bg-success text-white'
                                  : 'bg-destructive text-white'
                                : 'bg-muted'
                            }`}>
                              {selectedAnswer === i.toString() && i === finalQuizQuestions[currentQuestion].correct ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                String.fromCharCode(65 + i)
                              )}
                            </div>
                            <span className="text-sm sm:text-base">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('qa')}
                  className="w-full rounded-2xl"
                  disabled={selectedAnswer !== null}
                >
                  Back to Questions
                </Button>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <div className="space-y-6 animate-fade-in text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-br from-success/20 to-primary/20 rounded-full flex items-center justify-center mx-auto animate-scale-in shadow-lg shadow-success/30">
                  <Trophy className="w-12 h-12 text-success" />
                </div>

                <div>
                  <h3 className="text-base sm:text-base font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Excellent Work! 🎉
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    You scored {quizScore} out of {finalQuizQuestions.length}
                  </p>
                </div>

                {/* Modern Score Display */}
                <div className="flex justify-center">
                  <CircularScore
                    score={quizScore}
                    maxScore={finalQuizQuestions.length}
                    size="lg"
                    variant="success"
                    label="Final Score"
                  />
                </div>

                {/* XP Card */}
                <Card className="rounded-2xl glass-card border-accent/20 inline-block mx-auto hover-glow">
                  <CardContent className="p-6 sm:p-8">
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl blur-xl" />
                      
                      <div className="relative text-center">
                        <p className="text-sm text-muted-foreground mb-3">Total XP Earned</p>
                        <div className="flex items-center gap-3 justify-center mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange-500 rounded-xl flex items-center justify-center animate-bounce-gentle shadow-lg shadow-accent/30">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-base sm:text-base font-bold bg-gradient-to-r from-accent via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                            +{(sectionProgress.length * 5) + (quizScore * 10)}
                          </span>
                          <span className="text-xl text-muted-foreground">XP</span>
                        </div>
                        
                        {/* Breakdown */}
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <span className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            {sectionProgress.length} mini-quizzes
                          </span>
                          <span className="px-3 py-1 bg-success/10 rounded-full border border-success/20">
                            Final quiz
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1 rounded-2xl"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Review & Retake
                  </Button>
                  <Button
                    onClick={onBack}
                    className="flex-1 rounded-2xl gradient-primary"
                  >
                    Continue Learning
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

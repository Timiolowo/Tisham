import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { SharedLayout } from "./SharedLayout";
import { useAuth } from "../contexts/AuthContext";
import { runtimeEnv } from '../lib/runtime-env';

const getGroqApiKey = () => {
  const env = runtimeEnv.getEnv();
  return env.VITE_GROQ_API_KEY || '';
};

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
  title: string;
  mainContent: string;
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
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiContent, setAiContent] = useState<AILearningContent | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [currentTab, setCurrentTab] = useState("lesson");
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [customLearningInput, setCustomLearningInput] = useState("");

  useEffect(() => {
    const apiKey = getGroqApiKey();
    setHasApiKey(!!apiKey);
    // Load completed modules from localStorage
    const saved = localStorage.getItem('teacherCompletedModules');
    if (saved) {
      setCompletedModules(JSON.parse(saved));
    }
  }, []);

  const learningModules: LearningModule[] = [
    {
      id: 1,
      title: "Tishami-Powered Lesson Planning",
      description: "Master the art of creating engaging lesson plans using AI tools",
      duration: "2 hours",
      progress: completedModules.includes(1) ? 100 : 0,
      completed: completedModules.includes(1),
      topics: [
        "Understanding AI in Education",
        "Effective Prompt Engineering for Lessons",
        "Customizing Tishami-Generated Content",
        "Aligning Lessons with Curriculum"
      ],
      difficulty: "Beginner",
      xp: 100
    },
    {
      id: 2,
      title: "Understanding Tishami in Education",
      description: "Learn to adapt teaching methods for diverse learning needs",
      duration: "3 hours",
      progress: completedModules.includes(2) ? 100 : 0,
      completed: completedModules.includes(2),
      topics: [
        "Understanding Learning Styles",
        "Creating Adaptive Assessments",
        "Using Tishami for Personalization",
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
        "Using Tishami for Auto-Grading",
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

      if (hasApiKey) {
        // Import the learning pathway function from groq
        const { generateLearningPathwayContent } = await import('../lib/groq');
        const response = await generateLearningPathwayContent(topic, module.title);
        
        try {
          // Try to find JSON in the response
          let jsonString = response.trim();
          
          // Look for JSON object in the response
          const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          }
          
          // Remove any markdown code blocks
          jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Remove trailing commas before closing braces/brackets
          jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
          
          // Remove control characters but preserve newlines in strings
          jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          
          const parsed = JSON.parse(jsonString);
          setAiContent(parsed);
        } catch (parseError) {
          // Fallback content extraction
          setAiContent(extractContentFromText(response, topic));
        }
      } else {
        setAiContent(createDemoContent(topic));
      }
      
      toast.success("Tishami-generated learning content ready!");
    } catch (error) {
      setAiContent(createDemoContent(module.topics[currentTopicIndex]));
      toast.error("Content could not be extracted from Tishami response.");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const extractContentFromText = (text: string, topic: string): AILearningContent => {
    // Try to extract meaningful content from the AI response text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Extract potential title (first meaningful line or topic-based)
    let extractedTitle = `Understanding ${topic}`;
    if (lines.length > 0 && lines[0].length > 10 && lines[0].length < 100) {
      extractedTitle = lines[0].replace(/^#+\s*/, '').trim();
    }
    
    // Extract main content (first substantial paragraph)
    let extractedContent = `This comprehensive module on ${topic} provides essential knowledge and practical strategies for Nigerian educators. The content has been carefully designed to address the unique challenges and opportunities in Nigerian classrooms, offering evidence-based approaches that can be implemented regardless of available resources.`;
    
    // Look for content in the text
    const contentLines = lines.filter(line => 
      line.length > 50 && 
      !line.startsWith('#') && 
      !line.startsWith('*') && 
      !line.startsWith('-') &&
      !line.includes('question') &&
      !line.includes('option')
    );
    
    if (contentLines.length > 0) {
      extractedContent = contentLines[0].trim();
    }
    
    // Get topic-specific content as fallback
    const topicContent = getTopicSpecificContent(topic);
    
    return {
      title: extractedTitle,
      mainContent: extractedContent,
      keyPoints: topicContent.keyPoints,
      practicalApplications: topicContent.practicalApplications,
      examples: topicContent.examples,
      quiz: topicContent.quiz
    };
  };

  const createDemoContent = (topic: string): AILearningContent => {
    // Get topic-specific content based on the topic name
    const topicContent = getTopicSpecificContent(topic);
    
    return {
      title: topicContent.title,
      mainContent: topicContent.mainContent,
      keyPoints: topicContent.keyPoints,
      practicalApplications: topicContent.practicalApplications,
      examples: topicContent.examples,
      quiz: topicContent.quiz
    };
  };

  const getTopicSpecificContent = (topic: string) => {
    const topicLower = topic.toLowerCase();
    
    // AI in Education topics
    if (topicLower.includes('ai') || topicLower.includes('artificial intelligence')) {
      return {
        title: "AI-Powered Teaching: Transforming Nigerian Classrooms",
        mainContent: "Artificial Intelligence in education represents a revolutionary approach to personalized learning that can bridge educational gaps in Nigeria. AI tools like Tishami can help teachers create adaptive lesson plans, generate assessments, and provide instant feedback to students. In resource-constrained Nigerian schools, AI becomes a powerful equalizer, offering high-quality educational content and support regardless of physical infrastructure limitations. Teachers can leverage AI to differentiate instruction, identify learning gaps, and provide targeted interventions that would be impossible to deliver manually in large classrooms.",
        keyPoints: [
          "AI can personalize learning experiences for each student's unique needs and pace",
          "Automated content generation saves teachers hours of preparation time weekly",
          "AI-powered assessment tools provide instant feedback and learning analytics",
          "Natural language processing enables students to ask questions in their preferred language",
          "Machine learning algorithms can predict student performance and suggest interventions"
        ],
        practicalApplications: [
          "Lesson Planning: Use AI to generate curriculum-aligned lesson plans with activities, resources, and assessments tailored to your class level and available materials",
          "Content Creation: Generate worksheets, reading passages, and practice problems in multiple difficulty levels to support differentiated instruction",
          "Assessment Design: Create formative and summative assessments with automatic grading capabilities and detailed performance analytics",
          "Student Support: Implement AI tutoring systems that provide 24/7 homework help and concept explanations in local languages"
        ],
        examples: [
          "A Lagos primary school teacher used AI to generate 50 different math word problems at varying difficulty levels, reducing preparation time from 3 hours to 30 minutes while improving student engagement by 40%",
          "In Kano, a secondary school implemented AI-powered reading comprehension tools that helped 85% of students improve their English proficiency scores within one term",
          "A rural school in Enugu used AI-generated science experiments with locally available materials, increasing student participation in STEM subjects by 60%"
        ],
        quiz: [
          {
            question: "What is the primary benefit of using AI in Nigerian classrooms?",
            options: [
              "Reducing teacher workload while improving learning outcomes",
              "Replacing human teachers entirely",
              "Making education more expensive",
              "Only working in urban schools"
            ],
            correct: 0
          },
          {
            question: "How can AI help address resource constraints in Nigerian schools?",
            options: [
              "By generating high-quality content regardless of physical resources",
              "By requiring expensive equipment",
              "By only working with internet connection",
              "By replacing all traditional teaching methods"
            ],
            correct: 0
          }
        ]
      };
    }
    
    // Learning Styles topics
    if (topicLower.includes('learning styles') || topicLower.includes('adaptive')) {
      return {
        title: "Adaptive Learning: Meeting Every Student's Needs",
        mainContent: "Understanding and adapting to different learning styles is crucial for effective teaching in Nigeria's diverse classrooms. Students come from various cultural backgrounds, speak different languages at home, and have unique ways of processing information. By recognizing visual, auditory, kinesthetic, and reading/writing preferences, teachers can create inclusive learning environments that engage all students. This approach is particularly important in Nigerian schools where class sizes are often large and resources limited, making personalized attention challenging but not impossible.",
        keyPoints: [
          "Visual learners benefit from diagrams, charts, and visual representations of concepts",
          "Auditory learners excel with discussions, music, and verbal explanations",
          "Kinesthetic learners need hands-on activities and movement-based learning",
          "Reading/writing learners prefer text-based materials and note-taking",
          "Most students are multimodal and benefit from varied instructional approaches"
        ],
        practicalApplications: [
          "Visual Strategies: Create mind maps, use colored charts, and incorporate videos or images to explain complex concepts like photosynthesis or historical events",
          "Auditory Techniques: Implement group discussions, use storytelling for history lessons, and incorporate music or rhymes for memorization tasks",
          "Kinesthetic Activities: Design hands-on experiments, use role-playing for literature, and create movement-based games for math and science concepts",
          "Reading/Writing Methods: Provide structured note-taking templates, use journaling for reflection, and create reading comprehension activities with guided questions"
        ],
        examples: [
          "A mathematics teacher in Abuja used visual aids and kinesthetic activities to teach fractions, resulting in 90% of students understanding the concept compared to 60% with traditional methods",
          "An English teacher in Port Harcourt incorporated storytelling and role-playing for literature lessons, increasing student participation from 40% to 85%",
          "A science teacher in Ibadan used hands-on experiments with locally available materials, improving test scores by 35% and reducing dropout rates in science subjects"
        ],
        quiz: [
          {
            question: "What percentage of students typically benefit from multimodal learning approaches?",
            options: [
              "Most students (80-90%)",
              "Only visual learners (20%)",
              "Only kinesthetic learners (15%)",
              "Only auditory learners (25%)"
            ],
            correct: 0
          },
          {
            question: "Why is understanding learning styles particularly important in Nigerian classrooms?",
            options: [
              "Large class sizes require varied approaches to reach all students",
              "Students all learn the same way",
              "It's only important in private schools",
              "Nigerian students don't have different learning preferences"
            ],
            correct: 0
          }
        ]
      };
    }
    
    // Assessment topics
    if (topicLower.includes('assessment') || topicLower.includes('evaluation')) {
      return {
        title: "Smart Assessment: Measuring What Matters",
        mainContent: "Effective assessment goes beyond traditional tests to provide meaningful insights into student learning and guide instructional decisions. In Nigerian education, where high-stakes examinations often dominate, teachers must balance preparing students for formal assessments while using formative evaluation to improve learning. Modern assessment strategies include authentic assessments, peer evaluation, self-assessment, and technology-enhanced tools that provide immediate feedback. These approaches help students understand their progress, identify areas for improvement, and develop metacognitive skills essential for lifelong learning.",
        keyPoints: [
          "Formative assessment provides ongoing feedback to improve learning during instruction",
          "Summative assessment evaluates learning at the end of a unit or course",
          "Authentic assessment connects learning to real-world applications and contexts",
          "Peer and self-assessment develop critical thinking and metacognitive skills",
          "Technology-enhanced assessment can provide immediate feedback and detailed analytics"
        ],
        practicalApplications: [
          "Formative Techniques: Use exit tickets, think-pair-share activities, and quick quizzes to gauge understanding and adjust instruction in real-time",
          "Authentic Assessments: Design projects that mirror real-world problems, such as creating business plans for economics or conducting environmental surveys for science",
          "Peer Evaluation: Implement structured peer review processes for writing assignments and group projects to develop critical thinking skills",
          "Digital Tools: Use online quizzes with immediate feedback, digital portfolios, and learning analytics to track progress and identify learning gaps"
        ],
        examples: [
          "A Lagos secondary school implemented weekly peer assessment in English composition, resulting in 40% improvement in writing quality and increased student confidence",
          "In Kaduna, a mathematics teacher used authentic assessment through market research projects, improving student engagement and real-world application of statistical concepts by 60%",
          "A science teacher in Benin used digital portfolios to track student progress, enabling early intervention that reduced failure rates from 25% to 8%"
        ],
        quiz: [
          {
            question: "What is the primary purpose of formative assessment?",
            options: [
              "To provide ongoing feedback and improve learning during instruction",
              "To assign final grades to students",
              "To compare students with each other",
              "To prepare students for standardized tests only"
            ],
            correct: 0
          },
          {
            question: "How can authentic assessment benefit Nigerian students?",
            options: [
              "By connecting learning to real-world applications and local contexts",
              "By making tests easier to pass",
              "By reducing the need for studying",
              "By eliminating the need for traditional tests"
            ],
            correct: 0
          }
        ]
      };
    }
    
    // Classroom Management topics
    if (topicLower.includes('classroom management') || topicLower.includes('behavior')) {
      return {
        title: "Positive Classroom Management: Creating Learning Communities",
        mainContent: "Effective classroom management in Nigerian schools requires understanding cultural contexts, building positive relationships, and establishing clear expectations that promote learning. With large class sizes and diverse student backgrounds, teachers must create inclusive environments where all students feel valued and motivated to learn. Positive behavior support, restorative practices, and student-centered approaches help build classroom communities where learning thrives. This is especially important in Nigeria where respect for authority is culturally valued, but student engagement and participation are equally crucial for academic success.",
        keyPoints: [
          "Positive relationships between teachers and students form the foundation of effective classroom management",
          "Clear, consistent expectations help students understand boundaries and feel secure",
          "Preventive strategies reduce behavioral issues before they occur",
          "Restorative approaches focus on repairing harm and rebuilding relationships",
          "Student voice and choice increase engagement and reduce disruptive behavior"
        ],
        practicalApplications: [
          "Relationship Building: Greet students individually, learn about their interests and backgrounds, and show genuine care for their wellbeing and success",
          "Expectation Setting: Collaboratively establish classroom rules, create visual reminders, and consistently reinforce positive behaviors with specific praise",
          "Preventive Strategies: Use engaging activities, provide clear instructions, and maintain smooth transitions to minimize opportunities for disruption",
          "Restorative Practices: Implement class meetings, peer mediation, and reflection activities to address conflicts and build community"
        ],
        examples: [
          "A primary school teacher in Lagos reduced behavioral incidents by 70% after implementing daily morning meetings and student-led rule creation",
          "In Kano, a secondary school teacher used restorative circles to address conflicts, resulting in 85% reduction in disciplinary referrals and improved student relationships",
          "A teacher in Enugu implemented student choice in learning activities, increasing engagement by 60% and reducing classroom disruptions by 50%"
        ],
        quiz: [
          {
            question: "What is the most important foundation for effective classroom management?",
            options: [
              "Positive relationships between teachers and students",
              "Strict discipline and punishment",
              "Large class sizes",
              "Expensive classroom technology"
            ],
            correct: 0
          },
          {
            question: "How can restorative practices benefit Nigerian classrooms?",
            options: [
              "By focusing on repairing relationships and building community",
              "By making punishment more severe",
              "By eliminating all classroom rules",
              "By only working in small classes"
            ],
            correct: 0
          }
        ]
      };
    }
    
    // Gamification topics
    if (topicLower.includes('gamification') || topicLower.includes('game')) {
      return {
        title: "Gamification: Making Learning Irresistible",
        mainContent: "Gamification in education uses game design elements to make learning more engaging and motivating for students. In Nigerian classrooms, where student engagement can be challenging due to large class sizes and limited resources, gamification offers creative solutions to increase participation and improve learning outcomes. By incorporating points, badges, leaderboards, challenges, and storytelling into educational content, teachers can tap into students' natural desire for achievement, competition, and social interaction. This approach is particularly effective for subjects that students typically find difficult or boring.",
        keyPoints: [
          "Points and badges provide immediate feedback and recognition for student achievements",
          "Leaderboards create healthy competition and motivate students to improve their performance",
          "Challenges and quests make learning feel like an adventure rather than a chore",
          "Storytelling elements help students connect emotionally with content and remember information better",
          "Collaborative gaming elements promote teamwork and peer learning"
        ],
        practicalApplications: [
          "Point Systems: Award points for completed assignments, participation, and improvement, with bonus points for helping classmates or showing creativity",
          "Badge Collections: Create subject-specific badges (Math Master, Science Explorer, Writing Wizard) that students can earn and display proudly",
          "Class Challenges: Design weekly or monthly challenges that require students to apply knowledge in creative ways, such as creating presentations or solving real-world problems",
          "Story-Based Learning: Transform lessons into adventures where students are heroes solving problems, exploring new worlds, or helping characters achieve goals"
        ],
        examples: [
          "A mathematics teacher in Abuja implemented a 'Math Quest' system where students earned points and badges for solving problems, resulting in 80% increase in homework completion and 45% improvement in test scores",
          "In Port Harcourt, an English teacher used storytelling gamification for literature lessons, with students as characters in the stories, leading to 90% class participation and significantly improved comprehension",
          "A science teacher in Ibadan created a 'Science Explorer' badge system with challenges using local materials, increasing student interest in STEM subjects by 70%"
        ],
        quiz: [
          {
            question: "What is the primary benefit of gamification in education?",
            options: [
              "Increasing student engagement and motivation to learn",
              "Making learning easier without effort",
              "Replacing traditional teaching methods entirely",
              "Only working for students who like video games"
            ],
            correct: 0
          },
          {
            question: "How can gamification help address engagement challenges in Nigerian classrooms?",
            options: [
              "By making learning feel like play and adventure",
              "By eliminating the need for discipline",
              "By only working in small classes",
              "By making all students get the same grades"
            ],
            correct: 0
          }
        ]
      };
    }
    
    // Nigerian Curriculum topics
    if (topicLower.includes('nigerian') || topicLower.includes('curriculum') || topicLower.includes('cultural')) {
      return {
        title: "Nigerian Education: Honoring Heritage, Embracing Innovation",
        mainContent: "Integrating Nigerian cultural values, local contexts, and national educational goals creates more meaningful and relevant learning experiences for students. The Nigerian education system, with its rich cultural diversity and unique challenges, requires teachers to balance traditional values with modern educational approaches. By incorporating local examples, cultural references, and community contexts into lessons, teachers can help students see the relevance of their education to their daily lives and future aspirations. This approach also helps preserve cultural heritage while preparing students for a globalized world.",
        keyPoints: [
          "Cultural integration helps students connect learning to their personal experiences and community values",
          "Local examples and contexts make abstract concepts more concrete and memorable",
          "Respect for traditional values while embracing innovation creates balanced educational approaches",
          "Community involvement in education strengthens the connection between school and society",
          "National curriculum goals can be achieved through culturally relevant teaching methods"
        ],
        practicalApplications: [
          "Local Examples: Use Nigerian businesses, historical events, and cultural practices to illustrate concepts in economics, history, and social studies",
          "Cultural Integration: Incorporate traditional stories, proverbs, and values into lessons while teaching modern skills and knowledge",
          "Community Projects: Design learning activities that involve local community members, businesses, and organizations to solve real problems",
          "Language Integration: Use students' home languages alongside English to explain difficult concepts and ensure understanding"
        ],
        examples: [
          "A history teacher in Lagos used local market traders' experiences to teach economic concepts, resulting in 85% student engagement and improved understanding of supply and demand",
          "In Kano, a science teacher incorporated traditional farming methods with modern agricultural techniques, helping students see the value of both approaches and improving science scores by 40%",
          "A literature teacher in Enugu used Nigerian folktales alongside international literature, increasing student interest in reading by 60% and improving cultural pride"
        ],
        quiz: [
          {
            question: "Why is cultural integration important in Nigerian education?",
            options: [
              "It helps students connect learning to their personal experiences and values",
              "It makes education more expensive",
              "It only works in rural areas",
              "It prevents students from learning modern skills"
            ],
            correct: 0
          },
          {
            question: "How can teachers balance traditional values with modern education?",
            options: [
              "By incorporating cultural contexts while teaching contemporary skills and knowledge",
              "By choosing only traditional methods",
              "By avoiding all modern approaches",
              "By teaching only in local languages"
            ],
            correct: 0
          }
        ]
      };
    }
    
    // Default fallback for other topics
    return {
      title: `Mastering ${topic}: A Comprehensive Guide`,
      mainContent: `${topic} represents a fundamental aspect of effective teaching that can transform your classroom and improve student outcomes. In the Nigerian educational context, mastering this concept becomes even more crucial as we work to provide quality education across diverse settings and resource levels. This comprehensive guide will provide you with practical strategies, evidence-based approaches, and real-world applications that you can implement immediately in your teaching practice. Whether you're working in a well-resourced urban school or a rural classroom with limited materials, these principles and techniques will help you create engaging, effective learning experiences for all your students.`,
      keyPoints: [
        `Understand the core principles and theoretical foundations of ${topic}`,
        "Apply evidence-based strategies that have proven successful in diverse educational settings",
        "Adapt methods and techniques to work effectively in Nigerian classroom contexts",
        "Measure and evaluate the impact of your implementation on student learning outcomes",
        "Collaborate with colleagues and share successes to build a community of practice"
      ],
      practicalApplications: [
        "Daily Implementation: Integrate core concepts into your regular lesson planning and teaching routines for consistent application",
        "Student Engagement: Use specific strategies to increase student participation, motivation, and active learning in your classroom",
        "Assessment Integration: Create and implement evaluation tools that accurately measure student understanding and progress",
        "Professional Development: Document your learning journey, reflect on improvements, and share insights with fellow educators"
      ],
      examples: [
        `A primary school teacher in Lagos successfully implemented ${topic} strategies, resulting in 40% improvement in student engagement and 25% increase in test scores within one academic term`,
        `In Kano, a secondary school teacher adapted ${topic} methods for large class sizes, reducing behavioral issues by 60% while maintaining high academic standards`,
        `A rural school teacher in Enugu used ${topic} principles with limited resources, creating innovative solutions that improved student attendance by 35% and parent satisfaction by 80%`
      ],
      quiz: [
        {
          question: `What is the primary goal when implementing ${topic} in Nigerian classrooms?`,
          options: [
            "Improve student learning outcomes and engagement",
            "Impress school administrators with new methods",
            "Use expensive technology and resources",
            "Follow international trends without adaptation"
          ],
          correct: 0
        },
        {
          question: `How should teachers adapt ${topic} for resource-constrained settings?`,
          options: [
            "Focus on core principles and adapt methods to available resources",
            "Abandon the approach entirely due to limitations",
            "Only implement in well-equipped schools",
            "Wait for more funding before attempting implementation"
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
      if (selectedModule) {
        generateAIContent(selectedModule);
        setCurrentTab("lesson");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // If on first topic, go back to main learning pathway page
      setSelectedModule(null);
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

  const generateCustomLearning = async () => {
    if (!customLearningInput.trim()) {
      toast.error("Please enter what you'd like to learn about");
      return;
    }

    if (!hasApiKey) {
      toast.error("API key required for custom learning generation");
      return;
    }

    setIsGeneratingContent(true);
    setAiContent(null);
    
    try {
      // Create a custom module for the user's input
      const customModule: LearningModule = {
        id: 999,
        title: "Custom Learning",
        description: "Your personalized learning experience",
        duration: "1 hour",
        progress: 0,
        completed: false,
        topics: [customLearningInput, "Key Concepts and Principles", "Practical Applications", "Real-World Examples"],
        difficulty: "Beginner",
        xp: 100
      };

      setSelectedModule(customModule);
      setCurrentTopicIndex(0);
      setQuizAnswers({});
      setCurrentTab("lesson");

      // Generate content for the custom topic
      const { generateLearningPathwayContent } = await import('../lib/groq');
      const response = await generateLearningPathwayContent(customLearningInput, "Custom Learning");
      
      try {
        // Try to find JSON in the response
        let jsonString = response.trim();
        
        // Look for JSON object in the response
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
        
        // Remove any markdown code blocks
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Remove trailing commas before closing braces/brackets
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
        
        // Remove control characters but preserve newlines in strings
        jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        const parsed = JSON.parse(jsonString);
        setAiContent(parsed);
      } catch (parseError) {
        // Fallback content extraction
        setAiContent(extractContentFromText(response, customLearningInput));
      }
      
      toast.success("Tishami-generated learning content ready!");
    } catch (error) {
      setAiContent(createDemoContent(customLearningInput));
      toast.error("Content could not be extracted from Tishami response.");
    } finally {
      setIsGeneratingContent(false);
    }
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
    const content = (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Content */}
        <main className="max-w-5xl mx-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Current Topic */}
              <Card className="rounded-2xl glass-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg">{aiContent?.title || selectedModule.topics[currentTopicIndex]}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Powered by Tishami</CardDescription>
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
                    Tishami is creating personalized content for you
                    </p>
                  </CardContent>
                </Card>
              ) : aiContent ? (
              <div className="space-y-6">
                    {/* Main Content */}
                    <Card className="rounded-2xl glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-accent" />
                          Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {aiContent.mainContent}
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

                  {/* Quiz Questions - Only show on last topic */}
                  {currentTopicIndex === selectedModule.topics.length - 1 && (
                    <Card className="rounded-2xl glass-card border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          Knowledge Check
                        </CardTitle>
                        <CardDescription>
                          Answer all questions correctly to complete this module
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {aiContent.quiz.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-3">
                          <p className="font-semibold text-xs sm:text-sm break-words">
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
                                  className={`justify-start text-left h-auto p-2 sm:p-3 rounded-xl ${
                                      showResult
                                        ? isCorrect
                                          ? 'border-success bg-success/10 text-success'
                                          : 'border-destructive bg-destructive/10 text-destructive'
                                        : ''
                                    }`}
                                  >
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        showResult
                                          ? isCorrect
                                            ? 'bg-success text-white'
                                            : 'bg-destructive text-white'
                                          : 'bg-muted'
                                      }`}>
                                        {showResult && isCorrect ? (
                                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                        ) : (
                                          <span className="text-xs font-semibold">
                                            {String.fromCharCode(65 + oIdx)}
                                          </span>
                                        )}
                                      </div>
                                    <span className="text-xs sm:text-sm flex-1 break-words">{opt}</span>
                                    </div>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
              </div>
              ) : null}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousTopic}
                  className="flex-1 rounded-2xl"
                >
                {currentTopicIndex === 0 ? 'Back to Modules' : 'Previous Topic'}
                </Button>
                {currentTopicIndex === selectedModule.topics.length - 1 ? (
                  <Button
                    onClick={handleCompleteModule}
                    className="flex-1 rounded-2xl gradient-success text-white hover-lift hover-glow"
                  >
                    Complete Module
                    <Trophy className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextTopic}
                    className="flex-1 rounded-2xl gradient-primary text-white hover-lift hover-glow"
                  >
                    Next Topic
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
        </main>
      </div>
    );

  return (
      <SharedLayout 
        onNavigate={onNavigate || (() => {})}
        userRole="teacher"
        title={selectedModule.title}
        subtitle={`Topic ${currentTopicIndex + 1} of ${selectedModule.topics.length}`}
        hideHeaderIcons={true}
        activeMenu="pathway"
        progressBar={
          <div className="flex items-center gap-2 mt-2">
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
        }
        children={content}
      />
    );
  }

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold">{completedModules.length}/{learningModules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl glass-card hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold">{totalXPEarned}</p>
                  <p className="text-xs text-muted-foreground">Total XP Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Ready Card - Hidden on mobile */}
          <Card className="rounded-2xl glass-card hover-lift hidden sm:block">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold">{allModulesCompleted ? 'Yes!' : 'Not Yet'}</p>
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
                    <h3 className="font-bold text-lg">Congratulations!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've completed all modules! Download your certificate now.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => onNavigate?.('certificate')}
                  className="rounded-2xl gradient-success text-white hover-lift hover-glow"
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
                  <h3 className="font-semibold mb-2">Tishami-Powered Learning Available!</h3>
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

        {/* Custom Learning Section */}
        <Card className="rounded-2xl glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Custom Learning
            </CardTitle>
            <CardDescription>
              Tell Tishami what you'd like to learn about and get personalized content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <textarea
                  placeholder="What would you like to learn about?"
                  className="w-full min-h-[80px] sm:min-h-[100px] p-3 rounded-xl border border-input bg-background text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={customLearningInput}
                  onChange={(e) => setCustomLearningInput(e.target.value)}
                />
              </div>
              <Button 
                onClick={generateCustomLearning}
                disabled={!customLearningInput.trim() || !hasApiKey}
                className="sm:w-auto w-full rounded-xl gradient-primary text-white hover-lift hover-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
            {!hasApiKey && (
              <p className="text-xs text-muted-foreground mt-2">
                Add your Groq API key in Settings to use custom learning
              </p>
            )}
          </CardContent>
        </Card>

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
                    <Progress value={100} />
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
                    className="rounded-xl gradient-primary text-white hover-lift hover-glow"
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

  return (
    <SharedLayout 
      onNavigate={onNavigate || (() => {})}
      userRole="teacher"
      title="Learning Pathway"
      subtitle="Learn with Tishami"
      hideHeaderIcons={true}
      activeMenu="pathway"
      children={content}
    />
  );
}

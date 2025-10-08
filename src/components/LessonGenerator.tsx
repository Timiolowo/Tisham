import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Sparkles, ChevronDown, Download, Languages, BookOpen, Loader2 } from "lucide-react";
import type { LessonPlan } from "../App";
import { saveLesson, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { SharedLayout } from "./SharedLayout";
import { generateLessonPlan } from "../lib/groq";
import { toast } from "sonner";

interface LessonGeneratorProps {
  onNavigate: (page: any, role?: any) => void;
  onSave: (lesson: LessonPlan) => void;
}

export function LessonGenerator({ onNavigate, onSave }: LessonGeneratorProps) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [topic, setTopic] = useState("Introduction to Robotics");
  const [subject, setSubject] = useState("Computer Science");
  const [classLevel, setClassLevel] = useState("JSS 3");
  const [duration, setDuration] = useState(40);
  const [language, setLanguage] = useState("english");
  const [resourceLevel, setResourceLevel] = useState("medium");
  
  const [lessonPlanData, setLessonPlanData] = useState<LessonPlan>({
    topic: topic,
    subject: subject,
    class: classLevel,
    objectives: [
      "Understand the basic concepts of robotics and automation",
      "Identify real-world applications of robotics in Nigeria",
      "Name the basic components of a robot"
    ],
    materials: [
      "Computer or tablet with internet access",
      "Projector or smart board",
      "Robot demonstration videos",
      "Worksheet with robot images",
      "Simple robot kit (if available)"
    ],
    lessonSteps: [
      { time: "5 minutes", activity: "Introduction", description: "Show robot videos and ask students what they know about robots" },
      { time: "15 minutes", activity: "Direct Instruction", description: "Explain what robots are and their basic components" },
      { time: "10 minutes", activity: "Guided Practice", description: "Students identify robots in different scenarios" },
      { time: "8 minutes", activity: "Independent Practice", description: "Students complete worksheet activities" },
      { time: "2 minutes", activity: "Assessment", description: "Quick quiz on robot concepts" }
    ],
    homework: "Research and write about one robot used in Nigeria (e.g., traffic control, manufacturing)",
    localExamples: [
      "Traffic lights in major cities",
      "ATM machines",
      "Factory robots in Dangote Cement plants"
    ]
  });

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      return;
    }

    const lessonHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${topic} - Lesson Plan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #3B82F6;
              border-bottom: 3px solid #3B82F6;
              padding-bottom: 10px;
            }
            h2 {
              color: #1E293B;
              margin-top: 30px;
              border-left: 4px solid #3B82F6;
              padding-left: 10px;
            }
            .meta {
              color: #64748B;
              margin-bottom: 30px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin: 10px 0;
            }
            .lesson-step {
              margin: 20px 0;
              padding: 15px;
              border-left: 4px solid #8B5CF6;
              background: #F8FAFC;
              page-break-inside: avoid;
            }
            .step-time {
              color: #8B5CF6;
              font-weight: bold;
            }
            .step-activity {
              color: #1E293B;
              font-weight: bold;
              margin: 5px 0;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${topic}</h1>
          <div class="meta">
            <strong>Subject:</strong> ${subject} | 
            <strong>Class:</strong> ${classLevel}
          </div>

          <h2>📚 Learning Objectives</h2>
          <ul>
            ${lessonPlanData.objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>

          <h2>🛠️ Materials Needed</h2>
          <ul>
            ${lessonPlanData.materials.map(mat => `<li>${mat}</li>`).join('')}
          </ul>

          <h2>👩‍🏫 Lesson Steps</h2>
          ${lessonPlanData.lessonSteps.map(step => `
            <div class="lesson-step">
              <div class="step-time">⏰ ${step.time}</div>
              <div class="step-activity">${step.activity}</div>
              <div>${step.description}</div>
            </div>
          `).join('')}

          <h2>📝 Homework</h2>
          <p>${lessonPlanData.homework}</p>

          <h2>🇳🇬 Local Examples</h2>
          <ul>
            ${lessonPlanData.localExamples.map(ex => `<li>${ex}</li>`).join('')}
          </ul>

          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
              Print or Save as PDF
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(lessonHTML);
    printWindow.document.close();
    
    toast.success("PDF preview opened! Use your browser's print dialog to save as PDF");
  };


  const getAgeAppropriateHomework = (classLevel: string) => {
    if (classLevel.includes('JSS 1') || classLevel.includes('JSS 2')) {
      return "Draw a picture of a robot and write 2 sentences about what it can do";
    } else if (classLevel.includes('JSS 3')) {
      return "Find one example of a robot or machine in your home or school and write a short paragraph about it";
    } else {
      return "Research and write a short essay on a real-world application of robotics in Nigeria";
    }
  };

  const getAgeAppropriateExamples = (classLevel: string) => {
    if (classLevel.includes('JSS 1') || classLevel.includes('JSS 2')) {
      return [
        "Traffic lights in your neighborhood",
        "ATM machines at the bank",
        "Washing machines at home"
      ];
    } else if (classLevel.includes('JSS 3')) {
      return [
        "Traffic lights in Lagos",
        "ATM machines",
        "Factory machines in local industries"
      ];
    } else {
      return [
        "Traffic lights in Lagos",
        "ATM machines",
        "Factory robots in Dangote Cement plants"
      ];
    }
  };

  const parseAIContent = (content: string, lessonDuration: number = 40) => {
    // Parse the AI-generated content into structured format
    const lines = content.split('\n').filter(line => line.trim());
    
    let objectives: string[] = [];
    let materials: string[] = [];
    let lessonSteps: { time: string; activity: string; description: string }[] = [];
    let homework = '';
    let localExamples: string[] = [];
    
    let currentSection = '';
    
    // First pass: Look for hardcoded step names even without STEP_X format
    const hardcodedSteps = [
      'STEP_1_INTRODUCTION:',
      'STEP_2_DIRECT_INSTRUCTION:', 
      'STEP_3_GUIDED_PRACTICE:',
      'STEP_4_INDEPENDENT_PRACTICE:',
      'STEP_5_ASSESSMENT:'
    ];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // More precise section detection - only look for section headers
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const sectionText = trimmedLine.replace(/\*\*/g, '').toUpperCase();
        
        if (sectionText.includes('LEARNING OBJECTIVES') || sectionText.includes('OBJECTIVES')) {
          currentSection = 'objectives';
          continue;
        } else if (sectionText.includes('MATERIALS') || sectionText.includes('RESOURCES')) {
          currentSection = 'materials';
          continue;
        } else if (sectionText.includes('LESSON STEPS') || sectionText.includes('STEPS') || sectionText.includes('ACTIVITIES')) {
          currentSection = 'steps';
          continue;
        } else if (sectionText.includes('HOMEWORK') || sectionText.includes('ASSIGNMENT')) {
          currentSection = 'homework';
          continue;
        } else if (sectionText.includes('LOCAL EXAMPLES') || sectionText.includes('EXAMPLES')) {
          currentSection = 'examples';
          continue;
        }
      }
      
      // Handle different bullet point formats and lesson steps
      if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/) || 
          (currentSection === 'steps' && (trimmedLine.includes('minutes') || trimmedLine.startsWith('STEP_'))) ||
          trimmedLine.startsWith('STEP_')) {
        const item = trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '').trim();
        
        if (currentSection === 'objectives' && item) {
          objectives.push(item);
        } else if (currentSection === 'materials' && item) {
          materials.push(item);
        } else if (currentSection === 'examples' && item) {
          // Skip STEP_ lines in examples section - they're not actual lesson steps
          if (item.startsWith('STEP_') || hardcodedSteps.some(step => item.includes(step))) {
            continue;
          }
          localExamples.push(item);
        } else if (currentSection === 'steps' && (item.startsWith('STEP_') || hardcodedSteps.some(step => item.includes(step)))) {
          // Handle STEP format: "STEP_1_INTRODUCTION: 4 minutes - Description"
          if (item.startsWith('STEP_') || hardcodedSteps.some(step => item.includes(step))) {
            // Try multiple regex patterns for flexibility
            const stepMatch = item.match(/^STEP_(\d+)_([^:]+):\s*(\d+)\s*minutes?\s*-\s*(.+)$/i) ||
                             item.match(/STEP_(\d+)_([^:]+):\s*(\d+)\s*minutes?\s*-\s*(.+)/i) ||
                             item.match(/STEP_(\d+)_([^:]+):\s*(\d+)\s*minutes?\s*(.+)/i);
            
            if (stepMatch) {
              // Hardcoded step names for direct matching
              const stepNumber = stepMatch[1]; // First capture group is the step number
              const stepNames = {
                '1': 'Introduction',
                '2': 'Direct Instruction', 
                '3': 'Guided Practice',
                '4': 'Independent Practice',
                '5': 'Assessment'
              };
              const activity = stepNames[stepNumber as keyof typeof stepNames] || stepMatch[2]?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              const time = `${stepMatch[3]} minutes`; // Third capture group is the time
              const description = (stepMatch[4] || stepMatch[3] || '').trim(); // Fourth capture group is the description
              lessonSteps.push({
                time,
                activity,
                description
              });
            }
          } else {
            // Handle old format: "Introduction (4 minutes) - Description"
            const timeMatch = item.match(/\((\d+)\s*minutes?\)/i);
            const time = timeMatch ? `${timeMatch[1]} minutes` : '5 minutes';
            
            const activityMatch = item.match(/^([^-]+?)\s*\([^)]*\)\s*-\s*(.+)$/);
            if (activityMatch) {
              const activity = activityMatch[1].trim();
              const description = activityMatch[2].trim();
              lessonSteps.push({
                time,
                activity,
                description
              });
            } else {
              // Fallback for different formats
              const activity = item.replace(/\([^)]*\)/g, '').trim();
              lessonSteps.push({
                time,
                activity,
                description: activity
              });
            }
          }
        }
      } else if (currentSection === 'homework' && trimmedLine && !trimmedLine.toUpperCase().includes('HOMEWORK')) {
        homework = trimmedLine;
      }
    }
    
    console.log('Final parsed content:', {
      objectives,
      materials,
      lessonSteps,
      homework,
      localExamples
    });
    
    
    return {
      objectives: objectives.length > 0 ? objectives : [
        "Understand the basic concepts of robotics",
        "Identify different types of robots",
        "Explain the applications of robotics in daily life"
      ],
      materials: materials.length > 0 ? materials : [
        "Computer or tablet",
        "Projector or smart board",
        "Robot demonstration videos",
        "Worksheet with robot images"
      ],
      lessonSteps: lessonSteps.length > 0 ? lessonSteps : [
        { time: `${Math.round(lessonDuration * 0.1)} minutes`, activity: "Introduction", description: "Begin by asking students what they already know about the topic. Write their responses on the board and address any misconceptions. Show a relevant video or demonstration to capture their attention and set the learning context." },
        { time: `${Math.round(lessonDuration * 0.4)} minutes`, activity: "Direct Instruction", description: "Present the main concepts using visual aids, real examples, and clear explanations. Break down complex ideas into smaller parts. Use questioning techniques to check understanding and encourage student participation throughout the explanation." },
        { time: `${Math.round(lessonDuration * 0.25)} minutes`, activity: "Guided Practice", description: "Work through 2-3 examples together as a class. Call on different students to participate in solving problems step-by-step. Provide immediate feedback and correct any errors. Ensure all students understand before moving to independent work." },
        { time: `${Math.round(lessonDuration * 0.2)} minutes`, activity: "Independent Practice", description: "Students work individually or in pairs on practice exercises. Circulate around the classroom to provide individual help and monitor progress. Encourage students to ask questions if they get stuck." },
        { time: `${Math.round(lessonDuration * 0.05)} minutes`, activity: "Assessment", description: "Conduct a quick oral quiz with 3-5 questions to check understanding. Ask students to summarize key points learned. Assign homework and preview what will be covered in the next lesson." }
      ],
      homework: homework || getAgeAppropriateHomework(classLevel),
      localExamples: localExamples.length > 0 ? localExamples : getAgeAppropriateExamples(classLevel)
  };
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !subject.trim() || !classLevel.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setGenerating(true);
    try {
      const generatedContent = await generateLessonPlan(topic, subject, classLevel, duration, language, resourceLevel);
      
      // Store the AI-generated content
      setAiGeneratedContent(generatedContent);
      
      // Parse the AI content into structured format
      console.log('AI Generated Content:', generatedContent);
      const parsedContent = parseAIContent(generatedContent, duration);
      console.log('Parsed Content:', parsedContent);
      
      // Update the lesson plan with parsed AI content
      const updatedLessonPlan: LessonPlan = {
        topic,
        subject,
        class: classLevel,
        objectives: parsedContent.objectives,
        materials: parsedContent.materials,
        lessonSteps: parsedContent.lessonSteps,
        homework: parsedContent.homework,
        localExamples: parsedContent.localExamples
      };
      
      // Update the state with AI-generated content
      setLessonPlanData(updatedLessonPlan);
      setGenerated(true);
      onSave(updatedLessonPlan);
      toast.success("Lesson plan generated successfully!");
    } catch (error) {
      console.error('Lesson generation error:', error);
      toast.error("Failed to generate lesson plan. Please check your API key configuration.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!isSupabaseConfigured() || !user) {
      toast.success("Lesson plan saved locally!");
      return;
    }

    try {
      await saveLesson({
        title: topic,
        subject,
        class_level: classLevel,
        content: JSON.stringify(lessonPlanData),
        objectives: lessonPlanData.objectives,
        materials: lessonPlanData.materials,
        duration_minutes: duration,
        teacher_id: user.id,
      });
      toast.success("Lesson plan saved to Supabase!");
    } catch (error) {
      console.error('Failed to save lesson:', error);
      toast.error("Failed to save to database, but saved locally!");
    }
  };

  const content = (
    <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject" className="rounded-xl">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English Language">English Language</SelectItem>
                      <SelectItem value="Basic Science">Basic Science</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="Robotics">Robotics</SelectItem>
                      <SelectItem value="Solar PV">Solar PV</SelectItem>
                      <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={classLevel} onValueChange={setClassLevel}>
                    <SelectTrigger id="class" className="rounded-xl">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JSS 1">JSS 1</SelectItem>
                      <SelectItem value="JSS 2">JSS 2</SelectItem>
                      <SelectItem value="JSS 3">JSS 3</SelectItem>
                      <SelectItem value="SS 1">SS 1</SelectItem>
                      <SelectItem value="SS 2">SS 2</SelectItem>
                      <SelectItem value="SS 3">SS 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input 
                    id="topic" 
                    placeholder="e.g., Introduction to Robotics"
                    className="rounded-xl"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      placeholder="40"
                      className="rounded-xl"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 40)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="rounded-xl">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="yoruba">Yoruba</SelectItem>
                        <SelectItem value="hausa">Hausa</SelectItem>
                        <SelectItem value="igbo">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resources">Resource Level</Label>
                  <Select value={resourceLevel} onValueChange={setResourceLevel}>
                    <SelectTrigger id="resources" className="rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Minimal materials)</SelectItem>
                      <SelectItem value="medium">Medium (Basic materials)</SelectItem>
                      <SelectItem value="high">High (Full equipment)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Any specific requirements or focus areas..."
                    className="rounded-xl"
                    rows={3}
                  />
                </div>

                <Button 
                  className="w-full rounded-2xl" 
                  size="lg"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            {!generated && !generating && (
              <Card className="rounded-2xl border-dashed border-2">
                <CardContent className="p-8 sm:p-12 text-center">
                  <Sparkles className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl mb-2">Ready to Generate</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Fill in the details and click "Generate with AI" to create your lesson plan
                  </p>
                </CardContent>
              </Card>
            )}

            {generating && (
              <Card className="rounded-2xl">
                <CardContent className="p-8 sm:p-12 text-center">
                  <Loader2 className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-primary animate-spin" />
                  <h3 className="text-lg sm:text-xl mb-2">Creating Your Lesson Plan...</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    AI is generating a comprehensive lesson with local examples
                  </p>
                </CardContent>
              </Card>
            )}

            {generated && (
              <>
                {/* AI Generated Indicator */}
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">AI Generated Lesson Plan</span>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button variant="outline" className="rounded-xl flex-1 sm:flex-initial text-xs sm:text-sm">
                    <Languages className="w-4 h-4 mr-2" />
                    Translate
                  </Button>
                  <Button variant="outline" className="rounded-xl flex-1 sm:flex-initial text-xs sm:text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Simplify
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1 sm:flex-initial text-xs sm:text-sm"
                    onClick={handleExportPDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>


                <Collapsible defaultOpen>
                  <Card className="rounded-2xl">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base sm:text-lg">Learning Objectives</CardTitle>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <ul className="space-y-2 text-sm sm:text-base">
                          {lessonPlanData.objectives.map((obj, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="text-primary mt-1 flex-shrink-0">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                <Collapsible defaultOpen>
                  <Card className="rounded-2xl">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base sm:text-lg">Materials Needed</CardTitle>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <ul className="space-y-2 text-sm sm:text-base">
                          {lessonPlanData.materials.map((material, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="text-primary mt-1 flex-shrink-0">•</span>
                              <span>{material}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                <Collapsible defaultOpen>
                  <Card className="rounded-2xl">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base sm:text-lg">Lesson Steps</CardTitle>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {lessonPlanData.lessonSteps.map((step, i) => (
                          <div key={i} className="border-l-4 border-primary pl-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs sm:text-sm inline-block w-fit">
                                {step.time}
                              </span>
                              <h4 className="text-sm sm:text-base">{step.activity}</h4>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                <Collapsible defaultOpen>
                  <Card className="rounded-2xl">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base sm:text-lg">Homework / Assessment</CardTitle>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <p className="text-sm sm:text-base">{lessonPlanData.homework}</p>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                <Collapsible defaultOpen>
                  <Card className="rounded-2xl bg-accent/5">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <span>🇳🇬</span>
                            Local Nigerian Examples
                          </CardTitle>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <ul className="space-y-2 text-sm sm:text-base">
                          {lessonPlanData.localExamples.map((example, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="text-accent mt-1 flex-shrink-0">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>


                <Button 
                  className="w-full rounded-2xl" 
                  size="lg"
                  onClick={handleSaveToLibrary}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Add to Library
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
  );

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Generate Lesson Plan"
      subtitle="AI-powered lesson planning"
      hideHeaderIcons={true}
      activeMenu="lesson-generator"
      children={content}
    />
  );
}

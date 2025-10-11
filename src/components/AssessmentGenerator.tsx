import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Sparkles, Download, FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { LessonPlan } from "../App";
import { SharedLayout } from "./SharedLayout";
import { generateQuiz } from "../lib/groq";
import { runtimeEnv } from '../lib/runtime-env';
import { getSubjectsByClass, getTopicsBySubject, getAllCurriculum } from '../lib/curriculum';

// Check if Groq API key is configured
const isApiKeyConfigured = () => {
  const apiKey = runtimeEnv.getEnv().VITE_GROQ_API_KEY;
  return !!(apiKey && apiKey !== '' && apiKey !== 'your_groq_api_key_here' && !apiKey.includes('placeholder'));
};

interface AssessmentGeneratorProps {
  onNavigate: (page: any, role?: any) => void;
  lessonPlan: LessonPlan | null;
}

export function AssessmentGenerator({ onNavigate, lessonPlan }: AssessmentGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [topic, setTopic] = useState(lessonPlan?.topic || "");
  const [subject, setSubject] = useState(lessonPlan?.subject || "");
  const [questions, setQuestions] = useState([]);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [showRawContent, setShowRawContent] = useState(false);
  const [classLevel, setClassLevel] = useState("JSS 3");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [numberOfQuestionsInput, setNumberOfQuestionsInput] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    short: true,
    essay: false
  });
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // Dynamic dropdown states
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [curriculumDataStatus, setCurriculumDataStatus] = useState({
    loaded: false,
    totalRecords: 0,
    classes: [],
    subjects: [],
    lastChecked: ''
  });

  // Function to check curriculum data status
  const checkCurriculumData = async () => {
    try {
      const allCurriculum = await getAllCurriculum();
      const classes = [...new Set(allCurriculum.map(item => item.class))];
      const subjects = [...new Set(allCurriculum.map(item => item.subject))];
      
      setCurriculumDataStatus({
        loaded: allCurriculum.length > 0,
        totalRecords: allCurriculum.length,
        classes: classes,
        subjects: subjects,
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setCurriculumDataStatus({
        loaded: false,
        totalRecords: 0,
        classes: [],
        subjects: [],
        lastChecked: new Date().toLocaleTimeString()
      });
    }
  };

  // Check curriculum data on component mount
  useEffect(() => {
    checkCurriculumData();
  }, []);

  // Load subjects when class level changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (!classLevel) return;
      
      setLoadingSubjects(true);
      try {
        const subjects = await getSubjectsByClass(classLevel);
        setAvailableSubjects(subjects);
        
        // Reset subject and topic when class changes
        setSubject("");
        setTopic("");
        setAvailableTopics([]);
      } catch (error) {
        setAvailableSubjects([]);
        toast.error('Failed to load subjects from curriculum');
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [classLevel]);

  // Load topics when subject changes
  useEffect(() => {
    const loadTopics = async () => {
      if (!classLevel || !subject) return;
      
      setLoadingTopics(true);
      try {
        const topics = await getTopicsBySubject(classLevel, subject);
        setAvailableTopics(topics);
        
        // Reset topic when subject changes
        setTopic("");
      } catch (error) {
        setAvailableTopics([]);
        toast.error('Failed to load topics from curriculum');
      } finally {
        setLoadingTopics(false);
      }
    };

    loadTopics();
  }, [classLevel, subject]);

  // Handle class level change
  const handleClassLevelChange = (newClassLevel: string) => {
    setClassLevel(newClassLevel);
    // The useEffect will handle loading subjects and resetting subject/topic
  };

  // Handle question type changes
  const handleQuestionTypeChange = (type: 'mcq' | 'short' | 'essay', checked: boolean) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  // Handle number of questions input change
  const handleNumberOfQuestionsChange = (value: string) => {
    setNumberOfQuestionsInput(value);
    
    // Only update the actual number if it's a valid positive integer
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 40) {
      setNumberOfQuestions(num);
    }
  };

  // Default hardcoded questions
  const defaultQuestions = [
    {
      type: "mcq",
      question: "What are the three main components of a robot?",
      options: [
        "A) Wheels, battery, and motor",
        "B) Sensors, processor, and actuators",
        "C) Camera, speaker, and screen",
        "D) Metal, plastic, and wires"
      ],
      answer: "B) Sensors, processor, and actuators"
    },
    {
      type: "mcq",
      question: "Which of these is an example of a robot used in Nigeria?",
      options: [
        "A) Traditional grinding stone",
        "B) ATM machine",
        "C) Wooden chair",
        "D) Kerosene lamp"
      ],
      answer: "B) ATM machine"
    },
    {
      type: "mcq",
      question: "What does a sensor in a robot do?",
      options: [
        "A) Powers the robot",
        "B) Moves the robot's parts",
        "C) Collects information from the environment",
        "D) Stores programs"
      ],
      answer: "C) Collects information from the environment"
    },
    {
      type: "short",
      question: "Name one place in your community where robots or automation are used.",
      answer: "Examples: Bank (ATM), traffic lights, automated gates, factories"
    },
    {
      type: "short",
      question: "Explain in one sentence what the processor (brain) of a robot does.",
      answer: "The processor receives information from sensors and tells the actuators what to do."
    }
  ];

  useEffect(() => {
    if (lessonPlan) {
      setTopic(lessonPlan.topic);
      setSubject(lessonPlan.subject);
    }
  }, [lessonPlan]);


  const handleGenerate = async () => {
    if (!topic.trim() || !subject.trim()) {
      toast.error("Please fill in topic and subject");
      return;
    }

    // Validate number of questions
    const numQuestions = parseInt(numberOfQuestionsInput);
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 40) {
      toast.error("Please enter a valid number of questions (1-40)");
      return;
    }

    setGenerated(true);
    setGenerating(true);

    // If API key is configured, generate AI questions
    if (isApiKeyConfigured()) {
      try {
        const generatedContent = await generateQuiz(topic, numQuestions, difficulty, classLevel, questionTypes, additionalNotes);
        setAiGeneratedContent(generatedContent);
        
        // Parse the AI-generated content into the same format as hardcoded questions
        const parsedQuestions = parseAIContent(generatedContent, numQuestions);
        
        // Only show AI questions if we got valid ones
        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          toast.success("AI-generated assessment ready!");
        } else {
          // Fallback to default questions only if AI parsing fails
          setQuestions(defaultQuestions);
          toast.info("Using sample questions (AI parsing failed)");
        }
      } catch (error) {
        console.error('Assessment generation error:', error);
        // Fallback to default questions only if AI generation fails
        setQuestions(defaultQuestions);
        toast.info("Using sample questions (AI generation failed)");
      } finally {
        setGenerating(false);
      }
    } else {
      // No API key - use default questions
      setQuestions(defaultQuestions);
      toast.success("Assessment ready!");
      setGenerating(false);
    }
  };

  const parseAIContent = (content: string, maxQuestions: number = 5) => {
    const lines = content.split('\n').filter(line => line.trim());
    const questions: any[] = [];
    
    // Look for structured format: ### Question X: followed by numbered sections
    let questionCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for question headers like "### Question 1:" or "Question 1:"
      if (line.match(/^### Question \d+:|^Question \d+:/)) {
        questionCount++;
        
        // Determine question type based on the format
        let questionType = "mcq"; // default
        let question: any = {
          type: questionType,
          question: '',
          options: [],
          answer: '',
          explanation: '',
          sampleAnswer: '',
          marks: '',
          instructions: '',
          keyPoints: '',
          wordLimit: ''
        };
        
        // Look for the numbered sections in the next few lines
        for (let j = i + 1; j < Math.min(i + 25, lines.length); j++) {
          const nextLine = lines[j].trim();
          
          // Section 1: Question
          if (nextLine.match(/^1\.\s*\*\*Question\*\*:/)) {
            question.question = nextLine.replace(/^1\.\s*\*\*Question\*\*:\s*/, '');
          }
          // Section 2: Check for different formats
          else if (nextLine.match(/^2\.\s*\*\*Answer Options\*\*:/)) {
            // This is an MCQ question
            question.type = "mcq";
            // Collect options in the next few lines
            for (let k = j + 1; k < Math.min(j + 10, lines.length); k++) {
              const optionLine = lines[k].trim();
              // Match options with dashes: - A:, - B:, etc.
              if (optionLine.match(/^-\s*[A-D]:/)) {
                // Remove the dash and clean up
                const cleanOption = optionLine.replace(/^-\s*/, '');
                question.options.push(cleanOption);
              } else if (optionLine && !optionLine.match(/^\d+\.|^###|^Question/)) {
                break;
              }
            }
          }
          else if (nextLine.match(/^2\.\s*\*\*Explanation\*\*:/)) {
            // This could be Short Answer or Essay
            question.explanation = nextLine.replace(/^2\.\s*\*\*Explanation\*\*:\s*/, '');
          }
          else if (nextLine.match(/^2\.\s*\*\*Instructions\*\*:/)) {
            // This is an Essay question
            question.type = "essay";
            question.instructions = nextLine.replace(/^2\.\s*\*\*Instructions\*\*:\s*/, '');
          }
          // Section 3: Check for different formats
          else if (nextLine.match(/^3\.\s*\*\*Correct Answer\*\*:/)) {
            // MCQ question
            const answerLine = nextLine.replace(/^3\.\s*\*\*Correct Answer\*\*:\s*/, '');
            // Extract just the letter
            const letterMatch = answerLine.match(/^([A-D])/);
            if (letterMatch) {
              question.answer = letterMatch[1];
            } else {
              question.answer = answerLine;
            }
          }
          else if (nextLine.match(/^3\.\s*\*\*Sample Answer\*\*:/)) {
            // Short Answer question
            question.type = "short";
            question.sampleAnswer = nextLine.replace(/^3\.\s*\*\*Sample Answer\*\*:\s*/, '');
          }
          else if (nextLine.match(/^3\.\s*\*\*Explanation\*\*:/)) {
            // Essay question
            question.keyPoints = nextLine.replace(/^3\.\s*\*\*Explanation\*\*:\s*/, '');
          }
          // Section 4: Check for different formats
          else if (nextLine.match(/^4\.\s*\*\*Explanation\*\*:/)) {
            question.explanation = nextLine.replace(/^4\.\s*\*\*Explanation\*\*:\s*/, '');
          }
          else if (nextLine.match(/^4\.\s*\*\*Marks\*\*:/)) {
            question.marks = nextLine.replace(/^4\.\s*\*\*Marks\*\*:\s*/, '');
          }
          // Section 5: Check for Essay-specific fields
          else if (nextLine.match(/^5\.\s*\*\*Word Limit\*\*:/)) {
            question.wordLimit = nextLine.replace(/^5\.\s*\*\*Word Limit\*\*:\s*/, '');
          }
          // Stop if we hit the next question
          else if (nextLine.match(/^### Question|^Question \d+:/)) {
            break;
          }
        }
        
        questions.push(question);
        
        // Limit to the requested number of questions
        if (questionCount >= maxQuestions) break;
      }
    }
    
    
    // If we found questions, use them
    if (questions.length > 0) {
      return questions;
    }
    
    // Fallback: Create a question from the content
    const fallbackQuestion = {
      type: "mcq",
      question: content.substring(0, 100) + "...",
      options: ["A: Option A", "B: Option B", "C: Option C", "D: Option D"],
      answer: "A: Option A"
    };
    
    return [fallbackQuestion];
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened!");
  };

  const handleExportCSV = () => {
    const csvContent = questions.map((q, i) => {
      const options = q.type === 'mcq' && q.options ? q.options.join(' | ') : '';
      const answer = showAnswers ? (q.answer || q.sampleAnswer || 'N/A') : 'Hidden';
      const explanation = showAnswers && q.explanation ? q.explanation : 'Hidden';
      const marks = q.marks || 'N/A';
      const instructions = q.instructions || 'N/A';
      const keyPoints = q.keyPoints || 'N/A';
      const wordLimit = q.wordLimit || 'N/A';
      
      return `${i + 1},"${q.question}","${q.type}","${options}","${answer}","${explanation}","${marks}","${instructions}","${keyPoints}","${wordLimit}"`;
    }).join('\n');

    const header = 'Question Number,Question,Type,Options,Answer,Explanation,Marks,Instructions,Key Points,Word Limit\n';
    const csv = header + csvContent;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_Assessment.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("CSV downloaded successfully!");
  };

  const handleExportPDF = () => {
    // Create a printable version and trigger print dialog
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      return;
    }

    const assessmentHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${topic} - Assessment</title>
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
            .meta {
              color: #64748B;
              margin-bottom: 30px;
            }
            .question {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .question-number {
              display: inline-block;
              background: #3B82F6;
              color: white;
              width: 30px;
              height: 30px;
              text-align: center;
              line-height: 30px;
              border-radius: 50%;
              margin-right: 10px;
              font-weight: bold;
            }
            .option {
              margin: 10px 0 10px 40px;
              padding: 10px;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
            }
            .answer {
              background: #10B981;
              color: white;
              padding: 10px;
              margin: 10px 0 10px 40px;
              border-radius: 8px;
            }
            .answer-line {
              border-bottom: 1px dashed #94A3B8;
              margin: 10px 0 10px 40px;
              height: 40px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${topic} - Assessment</h1>
          <div class="meta">
            <strong>Subject:</strong> ${subject} | 
            <strong>Level:</strong> JSS 3 | 
            <strong>Total Marks:</strong> ${questions.reduce((sum, q) => {
              if (!q.marks) return sum + 2;
              const marksMatch = q.marks.match(/(\d+)/);
              return sum + (marksMatch ? parseInt(marksMatch[1]) : 2);
            }, 0)}
          </div>
          <p><em>Instructions: Answer all questions. Marks are indicated for each question.</em></p>
          ${questions.map((q, i) => `
            <div class="question">
              <div>
                <span class="question-number">${i + 1}</span>
                <strong>${q.question}</strong>
              </div>
              ${q.type === 'mcq' && q.options ? q.options.map(opt => `
                <div class="option">${opt}</div>
              `).join('') : ''}
              ${q.type === 'short' ? `
                <div class="answer-line"></div>
                <div class="answer-line"></div>
              ` : ''}
              ${q.type === 'essay' ? `
                <div class="answer-line" style="height: 100px;"></div>
                <div class="answer-line" style="height: 100px;"></div>
                <div class="answer-line" style="height: 100px;"></div>
              ` : ''}
              ${showAnswers ? `
                ${q.type === 'mcq' ? `
                  <div class="answer"><strong>Answer:</strong> ${q.answer}</div>
                  ${q.explanation ? `<div class="answer" style="background: #3B82F6; margin-top: 10px;"><strong>Explanation:</strong> ${q.explanation}</div>` : ''}
                ` : ''}
                ${q.type === 'short' ? `
                  ${q.explanation ? `<div class="answer" style="background: #3B82F6; margin-top: 10px;"><strong>Explanation:</strong> ${q.explanation}</div>` : ''}
                  ${q.sampleAnswer ? `<div class="answer" style="background: #10B981; margin-top: 10px;"><strong>Sample Answer:</strong> ${q.sampleAnswer}</div>` : ''}
                  ${q.marks ? `<div class="answer" style="background: #F59E0B; margin-top: 10px;"><strong>Marks:</strong> ${q.marks}</div>` : ''}
                ` : ''}
                ${q.type === 'essay' ? `
                  ${q.instructions ? `<div class="answer" style="background: #8B5CF6; margin-top: 10px;"><strong>Instructions:</strong> ${q.instructions}</div>` : ''}
                  ${q.keyPoints ? `<div class="answer" style="background: #3B82F6; margin-top: 10px;"><strong>Key Points to Cover:</strong> ${q.keyPoints}</div>` : ''}
                  ${q.marks ? `<div class="answer" style="background: #F59E0B; margin-top: 10px;"><strong>Marks:</strong> ${q.marks}</div>` : ''}
                  ${q.wordLimit ? `<div class="answer" style="background: #F97316; margin-top: 10px;"><strong>Word Limit:</strong> ${q.wordLimit}</div>` : ''}
                ` : ''}
              ` : ''}
            </div>
          `).join('')}
          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
              Print or Save as PDF
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(assessmentHTML);
    printWindow.document.close();
    
    toast.success("PDF preview opened! Use your browser's print dialog to save as PDF");
  };

  const content = (
    <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {lessonPlan && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
            <p className="text-sm">
              ✨ <span className="font-semibold">Creating assessment based on:</span> {lessonPlan.topic} ({lessonPlan.subject} - {lessonPlan.class})
            </p>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Input Section */}
          <Card className="rounded-2xl h-fit lg:sticky lg:top-6 order-2 lg:order-1">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-x-hidden">
              
              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Select value={classLevel} onValueChange={handleClassLevelChange}>
                  <SelectTrigger id="classLevel" className="rounded-xl">
                    <SelectValue placeholder="Select class level" />
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
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject} disabled={loadingSubjects}>
                  <SelectTrigger id="subject" className="rounded-xl">
                    <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.length > 0 ? (
                      availableSubjects.map((subjectOption) => (
                        <SelectItem key={subjectOption} value={subjectOption}>
                          {subjectOption}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {loadingSubjects ? "Loading..." : "No subjects available"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select value={topic} onValueChange={setTopic} disabled={loadingTopics || !subject}>
                  <SelectTrigger id="topic" className="rounded-xl">
                    <SelectValue placeholder={
                      !subject ? "Select a subject first" : 
                      loadingTopics ? "Loading topics..." : 
                      "Select topic"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.length > 0 ? (
                      availableTopics.map((topicOption) => (
                        <SelectItem key={topicOption} value={topicOption}>
                          {topicOption}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {loadingTopics ? "Loading..." : !subject ? "Select subject first" : "No topics available"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfQuestions">Number of Questions</Label>
                <Input 
                  id="numberOfQuestions" 
                  type="text"
                  placeholder="5"
                  className="rounded-xl"
                  value={numberOfQuestionsInput}
                  onChange={(e) => handleNumberOfQuestionsChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a number between 1 and 40
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="rounded-xl">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Question Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mcq" 
                      checked={questionTypes.mcq}
                      onCheckedChange={(checked) => handleQuestionTypeChange('mcq', checked as boolean)}
                    />
                    <label htmlFor="mcq" className="text-sm cursor-pointer">
                      Multiple Choice Questions (MCQ)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="short" 
                      checked={questionTypes.short}
                      onCheckedChange={(checked) => handleQuestionTypeChange('short', checked as boolean)}
                    />
                    <label htmlFor="short" className="text-sm cursor-pointer">
                      Short Answer Questions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="essay" 
                      checked={questionTypes.essay}
                      onCheckedChange={(checked) => handleQuestionTypeChange('essay', checked as boolean)}
                    />
                    <label htmlFor="essay" className="text-sm cursor-pointer">
                      Essay Questions
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Any specific requirements, focus areas, or instructions for the assessment..."
                  className="rounded-xl"
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
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
                    Generate Assessment
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Output Section */}
          <div className="space-y-4 order-1 lg:order-2">
            {!generated && !generating && (
              <Card className="rounded-2xl border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl mb-2">Ready to Create</h3>
                  <p className="text-muted-foreground">
                    Configure your assessment settings and click generate
                  </p>
                </CardContent>
              </Card>
            )}

            {generating && (
              <Card className="rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                  <h3 className="text-xl mb-2">Creating Assessment...</h3>
                  <p className="text-muted-foreground">
                    Generating questions with answer key
                  </p>
                </CardContent>
              </Card>
            )}

            {generated && (
              <>
                <div className="grid grid-cols-2 sm:flex gap-3">
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={() => setShowAnswers(!showAnswers)}
                  >
                    {showAnswers ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Hide Answers</span>
                        <span className="sm:hidden">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Show Answers</span>
                        <span className="sm:hidden">Show</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={handleExportCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">CSV</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={handleExportPDF}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>


                <Card className="rounded-2xl">
                  <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl">{topic || "Introduction to Robotics"} - Assessment</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subject || "Computer Science"} • {classLevel} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                          {!isApiKeyConfigured() ? (
                            <span className="ml-2 text-blue-600 font-medium">(Sample Questions)</span>
                          ) : (
                            <span className="ml-2 text-green-600 font-medium">(AI Generated)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-base font-semibold">{questions.reduce((sum, q) => {
                          if (!q.marks) return sum + 2; // Default 2 marks if no marks specified
                          // Extract number from marks string (e.g., "5 marks" -> 5)
                          const marksMatch = q.marks.match(/(\d+)/);
                          return sum + (marksMatch ? parseInt(marksMatch[1]) : 2);
                        }, 0)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 overflow-x-hidden">
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Instructions: Answer all questions. Marks are indicated for each question.
                        </p>
                      </div>

                      {questions.map((q, i) => (
                        <div key={i} className="border-b pb-4 sm:pb-6 last:border-b-0">
                          <div className="flex gap-3 mb-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-semibold text-sm">
                              {i + 1}
                            </span>
                            <p className="flex-1 pt-1 text-sm sm:text-base leading-relaxed">{q.question}</p>
                          </div>

                          {q.type === "mcq" && q.options && (
                            <div className="ml-8 sm:ml-11 space-y-2">
                              {q.options.map((option, j) => (
                                <div 
                                  key={j}
                                  className="p-3 rounded-lg border bg-muted/30 text-sm sm:text-base overflow-hidden"
                                >
                                  <p className="break-words hyphens-auto">{option}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === "short" && (
                            <div className="ml-11">
                              <div className="border-b border-dashed border-muted-foreground/30 py-3"></div>
                              <div className="border-b border-dashed border-muted-foreground/30 py-3"></div>
                            </div>
                          )}

                          {q.type === "essay" && (
                            <div className="ml-11">
                              <div className="space-y-3">
                                <div className="border-b border-dashed border-muted-foreground/30 py-8"></div>
                                <div className="border-b border-dashed border-muted-foreground/30 py-8"></div>
                                <div className="border-b border-dashed border-muted-foreground/30 py-8"></div>
                              </div>
                            </div>
                          )}

                          {showAnswers && (
                            <div className="ml-8 sm:ml-11 mt-3 space-y-3">
                              {/* MCQ Answers */}
                              {q.type === "mcq" && (
                                <>
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                                    <p className="text-sm text-green-800 break-words">
                                      <span className="font-semibold">Correct Answer: </span>
                                      {q.answer}
                                    </p>
                                  </div>
                                  
                                  {q.explanation && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-blue-800 leading-relaxed break-words hyphens-auto">
                                        <span className="font-semibold">Explanation: </span>
                                        {q.explanation}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Short Answer Answers */}
                              {q.type === "short" && (
                                <>
                                  {q.explanation && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-blue-800 leading-relaxed break-words hyphens-auto">
                                        <span className="font-semibold">Explanation: </span>
                                        {q.explanation}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {q.sampleAnswer && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-green-800 break-words">
                                        <span className="font-semibold">Sample Answer: </span>
                                        {q.sampleAnswer}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {q.marks && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-yellow-800 break-words">
                                        <span className="font-semibold">Marks: </span>
                                        {q.marks}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Essay Answers */}
                              {q.type === "essay" && (
                                <>
                                  {q.instructions && (
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-purple-800 break-words">
                                        <span className="font-semibold">Instructions: </span>
                                        {q.instructions}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {q.keyPoints && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-blue-800 leading-relaxed break-words hyphens-auto">
                                        <span className="font-semibold">Key Points to Cover: </span>
                                        {q.keyPoints}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {q.marks && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-yellow-800 break-words">
                                        <span className="font-semibold">Marks: </span>
                                        {q.marks}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {q.wordLimit && (
                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                                      <p className="text-sm text-orange-800 break-words">
                                        <span className="font-semibold">Word Limit: </span>
                                        {q.wordLimit}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button className="flex-1 rounded-2xl" size="lg">
                    Assign to Class
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-2xl" size="lg">
                    Save to Library
                  </Button>
                </div>
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
      title="Create Assessment"
      subtitle="Generate quizzes and tests"
      hideHeaderIcons={true}
      activeMenu="assessment"
      children={content}
    />
  );
}

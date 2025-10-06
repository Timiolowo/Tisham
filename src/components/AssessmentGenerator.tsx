import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Sparkles, Download, FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { LessonPlan } from "../App";
import { SharedLayout } from "./SharedLayout";
import { generateQuiz } from "../lib/groq";
import { isApiKeyConfigured } from "../lib/env";

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
  const [questions, setQuestions] = useState<any[]>([]);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [showRawContent, setShowRawContent] = useState(false);
  const [classLevel, setClassLevel] = useState("JSS 3");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");

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

  // Debug: Log when questions state changes
  useEffect(() => {
    console.log('Questions state updated:', questions);
    console.log('Number of questions in state:', questions.length);
  }, [questions]);

  const handleGenerate = async () => {
    if (!topic.trim() || !subject.trim()) {
      toast.error("Please fill in topic and subject");
      return;
    }

    // Always start with default questions
    setQuestions(defaultQuestions);
    setGenerated(true);
    toast.success("Assessment ready!");

    // If API key is configured, try to generate AI questions
    if (isApiKeyConfigured()) {
      setGenerating(true);
      try {
        console.log('Generating quiz with params:', { topic, numberOfQuestions, difficulty, classLevel });
        const generatedContent = await generateQuiz(topic, numberOfQuestions, difficulty, classLevel);
        console.log('AI Generated Content:', generatedContent);
        setAiGeneratedContent(generatedContent);
        
        // Parse the AI-generated content into the same format as hardcoded questions
        const parsedQuestions = parseAIContent(generatedContent);
        console.log('Parsed Questions:', parsedQuestions);
        console.log('Number of parsed questions:', parsedQuestions.length);
        console.log('Current questions state before update:', questions);
        
        // Only replace if we got valid questions
        if (parsedQuestions.length > 0) {
          console.log('Setting questions to parsed questions');
          setQuestions(parsedQuestions);
          toast.success("AI-generated assessment ready!");
        } else {
          console.log('No valid questions found, keeping default questions');
          toast.info("Using sample questions (AI parsing failed)");
        }
      } catch (error) {
        console.error('Assessment generation error:', error);
        toast.info("Using sample questions (AI generation failed)");
      } finally {
        setGenerating(false);
      }
    }
  };

  const parseAIContent = (content: string) => {
    console.log('AI Generated Content:', content);
    
    // Simple approach: Create questions based on the AI content
    // Extract any text that looks like a question
    const lines = content.split('\n').filter(line => line.trim());
    const questions: any[] = [];
    
    // Look for question patterns and create simple questions
    let questionCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for lines that are clearly questions - must end with ? and not be explanations
      if (line.includes('?') && 
          !line.toLowerCase().includes('explanation') && 
          !line.toLowerCase().includes('because') &&
          !line.toLowerCase().includes('telling us') &&
          !line.toLowerCase().includes('shows the action') &&
          !line.toLowerCase().includes('modifies the') &&
          line.length > 20) { // Must be a substantial question
        questionCount++;
        
        // Create a simple question structure
        const question = {
          type: "mcq",
          question: line.replace(/^\d+\.\s*/, '').replace(/^\*\*Question\*\*:\s*/, ''),
          options: [
            "A: Option A",
            "B: Option B", 
            "C: Option C",
            "D: Option D"
          ],
          answer: "A: Option A",
          explanation: ""
        };
        
        // Additional validation - make sure this looks like a real question
        if (question.question.length < 10 || 
            question.question.toLowerCase().includes('explanation') ||
            question.question.toLowerCase().includes('because')) {
          console.log('Skipping invalid question:', question.question);
          continue;
        }
        
        // Try to find options in the next few lines
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const nextLine = lines[j].trim();
          
          // Look for option patterns: A:, B:, C:, D: or A), B), C), D) or - A:, - B:, etc.
          if (nextLine.match(/^[A-D]:|^[A-D]\)|^-\s*[A-D]:|^[A-D]\./)) {
            question.options = [];
            
            // Collect all options starting from this line
            for (let k = j; k < Math.min(j + 10, lines.length); k++) {
              const optionLine = lines[k].trim();
              
              // Match various option formats - be more strict
              if (optionLine.match(/^[A-D]:|^[A-D]\)|^-\s*[A-D]:|^[A-D]\./) && 
                  optionLine.length > 3 && // Must have some content after the letter
                  !optionLine.match(/^[A-D]:\s*$/) && // Not just "A:" with nothing
                  !optionLine.match(/^[A-D]:\s*[A-D]/)) { // Not "A: B" (likely wrong parsing)
                
                // Clean up the option format
                let cleanOption = optionLine
                  .replace(/^-\s*/, '') // Remove leading dash
                  .replace(/^[A-D]\.\s*/, (match) => match.replace('.', ': ')) // Convert A. to A:
                  .replace(/^[A-D]\)\s*/, (match) => match.replace(')', ': ')); // Convert A) to A:
                
                question.options.push(cleanOption);
              } else if (optionLine && !optionLine.match(/^\d+\.|^###|^Question|^Answer|^Correct/)) {
                // Stop if we hit a non-option line that's not a section header
                break;
              }
            }
            
            // If we found options, we're done
            if (question.options.length > 0) {
              break;
            }
          }
        }
        
        // Try to find answer in the next few lines
        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.toLowerCase().includes('correct answer') || nextLine.toLowerCase().includes('answer:')) {
            // Extract answer from this line or next line
            let answerLine = '';
            
            if (nextLine.includes(':')) {
              // Answer is in the same line after colon
              answerLine = nextLine.split(':').slice(1).join(':').trim();
            } else if (j + 1 < lines.length) {
              // Answer might be in the next line
              answerLine = lines[j + 1].trim();
            }
            
            // Clean up the answer - extract just the letter (A, B, C, D)
            if (answerLine) {
              // Remove any leading text like "Answer:", "Correct Answer:", etc.
              answerLine = answerLine.replace(/^(Answer|Correct Answer|Answer is):\s*/i, '');
              
              // Extract just the letter from formats like "B: 4" or "B)" or "B"
              const letterMatch = answerLine.match(/^([A-D])/);
              if (letterMatch) {
                question.answer = letterMatch[1];
                console.log('Found answer:', question.answer, 'from line:', answerLine);
              } else {
                question.answer = answerLine;
              }
            }
            break;
          }
        }
        
        // Try to find explanation in the next few lines - be more specific
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const nextLine = lines[j].trim();
          
          // Look for explanation that's clearly part of this question
          if (nextLine.match(/^\d+\.\s*\*\*Explanation\*\*:/) || 
              nextLine.match(/^Explanation:/) ||
              (nextLine.toLowerCase().includes('explanation') && nextLine.includes(':'))) {
            
            // Extract explanation from this line or next line
            let explanationLine = '';
            
            if (nextLine.includes(':')) {
              // Explanation is in the same line after colon
              explanationLine = nextLine.split(':').slice(1).join(':').trim();
            } else if (j + 1 < lines.length) {
              // Explanation might be in the next line
              explanationLine = lines[j + 1].trim();
            }
            
            // Clean up the explanation
            if (explanationLine) {
              // Remove any leading text like "Explanation:", "Explanation is:", etc.
              explanationLine = explanationLine.replace(/^(Explanation|Explanation is):\s*/i, '');
              question.explanation = explanationLine;
              console.log('Found explanation for question:', question.question.substring(0, 50), 'explanation:', explanationLine.substring(0, 50));
            }
            break;
          }
          
          // Stop if we hit the next question
          if (nextLine.match(/^### Question|^Question \d+:/)) {
            break;
          }
        }
        
        questions.push(question);
        
        // Limit to reasonable number of questions
        if (questionCount >= 5) break;
      }
    }
    
    console.log('Simple parsed questions:', questions);
    console.log('Number of questions found:', questions.length);
    
    // If we found questions, use them
    if (questions.length > 0) {
      console.log('Using AI-generated questions:', questions);
      return questions;
    }
    
    // Fallback: Create a question from the content
    console.log('No questions found, creating fallback from content');
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
      const answer = showAnswers ? q.answer : 'Hidden';
      const explanation = showAnswers && q.explanation ? q.explanation : 'Hidden';
      return `${i + 1},"${q.question}","${options}","${answer}","${explanation}"`;
    }).join('\n');

    const header = 'Question Number,Question,Options,Answer,Explanation\n';
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
            <strong>Total Marks:</strong> ${questions.length * 2}
          </div>
          <p><em>Instructions: Answer all questions. Each question carries 2 marks.</em></p>
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
              ${showAnswers ? `
                <div class="answer"><strong>Answer:</strong> ${q.answer}</div>
                ${q.explanation ? `<div class="answer" style="background: #3B82F6; margin-top: 10px;"><strong>Explanation:</strong> ${q.explanation}</div>` : ''}
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

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Create Assessment"
      subtitle="Generate quizzes and tests aligned with your lessons"
    >
      <div>
        {lessonPlan && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
            <p className="text-sm">
              ✨ <span className="font-semibold">Creating assessment based on:</span> {lessonPlan.topic} ({lessonPlan.subject} - {lessonPlan.class})
            </p>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="rounded-2xl h-fit lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isApiKeyConfigured() ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>Sample Mode:</strong> Using hardcoded questions. 
                    Configure your Groq API key to generate custom assessments.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700">
                    <strong>AI Mode:</strong> Will generate custom questions based on your topic.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject" className="rounded-xl">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English Language">English Language</SelectItem>
                    <SelectItem value="Basic Science">Basic Science</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger id="classLevel" className="rounded-xl">
                    <SelectValue placeholder="Select class level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSS 1">JSS 1</SelectItem>
                    <SelectItem value="JSS 2">JSS 2</SelectItem>
                    <SelectItem value="JSS 3">JSS 3</SelectItem>
                    <SelectItem value="SSS 1">SSS 1</SelectItem>
                    <SelectItem value="SSS 2">SSS 2</SelectItem>
                    <SelectItem value="SSS 3">SSS 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfQuestions">Number of Questions</Label>
                <Input 
                  id="numberOfQuestions" 
                  type="number"
                  min="1"
                  max="20"
                  placeholder="5"
                  className="rounded-xl"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 5)}
                />
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
                    <Checkbox id="mcq" defaultChecked />
                    <label htmlFor="mcq" className="text-sm cursor-pointer">
                      Multiple Choice Questions (MCQ)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="short" defaultChecked />
                    <label htmlFor="short" className="text-sm cursor-pointer">
                      Short Answer Questions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="essay" />
                    <label htmlFor="essay" className="text-sm cursor-pointer">
                      Essay Questions
                    </label>
                  </div>
                </div>
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

              {/* Debug: Test parsing with sample content */}
              <Button 
                className="w-full rounded-2xl" 
                size="sm"
                variant="outline"
                onClick={() => {
                  const testContent = `### Question 1: Test
1. **Question**: What is 2 + 2?
2. **Answer Options**:
   - A: 3
   - B: 4
   - C: 5
   - D: 6
3. **Correct Answer**: B: 4
4. **Explanation**: 2 + 2 = 4`;
                  console.log('Testing with sample content:', testContent);
                  const testQuestions = parseAIContent(testContent);
                  console.log('Test parsing result:', testQuestions);
                  setQuestions(testQuestions);
                  toast.success("Test parsing completed!");
                }}
              >
                Test Parsing
              </Button>

              {/* Debug: Show raw AI content */}
              {aiGeneratedContent && (
                <Button 
                  className="w-full rounded-2xl" 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Raw AI Content:', aiGeneratedContent);
                    alert('Raw AI Content:\n\n' + aiGeneratedContent.substring(0, 500) + '...');
                  }}
                >
                  Show Raw AI Content
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <div className="space-y-4">
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={() => setShowAnswers(!showAnswers)}
                  >
                    {showAnswers ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Answers
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Answers
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={handleExportCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={handleExportPDF}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>

                {aiGeneratedContent && (
                  <Card className="rounded-2xl border-orange-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-orange-700">Debug: Raw AI Content</CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowRawContent(!showRawContent)}
                        >
                          {showRawContent ? 'Hide' : 'Show'} Raw Content
                        </Button>
                      </div>
                    </CardHeader>
                    {showRawContent && (
                      <CardContent>
                        <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
                          {aiGeneratedContent}
                        </pre>
                      </CardContent>
                    )}
                  </Card>
                )}

                <Card className="rounded-2xl">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{topic || "Introduction to Robotics"} - Assessment</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subject || "Computer Science"} • {classLevel} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                          {!isApiKeyConfigured() ? (
                            <span className="ml-2 text-blue-600 font-medium">(Sample Questions)</span>
                          ) : (
                            <span className="ml-2 text-green-600 font-medium">(AI Generated)</span>
                          )}
                        </p>
                        {/* Debug: Show current questions count */}
                        <p className="text-xs text-gray-500 mt-1">
                          Debug: {questions.length} questions in state
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-base">{questions.reduce((sum, q) => sum + (q.marks || 1), 0)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Instructions: Answer all questions. Each question carries 2 marks.
                        </p>
                      </div>

                      {questions.map((q, i) => (
                        <div key={i} className="border-b pb-6 last:border-b-0">
                          <div className="flex gap-3 mb-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-semibold">
                              {i + 1}
                            </span>
                            <p className="flex-1 pt-1">{q.question}</p>
                          </div>

                          {q.type === "mcq" && q.options && (
                            <div className="ml-11 space-y-2">
                              {q.options.map((option, j) => (
                                <div 
                                  key={j}
                                  className="p-3 rounded-lg border bg-muted/30"
                                >
                                  <p>{option}</p>
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

                          {showAnswers && (
                            <div className="ml-11 mt-3 space-y-3">
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                  <span className="font-semibold">Correct Answer: </span>
                                  {q.answer}
                                </p>
                              </div>
                              
                              {q.explanation && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Explanation: </span>
                                    {q.explanation}
                                  </p>
                                </div>
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
      </div>
    </SharedLayout>
  );
}

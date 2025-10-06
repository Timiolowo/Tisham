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

  useEffect(() => {
    if (lessonPlan) {
      setTopic(lessonPlan.topic);
      setSubject(lessonPlan.subject);
    }
  }, [lessonPlan]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      toast.success("Assessment generated successfully!");
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened!");
  };

  const handleExportCSV = () => {
    const csvContent = questions.map((q, i) => {
      const options = q.type === 'mcq' && q.options ? q.options.join(' | ') : '';
      return `${i + 1},"${q.question}","${options}","${q.answer}"`;
    }).join('\n');

    const header = 'Question Number,Question,Options,Answer\n';
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

  const questions = [
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
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select>
                  <SelectTrigger id="difficulty" className="rounded-xl">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation (Easy)</SelectItem>
                    <SelectItem value="core">Core (Medium)</SelectItem>
                    <SelectItem value="advanced">Advanced (Hard)</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input 
                  id="numQuestions" 
                  type="number"
                  min="5"
                  max="50"
                  placeholder="10"
                  className="rounded-xl"
                  defaultValue="5"
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

                <Card className="rounded-2xl">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Introduction to Robotics - Assessment</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Computer Science • JSS 3 • Foundation Level
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-base">10</p>
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
                                  className={`p-3 rounded-lg border ${
                                    showAnswers && option === q.answer
                                      ? 'bg-green-50 border-green-500'
                                      : 'bg-muted/30'
                                  }`}
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
                            <div className="ml-11 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">
                                <span className="font-semibold">Answer: </span>
                                {q.answer}
                              </p>
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

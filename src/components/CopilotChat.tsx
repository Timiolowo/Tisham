import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Mic, Copy, FileText, Sparkles, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { generateTeachingResponse, type Message as GroqMessage } from "../lib/groq";
import { runtimeEnv } from '../lib/runtime-env';

// Check if Groq API key is configured
const isApiKeyConfigured = () => {
  const apiKey = runtimeEnv.getEnv().VITE_GROQ_API_KEY;
  return !!(apiKey && apiKey !== '' && apiKey !== 'your_groq_api_key_here' && !apiKey.includes('placeholder'));
};
import { SharedLayout } from "./SharedLayout";
import { useAuth } from "../contexts/AuthContext";

interface CopilotChatProps {
  onNavigate: (page: any, role?: any) => void;
}

// Function to format inline markdown (bold, italic, links, etc.)
const formatInlineMarkdown = (text: string) => {
  // Handle bold text (**text**)
  let formatted = text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });

  // Handle italic text (*text*)
  formatted = formatted.map((part, index) => {
    if (typeof part === 'string') {
      return part.split(/(\*[^*]+\*)/g).map((subPart, subIndex) => {
        if (subPart.startsWith('*') && subPart.endsWith('*') && !subPart.startsWith('**')) {
          return (
            <em key={`${index}-${subIndex}`} className="italic text-gray-700 dark:text-gray-300">
              {subPart.slice(1, -1)}
            </em>
          );
        }
        return subPart;
      });
    }
    return part;
  });

  // Handle links ([text](url))
  formatted = formatted.map((part, index) => {
    if (typeof part === 'string') {
      return part.split(/(\[.*?\]\(.*?\))/g).map((subPart, subIndex) => {
        const linkMatch = subPart.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <a 
              key={`${index}-${subIndex}`} 
              href={linkMatch[2]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return subPart;
      });
    }
    return part;
  });

  return formatted;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function CopilotChat({ onNavigate }: CopilotChatProps) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  
  // Different initial messages for students vs teachers
  const getInitialMessage = () => {
    // Use the same name logic as the dashboards
    const userName = user?.full_name || user?.email?.split('@')[0] || (isStudent ? 'Student' : 'Teacher');
    const firstName = userName.split(' ')[0];
    
    if (isStudent) {
      return {
        role: 'assistant' as const,
        content: `Hi ${firstName}! I'm Tishami, your AI learning companion! 🎓\n\nI can help you with:\n\n✅ **Understanding difficult topics** and concepts\n✅ **Homework help** and study guidance\n✅ **Learning strategies** and study tips\n✅ **Nigerian curriculum** explanations\n\nWhat would you like to learn about today?`
      };
    } else {
      return {
        role: 'assistant' as const,
        content: `Hi ${firstName}! I'm Tishami, your AI teaching assistant! 🎓\n\nI can help you with:\n\n✅ **Lesson planning** and curriculum guidance\n✅ **Student explanations** and homework help\n✅ **Teaching strategies** and classroom management\n✅ **Nigerian educational context** and examples\n\nWhat would you like to know about teaching today?`
      };
    }
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Check if API key is configured (for internal use only)
  const [apiKeyConfigured] = useState(isApiKeyConfigured());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const samplePrompts = isStudent ? [
    "Help me understand AI/ML",
    "Explain fractions in simple terms",
    "Help me study Nigerian history",
    "How can I improve my mathematics skills?",
  ] : [
    "Help me plan a lesson on Robotiics",
    "How can I engage students?",
    "Suggest activities for teaching Nigerian history",
    "How can I make mathematics more engaging?",
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert messages to Groq format
      const conversationHistory: GroqMessage[] = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Get AI response
      const aiResponse = await generateTeachingResponse(input, conversationHistory);

      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      
      // Fallback response if API fails
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error && error.message.includes('API key') 
          ? isStudent 
            ? "🤖 **AI not fully configured**\n\nI'm Tishami, your AI learning companion! I can help you with:\n\n✅ Understanding difficult topics and concepts\n✅ Homework help and study guidance\n✅ Learning strategies and study tips\n✅ Nigerian curriculum explanations\n\nWhat would you like to learn about? 🎓"
            : "🤖 **AI not fully configured**\n\nI'm Tishami, your AI teaching assistant! I can help you with:\n\n✅ Lesson planning and curriculum guidance\n✅ Student explanations and homework help\n✅ Teaching strategies and classroom management\n✅ Nigerian educational context and examples\n\nWhat would you like to know about teaching? 🎓"
          : "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🙏"
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (error instanceof Error && !error.message.includes('API key')) {
        toast.error("Failed to get AI response. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const content = (
    <>
      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Chat Interface - Always show */}
          <ScrollArea className="flex-1 pr-2 sm:pr-4 p-4 sm:p-6" ref={scrollAreaRef}>
              <div className="space-y-4 sm:space-y-6 pb-32 sm:pb-36">
                {/* Sample Prompts - Show only when no messages */}
                {messages.length === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center py-4 sm:py-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8">How can I help you teach better?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                      {samplePrompts.map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="rounded-xl h-auto py-2 px-3 text-left justify-start hover-lift text-xs"
                          onClick={() => handlePromptClick(prompt)}
                        >
                          <span className="text-xs leading-tight">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  } animate-fade-in`}
                >
                  
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[80%]`}>
                    <Card className={`rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
                    }`}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="prose prose-sm max-w-none">
                          {message.content.split('\n').map((line, index) => {
                            // Format code blocks (lines starting with ```)
                            if (line.trim().startsWith('```')) {
                              return (
                                <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4 font-mono text-sm border border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex gap-1">
                                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Code</span>
                                  </div>
                                  <code className="text-gray-800 dark:text-gray-200 block whitespace-pre-wrap">{line.replace(/```/g, '')}</code>
                                </div>
                              );
                            }
                            
                            // Format inline code (text between `)
                            if (line.includes('`') && !line.trim().startsWith('```')) {
                              const parts = line.split(/(`[^`]+`)/g);
                              return (
                                <div key={index} className="mb-2">
                                  {parts.map((part, partIndex) => 
                                    part.startsWith('`') && part.endsWith('`') ? (
                                      <code key={partIndex} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                                        {part.slice(1, -1)}
                                      </code>
                                    ) : (
                                      <span key={partIndex}>{part}</span>
                                    )
                                  )}
                                </div>
                              );
                            }
                            
                            // Format bullet points and numbered lists
                            if (line.trim().startsWith('✅') || line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                              return (
                                <div key={index} className="flex items-start gap-2 mb-2">
                                  <span className="text-primary font-semibold mt-1 flex-shrink-0 text-sm">•</span>
                                  <span className="text-sm leading-relaxed">
                                    {formatInlineMarkdown(line.trim().replace(/^[✅•\-\*]\s*/, ''))}
                                  </span>
                                </div>
                              );
                            }
                            
                            // Format headers (lines that are all caps or start with #)
                            if (line.trim().match(/^[A-Z\s]+$/) && line.trim().length > 3) {
                              return (
                                <div key={index} className="font-semibold text-primary mb-3 mt-4 first:mt-0 text-sm border-b border-primary/20 pb-1">
                                  {line.trim()}
                                </div>
                              );
                            }
                            
                            // Format numbered lists
                            if (line.trim().match(/^\d+\./)) {
                              return (
                                <div key={index} className="flex items-start gap-2 mb-2">
                                  <span className="text-primary font-semibold mt-1 flex-shrink-0 text-sm">
                                    {line.trim().match(/^\d+/)?.[0]}.
                                  </span>
                                  <span className="text-sm leading-relaxed">
                                    {formatInlineMarkdown(line.trim().replace(/^\d+\.\s*/, ''))}
                                  </span>
                                </div>
                              );
                            }
                            
                            // Regular text with inline markdown formatting
                            return line.trim() ? (
                              <div key={index} className="mb-2 text-sm leading-relaxed">
                                {formatInlineMarkdown(line)}
                              </div>
                            ) : (
                              <div key={index} className="mb-1"></div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {message.role === 'assistant' && i > 0 && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 sm:h-8 rounded-lg text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            toast.success("Copied to clipboard!");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 sm:h-8 rounded-lg text-xs"
                          onClick={() => {
                            toast.success("Content inserted to lesson plan!");
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Insert to Lesson
                        </Button>
                      </div>
                    )}
                  </div>

                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex animate-fade-in">
                  <Card className="glass-card rounded-2xl">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Tishami is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              </div>
            </ScrollArea>

          {/* Input Area - Fixed at bottom of viewport */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-3 sm:p-4">
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-background rounded-2xl border shadow-lg">
                <div className="p-3">
                  <div className="flex items-end gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0 rounded-xl h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 transition-colors"
                    >
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>

                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Ask me anything about teaching..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[40px] sm:min-h-[44px] max-h-24 sm:max-h-32 resize-none rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        disabled={isLoading}
                      />
                    </div>

                    <Button 
                      size="icon" 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 h-9 w-9 sm:h-11 sm:w-11 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole={isStudent ? "student" : "teacher"}
      title="Tisham"
      subtitle={isStudent ? "Your AI Learning Companion" : "Your AI Teaching Assistant"}
      activeMenu="copilot"
      hideHeaderIcons={true}
      children={content}
    />
  );
}

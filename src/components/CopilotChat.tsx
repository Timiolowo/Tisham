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

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function CopilotChat({ onNavigate }: CopilotChatProps) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  
  // Different initial messages for students vs teachers
  const getInitialMessage = () => {
    if (isStudent) {
      return {
        role: 'assistant' as const,
        content: "Hello! I'm TeachMate, your AI learning companion! 🎓\n\nI can help you with:\n\n✅ **Understanding difficult topics** and concepts\n✅ **Homework help** and study guidance\n✅ **Learning strategies** and study tips\n✅ **Nigerian curriculum** explanations\n\nWhat would you like to learn about today?"
      };
    } else {
      return {
        role: 'assistant' as const,
        content: "Hello! I'm TeachMate, your AI teaching assistant! 🎓\n\nI can help you with:\n\n✅ **Lesson planning** and curriculum guidance\n✅ **Student explanations** and homework help\n✅ **Teaching strategies** and classroom management\n✅ **Nigerian educational context** and examples\n\nWhat would you like to know about teaching today?"
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
    "Help me understand photosynthesis for JSS 3",
    "Explain fractions in simple terms",
    "Help me study Nigerian history",
    "How can I improve my mathematics skills?",
  ] : [
    "Help me plan a lesson on photosynthesis for JSS 3",
    "Explain fractions in simple terms for my students",
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
            ? "🤖 **AI not fully configured**\n\nI'm TeachMate, your AI learning companion! I can help you with:\n\n✅ Understanding difficult topics and concepts\n✅ Homework help and study guidance\n✅ Learning strategies and study tips\n✅ Nigerian curriculum explanations\n\nWhat would you like to learn about? 🎓"
            : "🤖 **AI not fully configured**\n\nI'm TeachMate, your AI teaching assistant! I can help you with:\n\n✅ Lesson planning and curriculum guidance\n✅ Student explanations and homework help\n✅ Teaching strategies and classroom management\n✅ Nigerian educational context and examples\n\nWhat would you like to know about teaching? 🎓"
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

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole={isStudent ? "student" : "teacher"}
      title="TeachMate"
      subtitle={isStudent ? "Your AI Learning Companion" : "Your AI Teaching Assistant"}
      activeMenu="copilot"
      hideHeaderIcons={true}
    >

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Chat Interface - Always show */}
          <ScrollArea className="flex-1 pr-2 sm:pr-4 p-4 sm:p-6" ref={scrollAreaRef}>
              <div className="space-y-4 sm:space-y-6 pb-6">
                {/* Sample Prompts - Show only when no messages */}
                {messages.length === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center py-4 sm:py-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl mb-2">How can I help you teach better?</h2>
                    <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                      Try one of these suggestions or ask your own question
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
                      {samplePrompts.map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="rounded-2xl h-auto py-2 px-3 sm:py-3 sm:px-4 text-left justify-start hover-lift text-xs sm:text-sm"
                          onClick={() => handlePromptClick(prompt)}
                        >
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <span className="text-xs sm:text-sm leading-tight">{prompt}</span>
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
                    <Card className={`rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card'
                    }`}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="prose prose-sm max-w-none">
                          {message.content.split('\n').map((line, index) => {
                            // Format bullet points and numbered lists
                            if (line.trim().startsWith('✅') || line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                              return (
                                <div key={index} className="flex items-start gap-3 mb-3">
                                  <span className="text-primary font-semibold mt-1 flex-shrink-0 text-lg">•</span>
                                  <span className="text-sm leading-relaxed">{line.trim().replace(/^[✅•\-\*]\s*/, '')}</span>
                                </div>
                              );
                            }
                            // Format headers (lines that are all caps or start with #)
                            if (line.trim().match(/^[A-Z\s]+$/) && line.trim().length > 3) {
                              return (
                                <div key={index} className="font-semibold text-primary mb-4 mt-6 first:mt-0 text-base border-b border-primary/20 pb-2">
                                  {line.trim()}
                                </div>
                              );
                            }
                            // Format bold text (text between **)
                            if (line.includes('**')) {
                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <div key={index} className="mb-3">
                                  {parts.map((part, partIndex) => 
                                    part.startsWith('**') && part.endsWith('**') ? (
                                      <strong key={partIndex} className="font-semibold text-primary">
                                        {part.slice(2, -2)}
                                      </strong>
                                    ) : (
                                      <span key={partIndex}>{part}</span>
                                    )
                                  )}
                                </div>
                              );
                            }
                            // Format numbered lists
                            if (line.trim().match(/^\d+\./)) {
                              return (
                                <div key={index} className="flex items-start gap-3 mb-3">
                                  <span className="text-primary font-semibold mt-1 flex-shrink-0 text-sm bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center">
                                    {line.trim().match(/^\d+/)?.[0]}
                                  </span>
                                  <span className="text-sm leading-relaxed">{line.trim().replace(/^\d+\.\s*/, '')}</span>
                                </div>
                              );
                            }
                            // Regular text with better spacing
                            return line.trim() ? (
                              <div key={index} className="mb-3 text-sm leading-relaxed">{line}</div>
                            ) : (
                              <div key={index} className="mb-4"></div>
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
                        <span className="text-sm text-muted-foreground">TeachMate is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              </div>
            </ScrollArea>

          {/* Input Area - Fixed at bottom */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-3 sm:p-4">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
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
                      className="min-h-[40px] sm:min-h-[44px] max-h-24 sm:max-h-32 resize-none rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
    </SharedLayout>
  );
}

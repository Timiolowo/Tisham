import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { 
  ArrowLeft, Send, Paperclip, Smile, Users, Search, Loader2, ChevronLeft, ChevronRight, Menu
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { 
  getChatMessages, 
  sendChatMessage, 
  subscribeToChat,
  isSupabaseConfigured 
} from "../lib/supabase";
import { toast } from "sonner@2.0.3";

interface ClassChatProps {
  onBack: () => void;
}

interface Message {
  id: number | string;
  sender: string;
  role: 'teacher' | 'student';
  content: string;
  time: string;
  isCurrentUser?: boolean;
}

export function ClassChat({ onBack }: ClassChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [currentClassIndex, setCurrentClassIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Mrs. Okonkwo",
      role: "teacher",
      content: "Good morning class! Don't forget your robotics assignment is due Friday.",
      time: "9:30 AM",
      isCurrentUser: true
    },
    {
      id: 2,
      sender: "Chioma A.",
      role: "student",
      content: "Good morning Ma! Can we get an extension till Monday?",
      time: "9:35 AM"
    },
    {
      id: 3,
      sender: "Ahmed K.",
      role: "student",
      content: "Ma, please I have a question about the sensors part.",
      time: "9:40 AM"
    },
    {
      id: 4,
      sender: "Mrs. Okonkwo",
      role: "teacher",
      content: "Ahmed, feel free to ask! For the extension, let me think about it and get back to you all.",
      time: "9:42 AM",
      isCurrentUser: true
    },
    {
      id: 5,
      sender: "Blessing O.",
      role: "student",
      content: "Thank you Ma! 🙏",
      time: "9:43 AM"
    }
  ]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Multiple classes for navigation
  const classes = [
    { id: 'jss3a-math', name: 'JSS 3A Mathematics', students: 32 },
    { id: 'jss2b-math', name: 'JSS 2B Mathematics', students: 28 },
    { id: 'jss1a-math', name: 'JSS 1A Mathematics', students: 30 },
  ];
  
  const currentClass = classes[currentClassIndex];
  const classId = currentClass?.id || "demo-class";

  // Load messages from Supabase
  useEffect(() => {
    if (isSupabaseConfigured() && user) {
      loadMessages();
      setupRealtime();
    }
  }, [user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const chatMessages = await getChatMessages(classId);
      if (chatMessages.length > 0) {
        const formattedMessages = chatMessages.map(msg => ({
          id: msg.id,
          sender: msg.sender_name,
          role: msg.sender_role,
          content: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          isCurrentUser: user && msg.sender_id === user.id
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const setupRealtime = () => {
    if (!user) return;

    const subscription = subscribeToChat(classId, (newMessage) => {
      const formattedMessage: Message = {
        id: newMessage.id,
        sender: newMessage.sender_name,
        role: newMessage.sender_role,
        content: newMessage.message,
        time: new Date(newMessage.created_at).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        isCurrentUser: user && newMessage.sender_id === user.id
      };
      
      setMessages(prev => [...prev, formattedMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    if (!isSupabaseConfigured() || !user) {
      // Fallback for demo mode
      const newMessage: Message = {
        id: messages.length + 1,
        sender: user?.full_name || "User",
        role: user?.role === 'teacher' ? 'teacher' : 'student',
        content: message,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isCurrentUser: true
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      toast.success("Message sent (demo mode)");
      return;
    }

    setIsSending(true);
    try {
      await sendChatMessage({
        class_id: classId,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_role: user.role === 'teacher' ? 'teacher' : 'student',
        message: message.trim()
      });
      
      setMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              {/* Mobile Class Selector Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>My Classes</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] mt-6">
                    <div className="space-y-2">
                      {classes.map((cls, idx) => (
                        <Button
                          key={cls.id}
                          variant={idx === currentClassIndex ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentClassIndex(idx)}
                          className="w-full justify-start rounded-xl"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium truncate">{cls.name}</p>
                            <p className="text-xs text-muted-foreground">{cls.students} students</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold truncate">{currentClass?.name}</h1>
                  <p className="text-xs text-muted-foreground truncate">{currentClass?.students} students online</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0 hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Class List (Desktop only) */}
        <div className="hidden md:flex md:w-64 lg:w-72 bg-card/50 backdrop-blur-sm border-r flex-col">
          <div className="p-4 border-b">
            <Button variant="ghost" size="sm" onClick={onBack} className="w-full justify-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {classes.map((cls, idx) => (
                <Button
                  key={cls.id}
                  variant={idx === currentClassIndex ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentClassIndex(idx)}
                  className="w-full justify-start rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{cls.name}</p>
                    <p className="text-xs text-muted-foreground">{cls.students} students</p>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col p-4 sm:p-6">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''} animate-fade-in`}
                >
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback className={`text-xs sm:text-sm ${
                      msg.role === 'teacher' ? 'gradient-primary text-white' : 'bg-muted'
                    }`}>
                      {msg.sender.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[60%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-semibold">{msg.sender}</span>
                      {msg.role === 'teacher' && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">Teacher</Badge>
                      )}
                    </div>

                    <Card className={`rounded-2xl ${
                      msg.isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card'
                    }`}>
                      <CardContent className="p-3">
                        <p className="text-sm">{msg.content}</p>
                      </CardContent>
                    </Card>

                    <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-4 pt-4 border-t">
            <Card className="rounded-3xl glass-card">
              <CardContent className="p-3">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-xl">
                    <Paperclip className="w-5 h-5" />
                  </Button>

                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="rounded-2xl border-0 bg-muted/50 text-sm"
                    />
                  </div>

                  <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-xl">
                    <Smile className="w-5 h-5" />
                  </Button>

                  <Button 
                    size="icon" 
                    onClick={handleSend}
                    className="rounded-xl gradient-primary flex-shrink-0"
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground mt-2">
              Messages are visible to all class members
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

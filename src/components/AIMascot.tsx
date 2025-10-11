import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Move } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface AIMascotProps {
  onOpenChat?: () => void;
  currentPage?: string;
  isAuthenticated?: boolean;
}

export function AIMascot({ onOpenChat, currentPage, isAuthenticated }: AIMascotProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const mascotRef = useRef<HTMLDivElement>(null);

  const authenticatedTips = [
    "💡 Click 'Learn with AI' on any lesson to get simplified explanations!",
    "🎯 Complete quizzes to earn XP and unlock badges!",
    "🔥 Build your streak by learning every day!",
    "🚀 Explore the Concept Explorer to discover new topics!",
    "⭐ Share your achievements with classmates!"
  ];

  const landingTips = [
    "👋 Welcome to Tisham! Login to start creating amazing lessons!",
    "🚀 Get started by registering your school to access all features!",
    "💡 AI-powered lesson planning awaits you after login!",
    "🎯 Join thousands of teachers already using Tisham!",
    "⭐ Experience the future of education technology!"
  ];

  const tips = (currentPage === 'landing' && !isAuthenticated) ? landingTips : authenticatedTips;
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  // Visibility logic
  const shouldShow = () => {
    if (currentPage === 'copilot') return false; // Don't show on copilot page
    if (currentPage === 'landing') return true; // Show on landing page
    if (currentPage === 'login' || currentPage === 'register') return false; // Don't show on auth pages
    return isAuthenticated; // Show on authenticated pages only
  };

  // Navigation logic - only allow navigation if authenticated
  const handleOpenChat = () => {
    if (currentPage === 'landing' && !isAuthenticated) {
      // On landing page without authentication, don't navigate to copilot
      return;
    }
    if (onOpenChat) {
      onOpenChat();
    }
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mascotRef.current) return;
    setIsDragging(true);
    const rect = mascotRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Don't render if shouldn't show
  if (!shouldShow()) return null;

  if (isMinimized) {
    return (
      <div 
        ref={mascotRef}
        className="fixed z-50 animate-fade-in cursor-move"
        style={{
          left: position.x || undefined,
          bottom: position.y || 24,
          right: position.x ? undefined : 24,
          top: position.y ? undefined : undefined,
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary shadow-lg hover-lift flex items-center justify-center animate-float group relative"
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse-gentle"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <Move className="w-2 h-2 text-white" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={mascotRef}
      className="fixed z-50 animate-slide-up cursor-move"
      style={{
        left: position.x || undefined,
        bottom: position.y || 24,
        right: position.x ? undefined : 24,
        top: position.y ? undefined : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="w-72 sm:w-80 rounded-3xl shadow-2xl glass-card border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">Tishami, your AI copilot</h4>
              <p className="text-xs text-muted-foreground">
                {randomTip}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setIsMinimized(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 rounded-2xl text-xs"
              onClick={() => {
                setIsMinimized(true);
                handleOpenChat();
              }}
            >
              {currentPage === 'landing' && !isAuthenticated ? 'Login First' : 'Ask Tishami'}
            </Button>
            <Button size="sm" variant="outline" className="rounded-2xl text-xs" onClick={() => setIsMinimized(true)}>
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

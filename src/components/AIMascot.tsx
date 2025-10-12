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
    // Only start dragging if clicking on the drag handle or the mascot itself
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault();
      setIsDragging(true);
      const rect = mascotRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start dragging if touching the drag handle or the mascot itself
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault();
      setIsDragging(true);
      const rect = mascotRef.current?.getBoundingClientRect();
      if (rect && e.touches[0]) {
        setDragOffset({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - (mascotRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (mascotRef.current?.offsetHeight || 0);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    if (e.touches[0]) {
      const newX = e.touches[0].clientX - dragOffset.x;
      const newY = e.touches[0].clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (mascotRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (mascotRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.body.style.userSelect = '';
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
          left: position.x || window.innerWidth - 80,
          top: position.y || window.innerHeight - 80,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        data-drag-handle
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary shadow-lg hover-lift flex items-center justify-center animate-float group relative"
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse-gentle"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center" title="Drag to move">
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
        left: position.x || window.innerWidth - 320,
        top: position.y || window.innerHeight - 200,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-drag-handle
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
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-muted/20 rounded flex items-center justify-center cursor-move" title="Drag to move">
                <Move className="w-2 h-2 text-muted-foreground" />
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

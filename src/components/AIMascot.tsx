import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface AIMascotProps {
  onOpenChat?: () => void;
}

export function AIMascot({ onOpenChat }: AIMascotProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  const tips = [
    "💡 Click 'Learn with AI' on any lesson to get simplified explanations!",
    "🎯 Complete quizzes to earn XP and unlock badges!",
    "🔥 Build your streak by learning every day!",
    "🚀 Explore the Concept Explorer to discover new topics!",
    "⭐ Share your achievements with classmates!"
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary shadow-lg hover-lift flex items-center justify-center animate-float group"
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse-gentle"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <Card className="w-72 sm:w-80 rounded-3xl shadow-2xl glass-card border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">TeachMate, your AI copilot</h4>
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
                if (onOpenChat) {
                  onOpenChat();
                }
              }}
            >
              Ask TeachMate
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

import React, { useState } from "react";
import { Button } from "./ui/button";
import { 
  Home, BookOpen, Trophy, TrendingUp, Settings, 
  Sparkles, X, Zap, Menu, Bell, User
} from "lucide-react";
import { Progress } from "./ui/progress";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { ThemeToggle } from "./ThemeToggle";

interface StudentNavigationProps {
  onNavigate: (page: any, role?: any) => void;
  currentPage?: string;
  title?: string;
  subtitle?: string;
  showHeaderIcons?: boolean;
  children: React.ReactNode;
}

export function StudentNavigation({ 
  onNavigate, 
  currentPage = 'dashboard',
  title = "Dashboard",
  subtitle = "Welcome back!",
  showHeaderIcons = true,
  children 
}: StudentNavigationProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Student navigation menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => onNavigate('dashboard') },
    { id: 'lessons', label: 'Lessons', icon: BookOpen, onClick: () => onNavigate('student-dashboard') },
    { id: 'challenges', label: 'Challenges', icon: Trophy, onClick: () => onNavigate('student-dashboard') },
    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp, onClick: () => onNavigate('student-dashboard') },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: () => onNavigate('settings') },
  ];

  // Student stats (placeholder)
  const studentStats = {
    level: 1,
    xp: 0,
    nextLevelXP: 100
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'w-full' : sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r h-full flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSidebarCollapsed(false)}
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sm">TeachMate</p>
                <p className="text-xs text-muted-foreground">School</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6"
              onClick={() => setSidebarCollapsed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.id === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* XP Progress in Sidebar */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Level {studentStats.level}</span>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <Progress 
              value={(studentStats.xp / studentStats.nextLevelXP) * 100} 
              variant="xp" 
              showLabel 
            />
            <p className="text-xs text-muted-foreground">
              {studentStats.xp} / {studentStats.nextLevelXP} XP
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-full">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader className="p-4">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-sm font-medium">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            {showHeaderIcons && (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

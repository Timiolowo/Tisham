import React, { useState } from "react";
import { Button } from "./ui/button";
import { Bell, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { SharedSidebar } from "./SharedSidebar";

interface SharedLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: any, role?: any) => void;
  userRole: 'teacher' | 'student' | 'school_admin';
  title: string;
  subtitle: string;
  hideHeaderIcons?: boolean;
  activeMenu?: string;
}

export function SharedLayout({ children, onNavigate, userRole, title, subtitle, hideHeaderIcons = false, activeMenu: propActiveMenu }: SharedLayoutProps) {
  const [activeMenu, setActiveMenu] = useState(propActiveMenu || 'dashboard');

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <SharedSidebar 
      onNavigate={onNavigate}
      userRole={userRole}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      mobile={mobile}
    />
  );

  return (
    <div className="flex h-screen max-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:block h-full">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Navigation */}
        <header className="bg-card/80 backdrop-blur-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 sm:w-96">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Navigate between different sections</SheetDescription>
                  </SheetHeader>
                  <div className="h-full">
                    <Sidebar mobile />
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg truncate">{title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              {!hideHeaderIcons && (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

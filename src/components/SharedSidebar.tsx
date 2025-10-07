import { useState } from "react";
import { Button } from "./ui/button";
import { 
  Home, FileText, ClipboardList, Languages, MessageSquare, 
  BookOpen, BarChart3, Map, Settings, Bell, User, Menu,
  Sparkles, Clock, BookMarked, Award, Users, X, Brain
} from "lucide-react";

interface SharedSidebarProps {
  onNavigate: (page: any, role?: any) => void;
  userRole: 'teacher' | 'student' | 'school_admin';
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  mobile?: boolean;
}

export function SharedSidebar({ onNavigate, userRole, activeMenu, setActiveMenu, mobile = false }: SharedSidebarProps) {
  // Persistent sidebar state - remember user's preference
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (mobile) return false; // Always expanded on mobile
    // Check localStorage for saved preference, default to collapsed
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : true;
  });

  // Save sidebar state to localStorage when it changes
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    if (!mobile) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }
  };

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'class-management', label: 'My Classes', icon: Users },
    { id: 'lesson-generator', label: 'Generate Lesson', icon: FileText },
    { id: 'assessment', label: 'Create Assessment', icon: ClipboardList },
    { id: 'simplify', label: 'Simplify / Translate', icon: Languages },
    { id: 'copilot', label: 'TeCHATer', icon: MessageSquare },
    { id: 'library', label: 'Resource Library', icon: BookOpen },
    { id: 'admin', label: 'School Dashboard', icon: BarChart3 },
    { id: 'pathway', label: 'Learning Pathway', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const studentMenuItems = [
    { id: 'lessons', label: 'My Lessons', icon: BookOpen },
    { id: 'explorer', label: 'Concept Explorer', icon: Brain, onClick: () => onNavigate('concept-explorer') },
    { id: 'curriculum', label: 'My Curriculum', icon: BookMarked, onClick: () => onNavigate('my-curriculum') },
    { id: 'class-chat', label: 'Class Chat', icon: Users, onClick: () => onNavigate('class-chat') },
    { id: 'copilot', label: 'AI Chat', icon: MessageSquare, onClick: () => onNavigate('copilot') },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: () => onNavigate('settings') },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'School Dashboard', icon: BarChart3 },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  const getMenuItems = () => {
    if (userRole === 'teacher') return teacherMenuItems;
    if (userRole === 'student') return studentMenuItems;
    if (userRole === 'school_admin') return adminMenuItems;
    return teacherMenuItems; // fallback
  };

  const menuItems = getMenuItems();

  return (
    <div className={`${mobile ? 'w-full' : (sidebarCollapsed ? 'w-16' : 'w-64')} bg-card ${mobile ? '' : 'border-r'} h-full flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => !mobile && handleSidebarToggle(false)}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {(!sidebarCollapsed || mobile) && (
              <div className="min-w-0">
                <p className="font-semibold text-sm">TeachMate</p>
                <p className="text-xs text-muted-foreground">St. Mary's School</p>
              </div>
            )}
          </div>
          {!mobile && !sidebarCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6"
              onClick={() => handleSidebarToggle(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveMenu(item.id);
                  onNavigate(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeMenu === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
              title={(!sidebarCollapsed || mobile) ? undefined : item.label}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {(!sidebarCollapsed || mobile) && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

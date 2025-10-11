import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { SchoolRegistration } from "./components/SchoolRegistration";
import { RegistrationSuccess } from "./components/RegistrationSuccess";
import { EmailConfirmationSuccess } from "./components/EmailConfirmationSuccess";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { LessonGenerator } from "./components/LessonGenerator";
import { AssessmentGenerator } from "./components/AssessmentGenerator";
import { CopilotChat } from "./components/CopilotChat";
import { SimplifyTranslate } from "./components/SimplifyTranslate";
import { ResourceLibrary } from "./components/ResourceLibrary";
import { LearningPathway } from "./components/LearningPathway";
import { AdminDashboard } from "./components/AdminDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { ClassManagement } from "./components/ClassManagement";
import { ClassDetailsPage } from "./components/ClassDetailsPage";
import { ConceptExplorer } from "./components/ConceptExplorer";
import { SettingsPage } from "./components/SettingsPage";
import { ClassChat } from "./components/ClassChat";
import { LearnWithAIPage } from "./components/LearnWithAIPage";
import { CertificateGenerator } from "./components/CertificateGenerator";
import { TeacherLearning } from "./components/TeacherLearning";
import { MyCurriculumPage } from "./components/MyCurriculumPage";
import { EditResourcePage } from "./components/EditResourcePage";
import { StartLearningPage } from "./components/StartLearningPage";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { AIMascot } from "./components/AIMascot";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SecurityWarning } from "./components/SecurityWarning";

type Page = 
  | 'landing' 
  | 'register' 
  | 'registration-success'
  | 'email-confirmation-success'
  | 'reset-password'
  | 'login' 
  | 'dashboard' 
  | 'lesson-generator' 
  | 'assessment'
  | 'copilot'
  | 'simplify'
  | 'library'
  | 'pathway'
  | 'admin'
  | 'student-dashboard'
  | 'class-management'
  | 'class-details'
  | 'class-chat'
  | 'concept-explorer'
  | 'learn-with-ai'
  | 'teacher-learning'
  | 'certificate'
  | 'my-curriculum'
  | 'edit-resource'
  | 'settings'
  | 'start-learning';

type UserRole = 'admin' | 'teacher' | 'student';

export interface LessonPlan {
  topic: string;
  subject: string;
  class: string;
  objectives: string[];
  materials: string[];
  lessonSteps: Array<{
    time: string;
    activity: string;
    description: string;
  }>;
  homework: string;
  localExamples: string[];
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [currentLessonPlan, setCurrentLessonPlan] = useState<LessonPlan | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('teacher');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [learningResourceTitle, setLearningResourceTitle] = useState<string>('');
  const [learningResourceId, setLearningResourceId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<{email?: string, schoolCode?: string}>({});
  const { user, logout, isLoading } = useAuth();

  // URL-based routing with authentication check
  useEffect(() => {
    // Don't run authentication checks while still loading
    if (isLoading) {
      return;
    }

    const getPageFromURL = (): Page => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      // Handle hash-based routing
      if (hash) {
        const page = hash.substring(1) as Page;
        if (['landing', 'register', 'registration-success', 'email-confirmation-success', 'reset-password', 'login', 'forgot-password', 'dashboard', 'lesson-generator', 'assessment', 'copilot', 'simplify', 'library', 'pathway', 'admin', 'student-dashboard', 'class-management', 'class-details', 'class-chat', 'concept-explorer', 'learn-with-ai', 'teacher-learning', 'certificate', 'my-curriculum', 'edit-resource', 'settings'].includes(page)) {
          return page;
        }
      }
      
      // Handle path-based routing
      if (path === '/' || path === '/landing') return 'landing';
      if (path === '/register') return 'register';
      if (path === '/registration-success') return 'registration-success';
      if (path === '/email-confirmation-success') return 'email-confirmation-success';
      if (path === '/reset-password') return 'reset-password';
      if (path === '/login') return 'login';
      if (path === '/forgot-password') return 'forgot-password';
      if (path === '/dashboard') return 'dashboard';
      if (path === '/lesson-generator') return 'lesson-generator';
      if (path === '/assessment') return 'assessment';
      if (path === '/copilot') return 'copilot';
      if (path === '/simplify') return 'simplify';
      if (path === '/library') return 'library';
      if (path === '/pathway') return 'pathway';
      if (path === '/admin') return 'admin';
      if (path === '/student-dashboard') return 'student-dashboard';
      if (path === '/class-management') return 'class-management';
      if (path === '/class-details') return 'class-details';
      if (path === '/class-chat') return 'class-chat';
      if (path === '/concept-explorer') return 'concept-explorer';
      if (path === '/learn-with-ai') return 'learn-with-ai';
      if (path === '/teacher-learning') return 'teacher-learning';
      if (path === '/certificate') return 'certificate';
      if (path === '/my-curriculum') return 'my-curriculum';
      if (path === '/edit-resource') return 'edit-resource';
      if (path === '/settings') return 'settings';
      
      return 'landing';
    };

    const page = getPageFromURL();
    
    // Check if the page requires authentication and user is not logged in
    if (isProtectedPage(page) && !user) {
      // Redirect to login page
      setCurrentPage('login');
      window.history.replaceState({}, '', '/login');
    } else if (user && (page === 'landing' || page === 'login')) {
      // If user is logged in and on landing/login page, redirect to dashboard
      setCurrentPage('dashboard');
      window.history.replaceState({}, '', '/dashboard');
    } else {
      setCurrentPage(page);
    }

    // Listen for browser back/forward buttons
    const handlePopState = () => {
      const page = getPageFromURL();
      
      // Check authentication for the new page
      if (isProtectedPage(page) && !user) {
        setCurrentPage('login');
        window.history.replaceState({}, '', '/login');
      } else if (user && (page === 'landing' || page === 'login')) {
        // If user is logged in and on landing/login page, redirect to dashboard
        setCurrentPage('dashboard');
        window.history.replaceState({}, '', '/dashboard');
      } else {
        setCurrentPage(page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, isLoading]); // Re-run when user authentication state or loading state changes

  const navigate = (page: Page, role?: UserRole, resourceId?: string, resourceTitle?: string, regData?: {email?: string, schoolCode?: string}) => {
    setCurrentPage(page);
    if (role) setUserRole(role);
    if (resourceId !== undefined) setEditingResourceId(resourceId);
    if (resourceTitle) {
      setLearningResourceTitle(resourceTitle);
      setLearningResourceId(resourceId || null);
    }
    if (regData) setRegistrationData(regData);
    
    // Update URL to reflect current page
    const url = page === 'landing' ? '/' : `/${page}`;
    window.history.pushState({}, '', url);
    
    // Scroll to top when navigating to a new page with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveLessonPlan = (lesson: LessonPlan) => {
    setCurrentLessonPlan(lesson);
  };

  const handleLogout = async () => {
    try {
      // Call the auth context logout function to clear session
      await logout();
      
      // Reset all app state
      setCurrentPage('landing');
      setUserRole('teacher');
      setCurrentLessonPlan(null);
      setEditingResourceId(undefined);
      setLearningResourceTitle('');
      setLearningResourceId(null);
      
      // Clear URL and redirect to landing page
      window.history.replaceState({}, '', '/');
      
      // Force a page reload to ensure all state is cleared
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to landing page
      setCurrentPage('landing');
      window.history.replaceState({}, '', '/');
    }
  };

  // Check authentication for protected pages
  const isProtectedPage = (page: Page): boolean => {
    const protectedPages = [
      'dashboard', 'lesson-generator', 'assessment', 'copilot', 'simplify', 
      'library', 'pathway', 'admin', 'student-dashboard', 'class-management', 
      'class-details', 'class-chat', 'concept-explorer', 'learn-with-ai', 
      'teacher-learning', 'certificate', 'my-curriculum', 'edit-resource', 'settings'
    ];
    return protectedPages.includes(page);
  };

  // Removed automatic redirect - users stay on current page even if session expires

  const renderPage = () => {
    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Check if current page requires authentication
    if (isProtectedPage(currentPage) && !user) {
      // Redirect to login page if user is not authenticated
      navigate('login');
      return <LoginPage onNavigate={navigate} />;
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} user={user} />;
      case 'register':
        return <SchoolRegistration onNavigate={navigate} />;
      case 'registration-success':
        return <RegistrationSuccess onNavigate={navigate} userRole={userRole} email={registrationData.email} schoolCode={registrationData.schoolCode} />;
      case 'email-confirmation-success':
        return <EmailConfirmationSuccess onNavigate={navigate} email={registrationData.email} />;
      case 'reset-password':
        return <ResetPasswordPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} user={user} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={navigate} />;
      case 'dashboard':
        if (user?.role === 'student') {
          return <StudentDashboard onNavigate={navigate} />;
        } else if (user?.role === 'school_admin') {
          // School admins can access both admin dashboard and teacher dashboard
          // For now, show teacher dashboard as the default, with admin access via navigation
          return <TeacherDashboard onNavigate={navigate} />;
        }
        return <TeacherDashboard onNavigate={navigate} />;
      case 'lesson-generator':
        return <LessonGenerator onNavigate={navigate} onSave={saveLessonPlan} />;
      case 'assessment':
        return <AssessmentGenerator onNavigate={navigate} lessonPlan={currentLessonPlan} />;
      case 'copilot':
        return <CopilotChat onNavigate={navigate} />;
      case 'simplify':
        return <SimplifyTranslate onNavigate={navigate} />;
      case 'library':
        return <ResourceLibrary onBack={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'pathway':
        return <LearningPathway onBack={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={navigate} onBack={() => navigate('dashboard')} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={navigate} />;
      case 'class-management':
        return <ClassManagement onBack={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'class-details':
        return <ClassDetailsPage onNavigate={navigate} classId={currentPage?.classId || '1'} />;
      case 'class-chat':
        return <ClassChat onNavigate={navigate} />;
      case 'concept-explorer':
        return <ConceptExplorer onBack={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'learn-with-ai':
        return <LearnWithAIPage 
          onBack={() => navigate('dashboard')} 
          resourceTitle={learningResourceTitle}
          lessonId={learningResourceId}
        />;
      case 'teacher-learning':
        return <TeacherLearning onBack={() => navigate('dashboard')} />;
      case 'certificate':
        return <CertificateGenerator onBack={() => navigate('dashboard')} />;
      case 'my-curriculum':
        return <MyCurriculumPage onBack={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'edit-resource':
        return <EditResourcePage 
          onBack={() => {
            setEditingResourceId(null);
            navigate('library');
          }} 
          onNavigate={navigate}
          resourceId={editingResourceId}
        />;
      case 'settings':
        return <SettingsPage onBack={() => navigate('dashboard')} onLogout={handleLogout} onNavigate={navigate} userRole={user?.role || 'teacher'} />;
      case 'start-learning':
        return <StartLearningPage onNavigate={navigate} courseId={currentPage?.courseId} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light">
      {renderPage()}
      <AIMascot 
        onOpenChat={() => navigate('copilot')} 
        currentPage={currentPage}
        isAuthenticated={!!user}
      />
      <Toaster />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SecurityWarning />
      <AppContent />
    </AuthProvider>
  );
}

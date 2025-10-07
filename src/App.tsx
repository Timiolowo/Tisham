import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SchoolRegistration } from "./components/SchoolRegistration";
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
import { DebugUser } from "./components/DebugUser";
import { MyCurriculumPage } from "./components/MyCurriculumPage";
import { EditResourcePage } from "./components/EditResourcePage";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { AIMascot } from "./components/AIMascot";
import { AuthProvider } from "./contexts/AuthContext";
import "./lib/debug-helpers"; // Load debug helpers for browser console

type Page = 
  | 'landing' 
  | 'register' 
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
  | 'settings';

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

  const navigate = (page: Page, role?: UserRole, resourceId?: string, resourceTitle?: string) => {
    setCurrentPage(page);
    if (role) setUserRole(role);
    if (resourceId !== undefined) setEditingResourceId(resourceId);
    if (resourceTitle) {
      setLearningResourceTitle(resourceTitle);
      setLearningResourceId(resourceId || null);
    }
  };

  const saveLessonPlan = (lesson: LessonPlan) => {
    setCurrentLessonPlan(lesson);
  };

  const handleLogout = () => {
    setCurrentPage('landing');
    setUserRole('teacher');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'register':
        return <SchoolRegistration onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'debug':
        return <DebugUser onBack={() => navigate('landing')} />;
      case 'dashboard':
        if (userRole === 'student') {
          return <StudentDashboard onNavigate={navigate} />;
        } else if (userRole === 'school_admin') {
          return <AdminDashboard onNavigate={navigate} onBack={() => navigate('landing')} />;
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
        return <ClassChat onBack={() => navigate('dashboard')} />;
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
        return <SettingsPage onBack={() => navigate('dashboard')} onLogout={handleLogout} userRole={userRole} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light">
      {renderPage()}
      <AIMascot onOpenChat={() => navigate('copilot')} />
      <Toaster />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, BookOpen, MessageSquare, TrendingUp, CheckCircle, ClipboardList } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollReveal } from "./ScrollReveal";

interface LandingPageProps {
  onNavigate: (page: any, role?: any) => void;
  user?: any;
}

export function LandingPage({ onNavigate, user }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Tisham</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button onClick={() => onNavigate('register')} className="text-sm">
              <span className="hidden sm:inline">Register School</span>
              <span className="sm:hidden">Register</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="right" delay={0.1}>
            <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full">
              Your everyday teaching partner
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Empowering Teachers from Chalkboard to Chatbot
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Adapt to the new national curriculum with AI-powered lesson planning, real-time assistance, and multilingual support for secondary schools across Nigeria.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="rounded-2xl" onClick={() => onNavigate(user ? 'dashboard' : 'login')}>
                {user ? `Continue to Account` : 'Login'}
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Free for Public Schools</span>
              </div>
            </div>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.2}>
            <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/flagged/photo-1579133311477-9121405c78dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdGVhY2hlciUyMGNsYXNzcm9vbSUyMHN0dWRlbnRzfGVufDF8fHx8MTc1OTYwNDM4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Teachers and students in classroom"
                className="w-full h-auto"
              />
            </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Four powerful features to transform your teaching</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Lesson Generation</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Generate comprehensive lesson plans aligned with the new curriculum in seconds. 
                Include local examples, activities, and assessments.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 hover:border-secondary/20">
            <CardHeader className="p-6">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-xl mb-3">Real-Time Copilot</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Get instant help with explanations, translations to local languages, 
                and teaching suggestions. Your AI teaching assistant is always ready.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 hover:border-accent/20">
            <CardHeader className="p-6">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl mb-3">Student Engagement</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Create assessments, track progress, and provide personalized learning materials. 
                Students can access resources and get AI help anytime.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 hover:border-green-500/20">
            <CardHeader className="p-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-xl mb-3">Assessment Generator</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Create quizzes, tests, and exams automatically. Generate questions aligned with curriculum 
                and difficulty levels for comprehensive student evaluation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>


      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="rounded-3xl bg-gradient-to-r from-primary to-secondary text-white shadow-2xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Get Started Today</h2>
            <p className="text-lg mb-8 opacity-90">
              Transform your classroom with AI-powered teaching tools
            </p>
            <Button 
              size="lg" 
              className="rounded-2xl bg-white text-primary hover:bg-white/90"
              onClick={() => onNavigate('register')}
            >
              Register Your School
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-primary/5 to-secondary/5 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Tisham</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 Tisham. Built for Nigerian Education.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-sm font-medium">
              <span className="text-primary">🏆</span>
              <span>DFA 2025 Hackathon Solution by Team Rosh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

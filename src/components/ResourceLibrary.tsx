import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, FileText, ClipboardList, BookOpen, Edit, Languages, Share2, Download, Filter } from "lucide-react";
import { SharedLayout } from "./SharedLayout";

interface ResourceLibraryProps {
  onBack: () => void;
  onNavigate?: (page: any, role?: any) => void;
}

export function ResourceLibrary({ onBack, onNavigate }: ResourceLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    // Load resources from localStorage
    const saved = localStorage.getItem('teacherResources');
    if (saved) {
      setResources(JSON.parse(saved));
    } else {
      // Initialize with mock data
      const mockResources = initialResources.map((r, idx) => ({
        ...r,
        id: `resource-${idx + 1}`
      }));
      setResources(mockResources);
      localStorage.setItem('teacherResources', JSON.stringify(mockResources));
    }
  }, []);

  const initialResources = [
    {
      title: 'Introduction to Robotics',
      type: 'lesson',
      subject: 'Computer Science',
      classLevel: 'JSS 3',
      description: 'Comprehensive introduction to robotics and automation',
      content: 'Learn about robot components, sensors, and programming basics.',
      tags: ['Robotics', 'Technology'],
      assignToClasses: [],
      dueDate: ''
    },
    {
      title: 'Algebraic Expressions',
      type: 'lesson',
      subject: 'Mathematics',
      classLevel: 'JSS 2',
      description: 'Master algebraic expressions and equations',
      content: 'Learn variables, equations, and problem solving.',
      tags: ['Algebra', 'Mathematics'],
      assignToClasses: [],
      dueDate: ''
    },
    {
      title: 'Solar Energy Systems',
      type: 'lesson',
      subject: 'Physics',
      classLevel: 'JSS 3',
      description: 'Renewable energy through solar power',
      content: 'Explore solar panels and energy conversion.',
      tags: ['Solar', 'Energy', 'Physics'],
      assignToClasses: [],
      dueDate: ''
    },
  ];

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Resource Library"
      subtitle="Your lessons and teaching materials"
      activeMenu="library"
      hideHeaderIcons={true}
    >

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Search and Filter Bar */}
        <Card className="rounded-2xl mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources..."
                  className="pl-10 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="computer">Computer Science</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="robotics">Robotics</SelectItem>
                    <SelectItem value="solar-pv">Solar PV</SelectItem>
                    <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lesson">Lessons</SelectItem>
                    <SelectItem value="assessment">Assessments</SelectItem>
                    <SelectItem value="material">Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="text-base mt-1">{resources.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Lessons</p>
              <p className="text-base mt-1">{resources.filter(r => r.type === 'lesson').length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Assessments</p>
              <p className="text-base mt-1">{resources.filter(r => r.type === 'assessment').length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Materials</p>
              <p className="text-base mt-1">{resources.filter(r => r.type === 'material').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredResources.map((resource) => {
            const getIcon = (type: string) => {
              switch (type) {
                case 'lesson': return FileText;
                case 'assessment': return ClipboardList;
                case 'material': return BookOpen;
                default: return FileText;
              }
            };
            
            const Icon = getIcon(resource.type);
            
            return (
              <Card key={resource.id} className="rounded-2xl hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 text-base sm:text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">{resource.subject}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{resource.classLevel}</p>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg text-xs h-8"
                      onClick={() => onNavigate?.('edit-resource', undefined, resource.id)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                      <Languages className="w-3 h-3 mr-1" />
                      Translate
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-12 text-center">
              <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </SharedLayout>
  );
}

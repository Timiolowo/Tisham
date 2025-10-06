import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { saveLesson, isSupabaseConfigured } from "../lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, Save, FileText, BookOpen, ClipboardList, Users,
  Calendar, Tag, Plus, X, Upload, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface EditResourcePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  resourceId?: string | null;
}

export function EditResourcePage({ onBack, onNavigate, resourceId }: EditResourcePageProps) {
  const { user } = useAuth();
  const [resourceType, setResourceType] = useState<'lesson' | 'assessment' | 'material'>('lesson');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [assignToClasses, setAssignToClasses] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availableClasses = [
    { id: 'jss1-math', name: 'JSS 1 - Mathematics' },
    { id: 'jss2-math', name: 'JSS 2 - Mathematics' },
    { id: 'jss3-math', name: 'JSS 3 - Mathematics' },
    { id: 'jss1-eng', name: 'JSS 1 - English' },
    { id: 'jss2-eng', name: 'JSS 2 - English' },
  ];

  // Load existing resource if editing
  useEffect(() => {
    if (resourceId) {
      const resources = JSON.parse(localStorage.getItem('teacherResources') || '[]');
      const resource = resources.find((r: any) => r.id === resourceId);
      
      if (resource) {
        setIsEditing(true);
        setResourceType(resource.type);
        setTitle(resource.title);
        setDescription(resource.description);
        setSubject(resource.subject);
        setClassLevel(resource.classLevel);
        setContent(resource.content);
        setTags(resource.tags || []);
        setAssignToClasses(resource.assignToClasses || []);
        setDueDate(resource.dueDate || '');
      }
    }
  }, [resourceId]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleClassAssignment = (classId: string) => {
    if (assignToClasses.includes(classId)) {
      setAssignToClasses(assignToClasses.filter(id => id !== classId));
    } else {
      setAssignToClasses([...assignToClasses, classId]);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim() || !classLevel.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      // Use Supabase if configured, otherwise localStorage
      if (isSupabaseConfigured() && user) {
        // Save to Supabase
        const lessonData = {
          teacher_id: user.id,
          class_id: assignToClasses[0] || 'default-class', // Use first selected class
          title,
          subject,
          class_level: classLevel,
          content,
          objectives: tags,
          materials: [description],
        };

        // For now, always create new (update will be added later)
        await saveLesson(lessonData);
        toast.success(isEditing ? "Resource updated successfully! 🎉" : "Resource created and assigned successfully! 🎉");
      } else {
        // Fallback to localStorage
        const resource = {
          id: resourceId || `resource-${Date.now()}`,
          type: resourceType,
          title,
          description,
          subject,
          classLevel,
          content,
          tags,
          assignToClasses,
          dueDate,
          createdAt: isEditing ? undefined : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teacherId: user?.id || 'demo-teacher',
        };

        const existingResources = JSON.parse(localStorage.getItem('teacherResources') || '[]');
        
        if (isEditing) {
          const index = existingResources.findIndex((r: any) => r.id === resourceId);
          if (index !== -1) {
            existingResources[index] = resource;
          }
        } else {
          existingResources.push(resource);
        }
        
        localStorage.setItem('teacherResources', JSON.stringify(existingResources));

        // Save as curriculum
        if (assignToClasses.length > 0) {
          const curricula = JSON.parse(localStorage.getItem('assignedCurricula') || '[]');
          assignToClasses.forEach(classId => {
            curricula.push({
              id: `${Date.now()}-${classId}`,
              title,
              subject,
              teacher: user?.full_name || 'Teacher',
              assignedDate: new Date().toISOString(),
              dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 0,
              status: 'not-started',
              topics: tags,
              description,
              classId,
              resourceType,
              content
            });
          });
          localStorage.setItem('assignedCurricula', JSON.stringify(curricula));
        }

        toast.success(isEditing ? "Resource updated successfully! 🎉" : "Resource created and assigned successfully! 🎉");
      }

      onBack();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error("Failed to save resource. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getResourceIcon = () => {
    switch (resourceType) {
      case 'lesson': return <BookOpen className="w-5 h-5" />;
      case 'assessment': return <ClipboardList className="w-5 h-5" />;
      case 'material': return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-base font-bold truncate">
              {isEditing ? 'Edit Resource' : 'Create & Assign Resource'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              {isEditing ? 'Update your resource and assignments' : 'Create lessons, assessments, or materials and assign to your classes'}
            </p>
          </div>
          <Button onClick={handleSave} className="rounded-2xl gradient-success" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Save & Assign')}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Resource Type Selection */}
        <Card className="rounded-2xl glass-card">
          <CardHeader>
            <CardTitle>Resource Type</CardTitle>
            <CardDescription>Choose what type of resource you're creating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <Button
                variant={resourceType === 'lesson' ? 'default' : 'outline'}
                onClick={() => setResourceType('lesson')}
                className="h-auto py-6 rounded-2xl flex-col gap-2"
              >
                <BookOpen className="w-8 h-8" />
                <span>Lesson Plan</span>
              </Button>
              <Button
                variant={resourceType === 'assessment' ? 'default' : 'outline'}
                onClick={() => setResourceType('assessment')}
                className="h-auto py-6 rounded-2xl flex-col gap-2"
              >
                <ClipboardList className="w-8 h-8" />
                <span>Assessment</span>
              </Button>
              <Button
                variant={resourceType === 'material' ? 'default' : 'outline'}
                onClick={() => setResourceType('material')}
                className="h-auto py-6 rounded-2xl flex-col gap-2"
              >
                <FileText className="w-8 h-8" />
                <span>Study Material</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="rounded-2xl glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getResourceIcon()}
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Algebra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this resource..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English Language</SelectItem>
                    <SelectItem value="Science">Basic Science</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class Level *</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSS 1">JSS 1</SelectItem>
                    <SelectItem value="JSS 2">JSS 2</SelectItem>
                    <SelectItem value="JSS 3">JSS 3</SelectItem>
                    <SelectItem value="SSS 1">SSS 1</SelectItem>
                    <SelectItem value="SSS 2">SSS 2</SelectItem>
                    <SelectItem value="SSS 3">SSS 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="rounded-2xl glass-card">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              {resourceType === 'lesson' && 'Enter your lesson plan content, objectives, and activities'}
              {resourceType === 'assessment' && 'Add questions, instructions, and marking scheme'}
              {resourceType === 'material' && 'Add study notes, references, or reading materials'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={
                resourceType === 'lesson'
                  ? "Lesson Objectives:\n1. Students will understand...\n2. Students will be able to...\n\nLesson Content:\n..."
                  : resourceType === 'assessment'
                  ? "Questions:\n1. ...\n2. ...\n\nMarking Scheme:\n..."
                  : "Study Notes:\n\nKey Concepts:\n..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl min-h-[300px]"
            />

            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" className="rounded-xl flex-1">
                <LinkIcon className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags & Topics */}
        <Card className="rounded-2xl glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags & Topics
            </CardTitle>
            <CardDescription>Add tags to help organize and categorize this resource</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag or topic..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="rounded-xl flex-1"
              />
              <Button onClick={handleAddTag} className="rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="rounded-xl pr-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Settings */}
        <Card className="rounded-2xl glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assign to Classes
            </CardTitle>
            <CardDescription>Select which classes should receive this resource</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {availableClasses.map(cls => (
                <label
                  key={cls.id}
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-accent/5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assignToClasses.includes(cls.id)}
                    onChange={() => toggleClassAssignment(cls.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="flex-1">{cls.name}</span>
                  {assignToClasses.includes(cls.id) && (
                    <Badge variant="secondary" className="rounded-xl">Assigned</Badge>
                  )}
                </label>
              ))}
            </div>

            {assignToClasses.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date (Optional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 rounded-2xl">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 rounded-2xl gradient-success">
            <Save className="w-4 h-4 mr-2" />
            Save & Assign to {assignToClasses.length} Class{assignToClasses.length !== 1 ? 'es' : ''}
          </Button>
        </div>
      </main>
    </div>
  );
}

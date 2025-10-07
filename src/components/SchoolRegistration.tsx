import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, CheckCircle2, School, GraduationCap, Users, Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../contexts/AuthContext";
import OTPRegistration from './OTPRegistration';

interface RegistrationProps {
  onNavigate: (page: any, role?: any) => void;
}

export function SchoolRegistration({ onNavigate }: RegistrationProps) {
  const { register } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<'school' | 'teacher' | 'student'>('school');
  const [showOTP, setShowOTP] = useState(false);
  const [otpData, setOtpData] = useState<any>(null);
  const [schoolCode, setSchoolCode] = useState('TCN' + Math.floor(100000 + Math.random() * 900000));
  const [classCode] = useState('CLS' + Math.floor(1000 + Math.random() * 9000));

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    schoolCode: '',
    classCode: '',
    schoolName: '',
    schoolType: '',
    state: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    adminName: '',
    subjects: [] as string[],
    yearsExperience: 0,
    studentId: '',
    classLevel: '',
    parentEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        toast.error("Password should be at least 6 characters");
        return;
      }

      // Prepare registration data based on role
      const registrationData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: registrationType === 'school' ? formData.adminName : formData.fullName,
        role: registrationType === 'school' ? 'school_admin' : registrationType,
        ...(registrationType === 'school' && {
          schoolName: formData.schoolName,
          schoolType: formData.schoolType,
          state: formData.state,
          address: formData.address,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          adminName: formData.adminName,
        }),
        ...(registrationType === 'teacher' && {
          schoolCode: formData.schoolCode,
          subjects: formData.subjects,
          yearsExperience: formData.yearsExperience,
        }),
        ...(registrationType === 'student' && {
          classCode: formData.classCode,
          studentId: formData.studentId,
          classLevel: formData.classLevel,
          parentEmail: formData.parentEmail,
        }),
      };

      console.log('Registration data being sent:', registrationData);
      
      // Use confirmation email flow instead of OTP
      const response = await fetch('/.netlify/functions/register-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Show email confirmation screen
      setRegistered(true);
      if (result.schoolCode) {
        setSchoolCode(result.schoolCode);
      }
      toast.success("Registration successful! Please check your email and click the confirmation link to activate your account.");
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = (result: any) => {
    // Update school code if it's a school registration
    if (result.schoolCode && registrationType === 'school') {
      setSchoolCode(result.schoolCode);
    }
    setRegistered(true);
  };

  if (showOTP && otpData) {
    return <OTPRegistration onBack={() => setShowOTP(false)} registrationData={otpData} onSuccess={handleOTPSuccess} />;
  }

  if (registered) {
    const getSuccessMessage = () => {
      if (registrationType === 'school' && schoolCode) {
        return {
          title: "Registration Successful!",
          description: "Your school has been registered and data saved. Please check your email and click the confirmation link to activate your account.",
          buttonText: "Go to Login",
          showCode: true,
          codeLabel: "Your School Code",
          code: schoolCode
        };
      }
      return {
        title: "Check Your Email!",
        description: "We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.",
        buttonText: "Go to Login",
        showCode: false
      };
    };

    const success = getSuccessMessage();

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-3xl shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-base sm:text-base mb-4">{success.title}</h2>
            <p className="text-muted-foreground mb-8">
              {success.description}
            </p>
            {success.showCode && (
              <div className="bg-muted p-6 rounded-2xl mb-8">
                <p className="text-sm text-muted-foreground mb-2">{success.codeLabel}</p>
                <p className="text-base sm:text-base tracking-wider">{success.code}</p>
              </div>
            )}
            <div className="space-y-3">
              <Button className="w-full rounded-2xl" size="lg" onClick={() => onNavigate('login')}>
                {success.buttonText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => onNavigate('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="rounded-3xl shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-base sm:text-base">Create Account</CardTitle>
            <CardDescription>
              Join TeachMate as a School, Teacher, or Student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as 'school' | 'teacher' | 'student')} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl">
                <TabsTrigger value="school" className="rounded-lg">
                  <School className="w-4 h-4 mr-2" />
                  School
                </TabsTrigger>
                <TabsTrigger value="teacher" className="rounded-lg">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="student" className="rounded-lg">
                  <Users className="w-4 h-4 mr-2" />
                  Student
                </TabsTrigger>
              </TabsList>

              <TabsContent value="school" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input 
                  id="schoolName" 
                  placeholder="e.g., Government Secondary School"
                  className="rounded-xl"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolType">School Type</Label>
                  <Select required onValueChange={(value) => setFormData({...formData, schoolType: value})}>
                    <SelectTrigger id="schoolType" className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select required onValueChange={(value) => setFormData({...formData, state: value})}>
                    <SelectTrigger id="state" className="rounded-xl">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lagos">Lagos</SelectItem>
                      <SelectItem value="abuja">Abuja FCT</SelectItem>
                      <SelectItem value="kano">Kano</SelectItem>
                      <SelectItem value="rivers">Rivers</SelectItem>
                      <SelectItem value="oyo">Oyo</SelectItem>
                      <SelectItem value="kaduna">Kaduna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga">Local Government Area</Label>
                <Input 
                  id="lga" 
                  placeholder="e.g., Ikeja"
                  className="rounded-xl"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">School Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="admin@school.edu.ng"
                    className="rounded-xl"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    className="rounded-xl"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="mb-4">Administrator Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Full Name</Label>
                    <Input 
                      id="adminName" 
                      placeholder="e.g., Dr. Adewale Johnson"
                      className="rounded-xl"
                      value={formData.adminName}
                      onChange={(e) => setFormData({...formData, adminName: e.target.value, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="Create a strong password"
                      className="rounded-xl"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      placeholder="Re-enter your password"
                      className="rounded-xl"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

                  <Button type="submit" className="w-full rounded-2xl" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create School Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="teacher" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolCode">School Code</Label>
                    <Input 
                      id="schoolCode" 
                      placeholder="Enter your school code (e.g., TCN123456)"
                      className="rounded-xl"
                      value={formData.schoolCode}
                      onChange={(e) => setFormData({...formData, schoolCode: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Get this code from your school administrator</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherName">Full Name</Label>
                    <Input 
                      id="teacherName" 
                      placeholder="e.g., Mrs. Sarah Adebayo"
                      className="rounded-xl"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherEmail">Email Address</Label>
                    <Input 
                      id="teacherEmail" 
                      type="email"
                      placeholder="teacher@school.edu.ng"
                      className="rounded-xl"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Teaching</Label>
                    <Select required onValueChange={(value) => setFormData({...formData, subjects: [value]})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="social-studies">Social Studies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherPassword">Password</Label>
                    <Input 
                      id="teacherPassword" 
                      type="password"
                      placeholder="Create a strong password"
                      className="rounded-xl"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherConfirmPassword">Confirm Password</Label>
                    <Input 
                      id="teacherConfirmPassword" 
                      type="password"
                      placeholder="Re-enter your password"
                      className="rounded-xl"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-2xl" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Teacher Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="student" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="classCode">Class Code</Label>
                    <Input 
                      id="classCode" 
                      placeholder="Enter your class code (e.g., CLS1234)"
                      className="rounded-xl"
                      value={formData.classCode}
                      onChange={(e) => setFormData({...formData, classCode: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Get this code from your teacher</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input 
                      id="studentName" 
                      placeholder="e.g., John Adebayo"
                      className="rounded-xl"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input 
                      id="studentId" 
                      placeholder="e.g., STU001"
                      className="rounded-xl"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classLevel">Class Level</Label>
                    <Select required onValueChange={(value) => setFormData({...formData, classLevel: value})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select your class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jss1">JSS 1</SelectItem>
                        <SelectItem value="jss2">JSS 2</SelectItem>
                        <SelectItem value="jss3">JSS 3</SelectItem>
                        <SelectItem value="sss1">SSS 1</SelectItem>
                        <SelectItem value="sss2">SSS 2</SelectItem>
                        <SelectItem value="sss3">SSS 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Email Address</Label>
                    <Input 
                      id="studentEmail" 
                      type="email"
                      placeholder="student@school.edu.ng"
                      className="rounded-xl"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentPassword">Password</Label>
                    <Input 
                      id="studentPassword" 
                      type="password"
                      placeholder="Create a strong password"
                      className="rounded-xl"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentConfirmPassword">Confirm Password</Label>
                    <Input 
                      id="studentConfirmPassword" 
                      type="password"
                      placeholder="Re-enter your password"
                      className="rounded-xl"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-2xl" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Student Account'
                    )}
              </Button>
            </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Download, Award, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../contexts/AuthContext";

interface CertificateGeneratorProps {
  onBack: () => void;
}

export function CertificateGenerator({ onBack }: CertificateGeneratorProps) {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);

  const certificateData = {
    recipientName: user?.full_name || "Mrs. Adaeze Okonkwo",
    courseName: "AI-Powered Teaching with Technology",
    completionDate: new Date().toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    issuer: "Tisham Nigeria",
    certificateNumber: `TC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    achievements: [
      "Completed 12 hours of AI teaching training",
      "Generated 25+ lesson plans with AI",
      "Mastered digital classroom management",
      "Achieved 95% student engagement rate"
    ]
  };

  const handleDownload = async () => {
    try {
      // Create a temporary canvas
      const certificate = certificateRef.current;
      if (!certificate) return;

      // Use html2canvas library (would need to be imported in real app)
      // For now, we'll trigger browser print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Certificate - ${certificateData.recipientName}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: 'Georgia', serif;
                  background: white;
                }
                .certificate {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 60px;
                  border: 20px solid #3B82F6;
                  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                  position: relative;
                }
                .certificate::before {
                  content: '';
                  position: absolute;
                  top: 40px;
                  left: 40px;
                  right: 40px;
                  bottom: 40px;
                  border: 2px solid #8B5CF6;
                }
                .header {
                  text-align: center;
                  margin-bottom: 40px;
                }
                .logo {
                  font-size: 48px;
                  color: #3B82F6;
                  margin-bottom: 10px;
                }
                .title {
                  font-size: 48px;
                  color: #1E293B;
                  margin: 20px 0;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 4px;
                }
                .subtitle {
                  font-size: 18px;
                  color: #64748B;
                  margin-bottom: 30px;
                }
                .recipient {
                  font-size: 36px;
                  color: #3B82F6;
                  margin: 30px 0;
                  font-weight: bold;
                  text-align: center;
                  border-bottom: 2px solid #3B82F6;
                  padding-bottom: 10px;
                }
                .course {
                  font-size: 24px;
                  color: #1E293B;
                  text-align: center;
                  margin: 30px 0;
                  font-style: italic;
                }
                .achievements {
                  margin: 30px 0;
                  text-align: left;
                }
                .achievement {
                  font-size: 14px;
                  color: #475569;
                  margin: 10px 0;
                  padding-left: 30px;
                }
                .footer {
                  margin-top: 50px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                }
                .signature {
                  text-align: center;
                  flex: 1;
                }
                .signature-line {
                  border-top: 2px solid #1E293B;
                  padding-top: 10px;
                  margin-top: 40px;
                  font-size: 14px;
                  color: #64748B;
                }
                .cert-number {
                  font-size: 12px;
                  color: #94A3B8;
                  text-align: center;
                  margin-top: 20px;
                }
                @media print {
                  body { padding: 0; }
                  @page { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="certificate">
                <div class="header">
                  <div class="logo">🏆</div>
                  <div class="title">Certificate</div>
                  <div class="subtitle">of Achievement</div>
                </div>
                
                <div style="text-align: center; font-size: 18px; color: #64748B; margin: 20px 0;">
                  This is to certify that
                </div>
                
                <div class="recipient">${certificateData.recipientName}</div>
                
                <div style="text-align: center; font-size: 16px; color: #64748B; margin: 20px 0;">
                  has successfully completed
                </div>
                
                <div class="course">${certificateData.courseName}</div>
                
                <div class="achievements">
                  <div style="text-align: center; font-size: 16px; color: #1E293B; margin-bottom: 15px; font-weight: bold;">
                    Key Achievements:
                  </div>
                  ${certificateData.achievements.map(a => `
                    <div class="achievement">✓ ${a}</div>
                  `).join('')}
                </div>
                
                <div class="footer">
                  <div class="signature">
                    <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">🇳🇬</div>
                    <div class="signature-line">
                      <strong>Tisham Nigeria</strong><br/>
                      Authorized Issuer
                    </div>
                  </div>
                  <div class="signature">
                    <div style="font-size: 18px; color: #64748B;">📅</div>
                    <div class="signature-line">
                      ${certificateData.completionDate}
                    </div>
                  </div>
                </div>
                
                <div class="cert-number">
                  Certificate Number: ${certificateData.certificateNumber}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
      
      toast.success("Certificate opened for download/print!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to generate certificate");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-base font-bold truncate">Certificate of Achievement</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Download your professional development certificate
            </p>
          </div>
          <Button onClick={handleDownload} className="gradient-primary rounded-2xl">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Certificate Preview */}
        <Card 
          ref={certificateRef} 
          className="rounded-3xl overflow-hidden border-8 border-primary/20 shadow-2xl !bg-white !text-gray-900"
        >
          <CardContent className="p-8 sm:p-12 md:p-16">
            {/* Inner Border */}
            <div className="border-4 border-secondary/20 p-8 sm:p-12 rounded-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-base sm:text-base md:text-base font-bold text-gray-900 mb-2">
                  CERTIFICATE
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 tracking-wide">
                  of Achievement
                </p>
              </div>

              {/* Certification Text */}
              <div className="text-center mb-6">
                <p className="text-base sm:text-lg text-gray-600 mb-4">
                  This is to certify that
                </p>
                <h3 className="text-base sm:text-base font-bold text-blue-600 mb-6 pb-3 border-b-4 border-blue-200">
                  {certificateData.recipientName}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-4">
                  has successfully completed
                </p>
                <p className="text-base sm:text-base font-semibold text-gray-900 italic mb-8">
                  {certificateData.courseName}
                </p>
              </div>

              {/* Achievements */}
              <div className="mb-8">
                <h4 className="text-center text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Key Achievements
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {certificateData.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="grid sm:grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-base mb-2">🇳🇬</div>
                  <div className="border-t-2 border-gray-300 pt-3 mt-6">
                    <p className="font-semibold text-gray-900">Tisham Nigeria</p>
                    <p className="text-sm text-gray-600">Authorized Issuer</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-base mb-2">📅</div>
                  <div className="border-t-2 border-gray-300 pt-3 mt-6">
                    <p className="font-semibold text-gray-900">{certificateData.completionDate}</p>
                    <p className="text-sm text-gray-600">Date of Completion</p>
                  </div>
                </div>
              </div>

              {/* Certificate Number */}
              <div className="text-center mt-8">
                <Badge variant="outline" className="text-xs !border-gray-300 !text-gray-700">
                  Certificate No: {certificateData.certificateNumber}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="rounded-2xl glass-card">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              About This Certificate
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Officially recognized professional development certificate</p>
              <p>✓ Can be shared on LinkedIn, CV, or portfolio</p>
              <p>✓ Verifiable with unique certificate number</p>
              <p>✓ Demonstrates commitment to modern teaching methods</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

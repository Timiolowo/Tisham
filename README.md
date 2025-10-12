# 🎓 Tisham - AI-Powered Educational Assistant

[![Netlify Status]([![Netlify Status](https://api.netlify.com/api/v1/badges/14dcf031-c3d2-45a2-aa67-5c2f5f33794f/deploy-status)](https://app.netlify.com/projects/tisham/deploys))
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Built for Datafeast 2025 Hackathon** 🏆

An intelligent educational platform that empowers Nigerian teachers with AI-powered tools for lesson planning, content creation, and student engagement. Built with modern web technologies and designed specifically for the Nigerian educational context.

## 🎯 **Name Inspiration**

**Tisham** comes from the Nigerian Pidgin phrase **"Teach am"** (meaning "Teach him" in standard English). We wanted a name that captures our mission to help teachers educate Nigerian students effectively.

**Tishami** is our smart assistant's name. We added "i" to Tisham, and since "mi" means "my" in Yoruba, Tishami becomes **"My Teacher"**. It's a fun mix of Pidgin, English, and Yoruba that shows what our app is all about: teaching.

These names represent our goal of helping teachers do their job better while giving students their own personal learning companion.

## 🚀 **Live Demo**
[**View Live Application**](https://tisham.netlify.app)

## 👥 **Team Rosh**

| Member | Role | LinkedIn |
|--------|------|----------|
| **Timilehin Olowolafe** | UI/UX, ML/AI Developer | [@timilafe](https://www.linkedin.com/in/timilafe) |
| **Adebola Rabiu** | ML/Data Engineer | [@adebola](https://www.linkedin.com/in/adebola-rabiu-2619011a1) |
| **Anuoluwapo Tenibiaje** | Data Analyst/Project Manager | [@anuoluwapo](https://www.linkedin.com/in/anuoluwaport) |

## 🎯 **Problem Statement**

Nigeria's landmark 2025 curriculum reform has introduced dramatic changes to primary and secondary education, but teachers face critical readiness gaps:

### **📚 New Curriculum Challenges (2025 Reform)**
**Subject Overload Reduction**: From 17+ subjects to 9-13 in primary, 18+ to 12-14 in JSS
**Digital Literacy Mandate**: Compulsory Basic Digital Literacy from Primary 4
**New Trade Subjects**: 6 practical areas (Solar PV, Fashion, Livestock, Beauty, Computer Hardware, Horticulture)
**Integrated Subjects**: Citizenship & Heritage Studies, Nigerian History reintroduction
**Skills-Based Learning**: Shift from theory-heavy to practical, competency-based education

### **🚨 Critical Teacher Readiness Gaps**
**Digital Skills Crisis**: Many primary teachers struggle with digital literacy requirements
**Infrastructure Gaps**: Significant number of schools lack reliable electricity and computer access
**Teacher Shortages**: Shortfall in qualified teachers, especially in STEM and ICT subjects
**Large Class Sizes**: High student-to-teacher ratios in many schools
**Language Barriers**: Need for Hausa, Igbo, Yoruba content with local cultural relevance
**Vocational Skills Gap**: Teachers lack hands-on experience in new trade subjects

## 💡 **Our Solution**

Tisham directly addresses Nigeria's 2025 curriculum challenges with AI-powered support:

### 🤖 **Smart Features for New Curriculum**
**Smart Lesson Generation**: Create curriculum-aligned lesson plans for new subjects (Digital Literacy, Trade subjects)
**Content Simplification**: Adapt complex topics to different learning levels (JSS1-JSS3, SSS1-SSS3)
**Multi-language Support**: Generate content in English, Hausa, Igbo, and Yoruba with local cultural context
**Assessment Creation**: Generate competency-based quizzes and tests automatically
**Concept Explanation**: Smart tutor for new subjects like Solar PV, Computer Hardware, AI basics

### 🏫 **School Management System**
**Multi-role System**: School Admin, Teacher, and Student dashboards
**Class Management**: Create classes with unique codes for easy student enrollment
**Real-time Communication**: Built-in chat system for teacher-student interaction
**Progress Tracking**: Monitor student performance and engagement across classes

### 📚 **Educational Tools**
**Web-Based Platform**: Accessible through any device with internet connection
**Resource Library**: Store and organize educational materials for new curriculum
**Certificate Generation**: Create achievement certificates for students
**Learning Pathways**: Structured learning progression for competency-based education
**Badge System**: Gamified learning with achievements

## 🛠️ **Technology Stack**

### **Frontend**
**React 18** with TypeScript
**Vite** for fast development and building
**Tailwind CSS** for styling
**Radix UI** for accessible components
**Lucide React** for icons

### **Backend & Database**
**Supabase** for database and authentication
**Netlify Functions** for serverless API
**Row Level Security (RLS)** for data protection

### **Smart Integration**
**Groq API** for fast smart inference
**Custom prompts** optimized for Nigerian educational context
**Multiple smart models** for different use cases

### **Deployment**
**Netlify** for hosting and CI/CD
**Environment-based configuration**
**Secure API key management**

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Groq API key (free tier available)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/team-rosh/teacher-copilot.git
   cd teacher-copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **Set up the database**
   - Run the SQL commands in `DATABASE_SETUP.sql` in your Supabase SQL Editor

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Start Netlify functions** (for full functionality)
   ```bash
   netlify dev
   ```

## 📱 **Features Overview**

### **For School Administrators**
- Create and manage school profiles
- Generate school codes for teacher registration
- Monitor school-wide performance across new curriculum subjects
- Manage teacher accounts and track readiness gaps
- Oversee implementation of new trade subjects

### **For Teachers (Addressing Readiness Gaps)**
- **Digital Skills Support**: AI-powered guidance for teaching Basic Digital Literacy without computers
- **Trade Subject Assistance**: Step-by-step guides for Solar PV, Computer Hardware, Fashion, etc.
- **Class Management**: Tools to organize and manage student classes
- **Multi-language Content**: Generate materials in Hausa, Igbo, Yoruba with local examples
- **Web-Based Access**: Works on any device with internet connection
- **Assessment Tools**: Generate competency-based quizzes and tests
- **Real-time Support**: AI chatbot for curriculum questions

### **For Students**
- Join classes using class codes
- Access learning materials in local languages
- Take quizzes and assessments
- Earn badges and XP for new curriculum subjects
- Chat with teachers and classmates
- Track learning progress in competency-based system

## 🎨 **Key Features Showcase**

### **🎯 Core Functionality**
- **AI-Powered Lesson Planning**: Generate comprehensive lesson plans aligned with Nigerian curriculum
- **Smart Assessment Creation**: Create quizzes and tests automatically with proper difficulty levels
- **Class Management System**: Organize students and track progress with unique class codes
- **Real-time AI Chat**: Tishami assistant provides 24/7 teaching support and guidance
- **Learning Pathways**: Structured professional development for teachers
- **Resource Library**: Store and organize educational materials

### **🎨 User Interface**
- **Modern Design**: Clean, intuitive interface built with React and Tailwind CSS
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Eye-friendly interface for extended use
- **Role-Based Dashboards**: Customized interfaces for Teachers, Students, and School Admins
- **Accessibility Features**: Screen reader support and keyboard navigation

## 🔒 **Security & Privacy**

- **No Data Collection**: We don't store personal student data
- **Secure Authentication**: Supabase Auth with role-based access
- **Environment Variables**: All API keys stored securely
- **Row Level Security**: Database access controlled by user roles
- **GDPR Compliant**: Privacy-first design

## 🚀 **Deployment**

### **Netlify Deployment**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### **Environment Variables for Production**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
VITE_GROQ_API_KEY=your_production_groq_key
```

## 📊 **Platform Performance**

**Content Quality**: High alignment with Nigerian curriculum standards
**Response Relevance**: Contextually appropriate smart responses
**Lesson Plan Quality**: Comprehensive coverage of learning objectives
**Assessment Validity**: Curriculum-aligned quiz questions with proper difficulty levels
**Language Support**: Translations and cultural context in local languages
**Response Time**: Fast generation of educational content
**Content Consistency**: Maintains educational standards across all generated materials

## 🚧 **Future Improvements**

### **🔮 Planned Enhancements**

#### **Short-term (Next 3 months)**
[ ] **Mobile App**: Native mobile application for better accessibility
[ ] **Voice Integration**: Voice-to-text for lesson plan creation
[ ] **Advanced Analytics**: Student performance tracking and insights
[ ] **Parent Portal**: Parent access to student progress
[ ] **Offline Mode**: Basic functionality without internet

#### **Medium-term (6-12 months)**
[ ] **Full Curriculum Coverage**: Complete JSS1-SSS3 curriculum integration
[ ] **Multimedia Support**: Audio lessons and interactive content
[ ] **Advanced Smart Models**: Integration with GPT-4 and other models
[ ] **Video Conferencing**: Built-in video calls for remote learning
[ ] **Local Language Support**: Full Hausa, Igbo, Yoruba implementation

#### **Long-term (1+ years)**
[ ] **Government Integration**: Connect with Ministry of Education systems
[ ] **Multi-tenant Architecture**: Support for multiple schools
[ ] **Advanced Gamification**: Comprehensive badge and reward system
[ ] **Adaptive Learning**: Smart system that adjusts to individual learning styles
[ ] **Accessibility Features**: Full support for students with disabilities

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 **Hackathon Information**

**Event**: Datafeast 2025  
**Team**: Team Rosh  
**Track**: Education Technology  
**Duration**: 48 hours  
**Status**: 🚀 **Ready for Demo**

### **🎯 Hackathon Impact**
Our solution directly addresses the critical challenges identified in Nigeria's 2025 curriculum reform:
- **Teacher Readiness Gap**: Many teachers need support with new curriculum requirements
- **Infrastructure Challenges**: Schools face electricity and technology access issues
- **New Subject Areas**: Digital Literacy, Trade subjects, AI concepts
- **Large Class Sizes**: High student-to-teacher ratios in many schools
- **Language Barriers**: Need for Hausa, Igbo, Yoruba content with local context

### **🚀 Innovation Highlights**
- **Web-Based Accessibility**: Works on any device with internet connection
- **AI-Powered Support**: Real-time assistance for new curriculum subjects
- **Multi-language Support**: Content in local languages with cultural relevance
- **Class Management**: Tools designed for effective classroom organization
- **Trade Subject Guidance**: Step-by-step support for new vocational subjects

## 🙏 **Acknowledgments**

- **Supabase** for providing an excellent backend-as-a-service platform
- **Groq** for fast and reliable AI inference
- **Netlify** for seamless deployment and hosting
- **Datafeast 2025** organizers for the amazing hackathon experience
- **Nigerian educators** who inspired this solution
- **Federal Ministry of Education** for the bold 2025 curriculum reform
- **NERDC** for developing the new curriculum framework
- **Teachers like Rukayat and Tunde** who face these challenges daily

## 📞 **Contact**

**Team Rosh**  
Email: otimilehinoladipupo@gmail.com  
GitHub: [@Timiolowo](https://github.com/Timiolowo)

---

<div align="center">

**Built with ❤️ by Team Rosh for Datafeast 2025**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00c7b7?style=for-the-badge&logo=netlify)](https://netlify.com/)

</div>
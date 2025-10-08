/**
 * Centralized Prompt Management
 * All AI prompts are defined here for easy management and improvement
 */

export interface PromptConfig {
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Translation Prompts
 */
export const getTranslationPrompt = (content: string, targetLanguage: string): PromptConfig => {
  const languageNames = {
    'yoruba': 'Yoruba',
    'hausa': 'Hausa', 
    'igbo': 'Igbo',
    'english': 'English'
  };

  return {
    system: `You are a professional translator specializing in Nigerian languages. Your task is to translate ANY text the user provides accurately while maintaining the original meaning, tone, and formatting. Do not add explanations, examples, or additional content. Only provide the translated text. Do not translate explicit, inappropriate, or harmful content.`,
    user: `Translate the following text to ${languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage}. This is the exact text the user wants translated - translate it as provided. Preserve all formatting including bold text, italics, and structure. Do not add any explanations or additional content:

${content}`,
    temperature: 0.1,
    maxTokens: 1500
  };
};

/**
 * Simplification Prompts
 */
export const getSimplificationPrompt = (content: string, level: 'simple' | 'very-simple' | 'advanced'): PromptConfig => {
  const prompts = {
    'very-simple': {
      system: `You are an expert educational content simplifier for struggling students (ages 10-12). Your task is to dramatically simplify ANY text the user provides while preserving the core meaning. Use very basic vocabulary, short sentences, and everyday examples. Do not simplify explicit, inappropriate, or harmful content.`,
      user: `Simplify this content for students who are struggling (ages 10-12). This is the exact text the user wants simplified - process it as provided. Use VERY simple language, short sentences, everyday examples, and basic vocabulary. Break down complex concepts into simple parts. Keep the same structure and formatting:

${content}`,
      temperature: 0.2,
      maxTokens: 1500
    },
    'simple': {
      system: `You are an expert educational content simplifier for secondary students (ages 13-15). Your task is to make ANY text the user provides more accessible while maintaining some academic rigor. Use clear, age-appropriate language. Do not simplify explicit, inappropriate, or harmful content.`,
      user: `Simplify this content for secondary students (ages 13-15). This is the exact text the user wants simplified - process it as provided. Use clear, accessible language while maintaining some complexity. Replace difficult words with easier alternatives, use shorter sentences, and add relatable examples. Keep the same structure and formatting:

${content}`,
      temperature: 0.2,
      maxTokens: 1500
    },
    'advanced': {
      system: `You are an expert educational content editor for advanced students (ages 16+). Your task is to maintain academic complexity while ensuring clarity and precision for ANY text the user provides. Use sophisticated but clear language. Do not process explicit, inappropriate, or harmful content.`,
      user: `Review this content for advanced students (ages 16+). This is the exact text the user wants processed - work with it as provided. Maintain the original complexity and academic tone while ensuring clarity. Use precise terminology and sophisticated language. Keep the same structure and formatting:

${content}`,
      temperature: 0.1,
      maxTokens: 1500
    }
  };

  return prompts[level];
};

/**
 * Chat/Teaching Prompts
 */
export const getTeachingPrompt = (): PromptConfig => ({
  system: `You are TeachMate, an AI teaching assistant specialized in Nigerian education. You help teachers with lesson planning, student explanations, teaching strategies, and classroom management. Always provide practical, culturally relevant advice for Nigerian classrooms.`,
  user: `Provide helpful teaching assistance. Be concise, practical, and focus on Nigerian educational context.`,
  temperature: 0.7,
  maxTokens: 1000
});

/**
 * Lesson Generation Prompts
 */
export const getLessonGenerationPrompt = (topic: string, subject: string, classLevel: string, duration: number, language: string = "english", resourceLevel: string = "medium", additionalNotes?: string): PromptConfig => ({
  system: `You are an expert curriculum developer for Nigerian secondary schools. Create comprehensive, engaging lesson plans that align with the Nigerian curriculum and use local examples and contexts.`,
  user: `Create a detailed lesson plan for:
Topic: ${topic}
Subject: ${subject}
Class: ${classLevel}
Duration: ${duration} minutes
Language: ${language}
Resource Level: ${resourceLevel}${additionalNotes ? `
Additional Notes: ${additionalNotes}` : ''}

IMPORTANT: Structure your response EXACTLY like this format:

**LEARNING OBJECTIVES:**
- [Objective 1]
- [Objective 2]
- [Objective 3]

**MATERIALS NEEDED:**
- [Material 1 - appropriate for ${resourceLevel} resource level]
- [Material 2 - appropriate for ${resourceLevel} resource level]
- [Material 3 - appropriate for ${resourceLevel} resource level]

**LESSON STEPS:**
STEP_1_INTRODUCTION: ${Math.round(duration * 0.1)} minutes - [Specific activities like asking questions, showing videos, writing on board, addressing misconceptions]
STEP_2_DIRECT_INSTRUCTION: ${Math.round(duration * 0.4)} minutes - [Detailed teaching methods, visual aids used, examples given, questioning techniques]
STEP_3_GUIDED_PRACTICE: ${Math.round(duration * 0.25)} minutes - [Specific examples worked through, student participation methods, feedback strategies]
STEP_4_INDEPENDENT_PRACTICE: ${Math.round(duration * 0.2)} minutes - [Specific exercises or activities, individual/pair work, teacher monitoring approach]
STEP_5_ASSESSMENT: ${Math.round(duration * 0.05)} minutes - [Specific assessment methods, questions asked, homework assignment, next lesson preview]

CRITICAL FORMAT REQUIREMENT: Each lesson step MUST start with exactly "STEP_X_NAME:" followed by the time and description. Use this EXACT format:
- STEP_1_INTRODUCTION: X minutes - Description
- STEP_2_DIRECT_INSTRUCTION: X minutes - Description  
- STEP_3_GUIDED_PRACTICE: X minutes - Description
- STEP_4_INDEPENDENT_PRACTICE: X minutes - Description
- STEP_5_ASSESSMENT: X minutes - Description

Do not use bullet points, Roman numerals, or any other format. Use ONLY the STEP_X_NAME: format above.

**HOMEWORK:**
[Age-appropriate homework assignment for ${classLevel} students in ${language}. For JSS 1-2: simple tasks like drawing, basic research, or simple questions. For JSS 3-SS 3: more complex assignments like essays, projects, or detailed research.]

**LOCAL EXAMPLES:**
- [Simple, relatable example 1 - appropriate for ${classLevel}]
- [Simple, relatable example 2 - appropriate for ${classLevel}]
- [Simple, relatable example 3 - appropriate for ${classLevel}]

Use relatable examples when relevant, and cultural references. Consider the ${resourceLevel} resource level when suggesting materials and activities. Make examples simple and relatable for ${classLevel} students.`,
  temperature: 0.7,
  maxTokens: 4000
});

/**
 * Quiz Generation Prompts
 */
export const getQuizGenerationPrompt = (topic: string, numberOfQuestions: number, difficulty: string, classLevel?: string): PromptConfig => ({
  system: `You are an expert assessment creator for Nigerian secondary schools. Create high-quality quiz questions that test understanding and use Nigerian examples where relevant.`,
  user: `Create EXACTLY ${numberOfQuestions} ${difficulty} multiple-choice questions about "${topic}" for ${classLevel || 'Nigerian secondary school'} students. 

IMPORTANT: Format each question EXACTLY like this:

### Question 1: [Topic Name]
1. **Question**: [Your question here]
2. **Answer Options**:
   - A: [Option A]
   - B: [Option B] 
   - C: [Option C]
   - D: [Option D]
3. **Correct Answer**: [Letter]: [Answer text]
4. **Explanation**: [Brief explanation]

Requirements:
- Create EXACTLY ${numberOfQuestions} questions (no more, no less)
- Difficulty level: ${difficulty}
- Target audience: ${classLevel || 'Nigerian secondary school students'}
- Use Nigerian examples, locations, and cultural references
- Make questions age-appropriate for ${classLevel || 'secondary school'} students
- Each question must have exactly 4 options (A, B, C, D)`,
  temperature: 0.5,
  maxTokens: 2000
});

/**
 * Content Analysis Prompts
 */
export const getContentAnalysisPrompt = (content: string): PromptConfig => ({
  system: `You are an expert educational content analyst. Analyze content for educational value, complexity, and appropriateness for different age groups.`,
  user: `Analyze this educational content and provide insights on its complexity, learning objectives, and target audience:

${content}`,
  temperature: 0.3,
  maxTokens: 1000
});

/**
 * Prompt Testing and Validation
 */
export const validatePrompt = (prompt: PromptConfig): boolean => {
  return !!(prompt.system && prompt.user && typeof prompt.temperature === 'number' && typeof prompt.maxTokens === 'number');
};

/**
 * Get all available prompt types
 */
export const getPromptTypes = () => [
  'translation',
  'simplification',
  'teaching',
  'lesson-generation',
  'quiz-generation',
  'content-analysis'
];

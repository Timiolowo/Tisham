/**
 * Groq AI Integration Service
 * Handles all API calls to Groq LLM
 */

import { getGroqApiKey } from './env';
import { getTranslationPrompt, getSimplificationPrompt, getTeachingPrompt, getLessonGenerationPrompt, getQuizGenerationPrompt } from './prompts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = getGroqApiKey();

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a chat request to Groq AI
 */
export async function sendChatMessage(
  messages: Message[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here' || GROQ_API_KEY === '') {
    throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.\n\nSteps:\n1. Create a .env file in the project root\n2. Add: VITE_GROQ_API_KEY=your_key_here\n3. Get a free key at https://console.groq.com/keys\n4. Restart the dev server');
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: options?.model || 'llama-3.3-70b-versatile', // Default to fastest model
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1024,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

/**
 * Generate a teaching-focused response
 * Optimized system prompt for Nigerian educational context
 */
export async function generateTeachingResponse(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  const promptConfig = getTeachingPrompt();
  
  const systemPrompt: Message = {
    role: 'system',
    content: promptConfig.system
  };

  const messages: Message[] = [
    systemPrompt,
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  return sendChatMessage(messages, {
    model: 'llama-3.3-70b-versatile',
    temperature: promptConfig.temperature,
    maxTokens: promptConfig.maxTokens
  });
}

/**
 * Generate a lesson plan with AI
 */
export async function generateLessonPlan(
  topic: string,
  subject: string,
  classLevel: string,
  duration: number = 40,
  language: string = "english",
  resourceLevel: string = "medium",
  additionalNotes?: string
): Promise<string> {
  const promptConfig = getLessonGenerationPrompt(topic, subject, classLevel, duration, language, resourceLevel);

  const systemPrompt: Message = {
    role: 'system',
    content: promptConfig.system
  };

  return sendChatMessage([
    systemPrompt,
    { role: 'user', content: promptConfig.user }
  ], {
    model: 'llama-3.3-70b-versatile',
    temperature: promptConfig.temperature,
    maxTokens: promptConfig.maxTokens
  });
}

/**
 * Simplify or translate content
 */
export async function simplifyContent(
  content: string,
  targetLevel: 'simple' | 'very-simple' | 'advanced' | 'translate',
  targetLanguage?: string
): Promise<string> {
  let promptConfig;

  if (targetLevel === 'translate' && targetLanguage) {
    promptConfig = getTranslationPrompt(content, targetLanguage);
  } else {
    promptConfig = getSimplificationPrompt(content, targetLevel as 'simple' | 'very-simple' | 'advanced');
  }

  const systemPrompt: Message = {
    role: 'system',
    content: promptConfig.system
  };

  return sendChatMessage([
    systemPrompt,
    { role: 'user', content: promptConfig.user }
  ], {
    model: 'llama-3.3-70b-versatile',
    temperature: promptConfig.temperature,
    maxTokens: promptConfig.maxTokens
  });
}

/**
 * Generate quiz questions
 */
export async function generateQuiz(
  topic: string,
  numberOfQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  classLevel?: string
): Promise<string> {
  const { getQuizGenerationPrompt } = await import('./prompts');
  const promptConfig = getQuizGenerationPrompt(topic, numberOfQuestions, difficulty, classLevel);
  
  const systemPrompt: Message = {
    role: 'system',
    content: promptConfig.system
  };

  return sendChatMessage([
    systemPrompt,
    { role: 'user', content: promptConfig.user }
  ], {
    model: 'llama-3.3-70b-versatile',
    temperature: promptConfig.temperature,
    maxTokens: promptConfig.maxTokens
  });
}

/**
 * Explain a concept with AI
 */
export async function explainConcept(
  concept: string,
  grade: string = 'JSS 3'
): Promise<string> {
  const prompt = `Explain "${concept}" to a ${grade} student in Nigeria.

Make it:
- Easy to understand with simple language
- Use Nigerian examples and context
- Include real-world applications
- Add fun facts or interesting points
- Use emojis to make it engaging

Keep it concise but comprehensive.`;

  const systemPrompt: Message = {
    role: 'system',
    content: 'You are TeachMate, a friendly AI teacher that makes learning fun and easy for Nigerian students. Use emojis, local examples, and encouraging language.'
  };

  return sendChatMessage([
    systemPrompt,
    { role: 'user', content: prompt }
  ], {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1024
  });
}

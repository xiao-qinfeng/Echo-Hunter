
export enum CognitiveMode {
  OBSERVATION = 'OBSERVATION', // "Anchor" - what is fixed?
  PARADOX = 'PARADOX',         // "Folding" - what conflicts?
  SENSORY = 'SENSORY'          // "Decoding" - what is felt?
}

export interface CognitiveAnalysis {
  depthScore: number;         // 0-100: How deep/complex is the thought?
  styleUniqueness: number;    // 0-100: How much does it deviate from the norm?
  cognitiveType: CognitiveMode; // AI determined mode
  distortionType: string;     // e.g., "Catastrophizing" or "Creative Hyperbole"
  metaphorDetected: boolean;
  feedback: string;           // A short "echo" or insight from the AI
}

export interface ThoughtNode {
  id: string;
  content: string;
  timestamp: number;
  mode: CognitiveMode;
  analysis: CognitiveAnalysis;
}

export interface UserProfile {
  name: string;
  totalThoughts: number;
  styleFingerprint: {
    rationality: number;
    emotion: number;
    abstractness: number;
    surrealism: number;
    clarity: number;
  }
}

export type Language = 'en' | 'zh';

export type AIProvider = 'gemini' | 'openai' | 'deepseek' | 'kimi' | 'zhipu' | 'qwen' | 'claude' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  apiKey: '', // To be filled by user or env
  baseUrl: 'https://generativelanguage.googleapis.com',
  model: 'gemini-2.5-flash'
};

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  kimi: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  zhipu: ['glm-4', 'glm-4-plus', 'glm-4-air', 'glm-4-flash', 'glm-4-long'],
  qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long'],
  claude: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  custom: []
};

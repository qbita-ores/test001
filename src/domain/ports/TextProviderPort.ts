import { Message } from '../entities/Chat';

export interface TextGenerationRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  targetLanguage: string;
  nativeLanguage: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface ResponseSuggestionRequest {
  conversationHistory: Message[];
  targetLanguage: string;
  nativeLanguage: string;
}

export interface LessonGenerationRequest {
  context: string;
  level: string;
  targetLanguage: string;
  nativeLanguage: string;
  conversationContext?: Message[];
}

export interface TextCompletionRequest {
  partialText: string;
  purpose: 'lesson' | 'exercise' | 'context';
  targetLanguage: string;
  level?: string;
}

export interface PronunciationEvaluationRequest {
  originalText: string;
  transcribedText: string;
  targetLanguage: string;
}

export interface ListeningEvaluationRequest {
  originalText: string;
  userTranscription: string;
  targetLanguage: string;
}

export interface ITextProviderPort {
  generateResponse(request: TextGenerationRequest): Promise<string>;
  translate(request: TranslationRequest): Promise<string>;
  suggestResponses(request: ResponseSuggestionRequest): Promise<string[]>;
  generateLesson(request: LessonGenerationRequest): Promise<string>;
  generateExerciseText(request: TextCompletionRequest): Promise<string>;
  completeText(request: TextCompletionRequest): Promise<string>;
  evaluatePronunciation(request: PronunciationEvaluationRequest): Promise<string>;
  evaluateListening(request: ListeningEvaluationRequest): Promise<string>;
  validateApiKey(apiKey: string): Promise<boolean>;
  getAvailableModels(apiKey: string): Promise<string[]>;
}

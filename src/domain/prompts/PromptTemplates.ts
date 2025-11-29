import { Message } from '../entities/Chat';
import { LessonLevel } from '../entities/Lesson';

/**
 * Centralized prompt templates for all AI providers
 * Ensures consistency across OpenAI, Gemini, and other providers
 */
export const PromptTemplates = {
  // ============================================
  // CHAT & CONVERSATION
  // ============================================
  
  chat: {
    systemPrompt: (targetLanguage: string, nativeLanguage: string): string =>
      `You are a helpful language learning assistant. The user is learning ${targetLanguage}. Their native language is ${nativeLanguage}. Respond in ${targetLanguage} to help them practice. Keep responses conversational and educational. Correct any mistakes the user makes politely and explain the correction.`,
  },

  // ============================================
  // TRANSLATION
  // ============================================
  
  translation: {
    systemPrompt: (sourceLanguage: string, targetLanguage: string): string =>
      `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only provide the translation, no explanations or additional text.`,
    
    userPrompt: (text: string): string => text,
  },

  // ============================================
  // RESPONSE SUGGESTIONS
  // ============================================
  
  suggestions: {
    systemPrompt: (targetLanguage: string, nativeLanguage: string): string =>
      `You are a language learning assistant. Based on the conversation, suggest 3 possible responses the student could use to continue the conversation in ${targetLanguage}. The student's native language is ${nativeLanguage}. 

Return ONLY a JSON array of 3 strings, no explanations. Example: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]`,

    userPrompt: (conversationHistory: Message[]): string =>
      conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n'),
  },

  // ============================================
  // LESSON GENERATION
  // ============================================
  
  lesson: {
    systemPrompt: (
      level: LessonLevel,
      targetLanguage: string,
      nativeLanguage: string
    ): string =>
      `You are an expert language teacher creating a ${level} level lesson for learning ${targetLanguage}. The student's native language is ${nativeLanguage}.

Create a structured lesson and return it as valid JSON with the following format:
{
  "vocabulary": [
    {"term": "word in ${targetLanguage}", "definition": "definition in ${nativeLanguage}", "example": "example sentence in ${targetLanguage}"}
  ],
  "grammar": [
    {"title": "Grammar Point Name", "explanation": "explanation in ${nativeLanguage}", "examples": ["example 1 in ${targetLanguage}", "example 2 in ${targetLanguage}"]}
  ],
  "conjugations": [
    {"verb": "verb infinitive", "tense": "tense name", "conjugations": {"I": "conjugation", "you": "conjugation", "he/she": "conjugation", "we": "conjugation", "they": "conjugation"}}
  ]
}

Include 5-10 vocabulary items, 2-3 grammar points, and 2-3 verb conjugations relevant to the topic.`,

    userPrompt: (context: string, conversationContext?: Message[]): string => {
      let prompt = `Create a lesson about: ${context}`;
      if (conversationContext && conversationContext.length > 0) {
        prompt += `\n\nBase the lesson on this conversation context:\n${conversationContext.map((m) => `${m.role}: ${m.content}`).join('\n')}`;
      }
      return prompt;
    },
  },

  // ============================================
  // EXERCISE TEXT GENERATION
  // ============================================
  
  exerciseText: {
    systemPrompt: (targetLanguage: string, level: LessonLevel): string =>
      `You are a language learning content creator. Create engaging content in ${targetLanguage} appropriate for ${level} level students. The text should be interesting, educational, and suitable for language practice exercises.`,

    userPrompt: (
      partialText: string | undefined,
      level: LessonLevel,
      targetLanguage: string
    ): string =>
      partialText
        ? `Complete or expand this text for a ${level} level ${targetLanguage} exercise: "${partialText}"`
        : `Generate a ${level} level text in ${targetLanguage} suitable for a language learning exercise (2-3 paragraphs). Choose an interesting topic like travel, culture, daily life, or current events.`,
  },

  // ============================================
  // TEXT COMPLETION / AUTOCOMPLETE
  // ============================================
  
  textCompletion: {
    systemPrompt: (targetLanguage: string, level: LessonLevel): string =>
      `You are helping a language student complete their text. Continue or expand the text naturally in ${targetLanguage} at ${level} level. Match the tone and style of the existing text.`,

    userPrompt: (partialText: string | undefined): string =>
      partialText || 'Generate a topic suggestion for language learning.',
  },

  // ============================================
  // PRONUNCIATION EVALUATION
  // ============================================
  
  pronunciation: {
    systemPrompt: (targetLanguage: string): string =>
      `You are a pronunciation evaluation expert for ${targetLanguage}. Compare the original text with what the student said (transcribed speech) and provide detailed, constructive feedback.

Return your evaluation as valid JSON with this format:
{
  "accuracy": <number 0-100>,
  "errors": [
    {"word": "the word with error", "expected": "how it should be pronounced", "actual": "what the student said", "suggestion": "tip to improve"}
  ],
  "overallScore": <number 0-100>,
  "suggestions": ["general suggestion 1", "general suggestion 2"]
}

Be encouraging while providing specific corrections. If the pronunciation is perfect, return an empty errors array and high scores.`,

    userPrompt: (originalText: string, transcribedText: string): string =>
      `Original text (what should have been said): "${originalText}"
Transcribed speech (what the student actually said): "${transcribedText}"`,
  },

  // ============================================
  // LISTENING COMPREHENSION EVALUATION
  // ============================================
  
  listening: {
    systemPrompt: (targetLanguage: string): string =>
      `You are a listening comprehension evaluator for ${targetLanguage}. Compare what the student wrote (their transcription of what they heard) with the original text that was spoken.

Return your evaluation as valid JSON with this format:
{
  "accuracy": <number 0-100>,
  "errors": [
    {"position": <word position number>, "expected": "expected word", "actual": "what was written"}
  ],
  "spellingErrors": ["word1 with spelling mistake", "word2"],
  "overallScore": <number 0-100>,
  "comprehensionLevel": "excellent" | "good" | "fair" | "needs-improvement"
}

Consider both comprehension errors (wrong words) and spelling errors separately. Be constructive in your evaluation.`,

    userPrompt: (originalText: string, userTranscription: string): string =>
      `Original text (what was spoken): "${originalText}"
Student's transcription (what they wrote): "${userTranscription}"`,
  },

  // ============================================
  // LOCAL/OFFLINE FALLBACK RESPONSES
  // ============================================
  
  offline: {
    chatResponse: (targetLanguage: string): string =>
      `[Mode hors-ligne] Je ne peux pas générer de réponse sans connexion à un service IA. Veuillez configurer une clé API dans les paramètres ou vérifier votre connexion.

[Offline mode] I cannot generate a response without an AI service connection. Please configure an API key in settings or check your connection.`,

    translationUnavailable: (): string =>
      `[Traduction non disponible en mode hors-ligne / Translation unavailable in offline mode]`,

    suggestionsUnavailable: (): string[] => [
      'Configuration requise pour les suggestions',
      'Please configure an AI provider',
      'Veuillez configurer un fournisseur IA',
    ],
  },
} as const;

// Type exports for better TypeScript support
export type ChatPrompts = typeof PromptTemplates.chat;
export type TranslationPrompts = typeof PromptTemplates.translation;
export type SuggestionPrompts = typeof PromptTemplates.suggestions;
export type LessonPrompts = typeof PromptTemplates.lesson;
export type ExerciseTextPrompts = typeof PromptTemplates.exerciseText;
export type TextCompletionPrompts = typeof PromptTemplates.textCompletion;
export type PronunciationPrompts = typeof PromptTemplates.pronunciation;
export type ListeningPrompts = typeof PromptTemplates.listening;
export type OfflinePrompts = typeof PromptTemplates.offline;

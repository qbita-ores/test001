import {
  ITextProviderPort,
  TextGenerationRequest,
  TranslationRequest,
  ResponseSuggestionRequest,
  LessonGenerationRequest,
  TextCompletionRequest,
  PronunciationEvaluationRequest,
  ListeningEvaluationRequest,
} from '@/domain/ports/TextProviderPort';
import { PromptTemplates } from '@/domain/prompts';

export class GeminiTextAdapter implements ITextProviderPort {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string, model: string = 'gemini-1.5-pro') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async makeRequest(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }
      throw new Error('No response generated from Gemini API');
    }

    const candidate = data.candidates[0];

    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Response blocked due to safety settings');
    }

    if (!candidate.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return candidate.content.parts[0].text;
  }

  async generateResponse(request: TextGenerationRequest): Promise<string> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    const prompt = conversationMessages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    return this.makeRequest(prompt, systemMessage?.content);
  }

  async translate(request: TranslationRequest): Promise<string> {
    return this.makeRequest(
      PromptTemplates.translation.userPrompt(request.text),
      PromptTemplates.translation.systemPrompt(
        request.sourceLanguage,
        request.targetLanguage
      )
    );
  }

  async suggestResponses(request: ResponseSuggestionRequest): Promise<string[]> {
    const response = await this.makeRequest(
      PromptTemplates.suggestions.userPrompt(request.conversationHistory),
      PromptTemplates.suggestions.systemPrompt(
        request.targetLanguage,
        request.nativeLanguage
      )
    );

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [response];
    } catch {
      return [response];
    }
  }

  async generateLesson(request: LessonGenerationRequest): Promise<string> {
    return this.makeRequest(
      PromptTemplates.lesson.userPrompt(
        request.context,
        request.conversationContext
      ),
      PromptTemplates.lesson.systemPrompt(
        request.level,
        request.targetLanguage,
        request.nativeLanguage
      )
    );
  }

  async generateExerciseText(request: TextCompletionRequest): Promise<string> {
    return this.makeRequest(
      PromptTemplates.exerciseText.userPrompt(
        request.partialText,
        request.level,
        request.targetLanguage
      ),
      PromptTemplates.exerciseText.systemPrompt(
        request.targetLanguage,
        request.level
      )
    );
  }

  async completeText(request: TextCompletionRequest): Promise<string> {
    return this.makeRequest(
      PromptTemplates.textCompletion.userPrompt(request.partialText),
      PromptTemplates.textCompletion.systemPrompt(
        request.targetLanguage,
        request.level
      )
    );
  }

  async evaluatePronunciation(
    request: PronunciationEvaluationRequest
  ): Promise<string> {
    return this.makeRequest(
      PromptTemplates.pronunciation.userPrompt(
        request.originalText,
        request.transcribedText
      ),
      PromptTemplates.pronunciation.systemPrompt(request.targetLanguage)
    );
  }

  async evaluateListening(request: ListeningEvaluationRequest): Promise<string> {
    return this.makeRequest(
      PromptTemplates.listening.userPrompt(
        request.originalText,
        request.userTranscription
      ),
      PromptTemplates.listening.systemPrompt(request.targetLanguage)
    );
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${apiKey}`);

      if (!response.ok) return [];

      const data = await response.json();
      return (
        data.models
          ?.filter((m: { name: string }) => m.name.includes('gemini'))
          .map((m: { name: string }) => m.name.replace('models/', ''))
          .sort() || []
      );
    } catch {
      return [];
    }
  }
}

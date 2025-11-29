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

export class OpenAITextAdapter implements ITextProviderPort {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number = 4096
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from OpenAI API');
    }

    const choice = data.choices[0];
    if (!choice.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return choice.message.content;
  }

  async generateResponse(request: TextGenerationRequest): Promise<string> {
    return this.makeRequest(request.messages);
  }

  async translate(request: TranslationRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.translation.systemPrompt(
          request.sourceLanguage,
          request.targetLanguage
        ),
      },
      {
        role: 'user',
        content: PromptTemplates.translation.userPrompt(request.text),
      },
    ]);
  }

  async suggestResponses(request: ResponseSuggestionRequest): Promise<string[]> {
    const response = await this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.suggestions.systemPrompt(
          request.targetLanguage,
          request.nativeLanguage
        ),
      },
      {
        role: 'user',
        content: PromptTemplates.suggestions.userPrompt(request.conversationHistory),
      },
    ]);

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [response];
    } catch {
      return [response];
    }
  }

  async generateLesson(request: LessonGenerationRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.lesson.systemPrompt(
          request.level,
          request.targetLanguage,
          request.nativeLanguage
        ),
      },
      {
        role: 'user',
        content: PromptTemplates.lesson.userPrompt(
          request.context,
          request.conversationContext
        ),
      },
    ]);
  }

  async generateExerciseText(request: TextCompletionRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.exerciseText.systemPrompt(
          request.targetLanguage,
          request.level
        ),
      },
      {
        role: 'user',
        content: PromptTemplates.exerciseText.userPrompt(
          request.partialText,
          request.level,
          request.targetLanguage
        ),
      },
    ]);
  }

  async completeText(request: TextCompletionRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.textCompletion.systemPrompt(
          request.targetLanguage,
          request.level
        ),
      },
      {
        role: 'user',
        content: PromptTemplates.textCompletion.userPrompt(request.partialText),
      },
    ]);
  }

  async evaluatePronunciation(
    request: PronunciationEvaluationRequest
  ): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.pronunciation.systemPrompt(request.targetLanguage),
      },
      {
        role: 'user',
        content: PromptTemplates.pronunciation.userPrompt(
          request.originalText,
          request.transcribedText
        ),
      },
    ]);
  }

  async evaluateListening(request: ListeningEvaluationRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: PromptTemplates.listening.systemPrompt(request.targetLanguage),
      },
      {
        role: 'user',
        content: PromptTemplates.listening.userPrompt(
          request.originalText,
          request.userTranscription
        ),
      },
    ]);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.data
        .filter((m: { id: string }) => m.id.includes('gpt'))
        .map((m: { id: string }) => m.id)
        .sort();
    } catch {
      return [];
    }
  }
}

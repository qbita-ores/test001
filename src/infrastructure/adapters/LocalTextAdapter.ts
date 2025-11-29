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

export type LocalProviderType = 'lmstudio' | 'ollama';

export class LocalTextAdapter implements ITextProviderPort {
  private endpoint: string;
  private model: string;
  private providerType: LocalProviderType;

  constructor(
    endpoint: string,
    model: string,
    providerType: LocalProviderType = 'lmstudio'
  ) {
    this.endpoint = endpoint;
    this.model = model;
    this.providerType = providerType;
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number = 4096
  ): Promise<string> {
    const url =
      this.providerType === 'ollama'
        ? `${this.endpoint}/api/chat`
        : `${this.endpoint}/v1/chat/completions`;

    const body =
      this.providerType === 'ollama'
        ? {
            model: this.model,
            messages,
            stream: false,
            options: {
              num_predict: maxTokens,
            },
          }
        : {
            model: this.model,
            messages,
            temperature: 0.7,
            max_tokens: maxTokens,
          };

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
      throw new Error(`Local provider error: ${errorMessage}`);
    }

    const data = await response.json();

    if (this.providerType === 'ollama') {
      if (!data.message?.content) {
        throw new Error('Invalid response format from Ollama');
      }
      return data.message.content;
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from local provider');
    }

    const choice = data.choices[0];
    if (!choice.message?.content) {
      throw new Error('Invalid response format from local provider');
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

  async validateApiKey(): Promise<boolean> {
    try {
      const url =
        this.providerType === 'ollama'
          ? `${this.endpoint}/api/tags`
          : `${this.endpoint}/v1/models`;

      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const url =
        this.providerType === 'ollama'
          ? `${this.endpoint}/api/tags`
          : `${this.endpoint}/v1/models`;

      const response = await fetch(url);

      if (!response.ok) return [];

      const data = await response.json();

      if (this.providerType === 'ollama') {
        return data.models?.map((m: { name: string }) => m.name) || [];
      }

      return data.data?.map((m: { id: string }) => m.id) || [];
    } catch {
      return [];
    }
  }
}

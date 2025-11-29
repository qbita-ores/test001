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
    messages: Array<{ role: string; content: string }>
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
          }
        : {
            model: this.model,
            messages,
            temperature: 0.7,
          };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Local provider error: ${response.statusText}`);
    }

    const data = await response.json();

    return this.providerType === 'ollama'
      ? data.message.content
      : data.choices[0].message.content;
  }

  async generateResponse(request: TextGenerationRequest): Promise<string> {
    return this.makeRequest(request.messages);
  }

  async translate(request: TranslationRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}. Only provide the translation, no explanations.`,
      },
      {
        role: 'user',
        content: request.text,
      },
    ]);
  }

  async suggestResponses(request: ResponseSuggestionRequest): Promise<string[]> {
    const conversationText = request.conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await this.makeRequest([
      {
        role: 'system',
        content: `You are a language learning assistant. Based on the conversation, suggest 3 possible responses the student could use to continue the conversation in ${request.targetLanguage}. The student's native language is ${request.nativeLanguage}. Return the suggestions as a JSON array of strings.`,
      },
      {
        role: 'user',
        content: conversationText,
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
    const contextInfo = request.conversationContext
      ? `\n\nConversation context:\n${request.conversationContext.map((m) => `${m.role}: ${m.content}`).join('\n')}`
      : '';

    return this.makeRequest([
      {
        role: 'system',
        content: `You are an expert language teacher creating a ${request.level} level lesson for learning ${request.targetLanguage}. The student's native language is ${request.nativeLanguage}.
        
Create a structured lesson with the following JSON format:
{
  "vocabulary": [
    {"term": "word", "definition": "definition in native language", "example": "example sentence"}
  ],
  "grammar": [
    {"title": "Grammar Point", "explanation": "explanation", "examples": ["example 1", "example 2"]}
  ],
  "conjugations": [
    {"verb": "verb", "tense": "tense name", "conjugations": {"je/I": "conjugation", "tu/you": "conjugation", ...}}
  ]
}`,
      },
      {
        role: 'user',
        content: `Create a lesson about: ${request.context}${contextInfo}`,
      },
    ]);
  }

  async generateExerciseText(request: TextCompletionRequest): Promise<string> {
    const prompt = request.partialText
      ? `Complete or expand this text for a ${request.level} level ${request.targetLanguage} exercise: "${request.partialText}"`
      : `Generate a ${request.level} level text in ${request.targetLanguage} suitable for a language learning exercise (2-3 paragraphs).`;

    return this.makeRequest([
      {
        role: 'system',
        content: `You are a language learning content creator. Create engaging content in ${request.targetLanguage} appropriate for ${request.level} level students.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);
  }

  async completeText(request: TextCompletionRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: `You are helping a language student complete their text. Continue or expand the text naturally in ${request.targetLanguage} at ${request.level} level.`,
      },
      {
        role: 'user',
        content: request.partialText || 'Generate a topic suggestion for language learning.',
      },
    ]);
  }

  async evaluatePronunciation(
    request: PronunciationEvaluationRequest
  ): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: `You are a pronunciation evaluation expert for ${request.targetLanguage}. Compare the original text with what the student said and provide detailed feedback.
        
Return JSON format:
{
  "accuracy": 0-100,
  "errors": [{"word": "word", "expected": "expected", "actual": "what was said", "suggestion": "how to improve"}],
  "overallScore": 0-100,
  "suggestions": ["suggestion 1", "suggestion 2"]
}`,
      },
      {
        role: 'user',
        content: `Original text: "${request.originalText}"\nTranscribed speech: "${request.transcribedText}"`,
      },
    ]);
  }

  async evaluateListening(request: ListeningEvaluationRequest): Promise<string> {
    return this.makeRequest([
      {
        role: 'system',
        content: `You are a listening comprehension evaluator for ${request.targetLanguage}. Compare what the student wrote with the original text.
        
Return JSON format:
{
  "accuracy": 0-100,
  "errors": [{"position": 0, "expected": "expected word", "actual": "what was written"}],
  "spellingErrors": ["word1", "word2"],
  "overallScore": 0-100,
  "comprehensionLevel": "excellent|good|fair|needs-improvement"
}`,
      },
      {
        role: 'user',
        content: `Original text: "${request.originalText}"\nStudent's transcription: "${request.userTranscription}"`,
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

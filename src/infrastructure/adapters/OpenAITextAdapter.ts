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

export class OpenAITextAdapter implements ITextProviderPort {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();
    
    // Vérifier que la réponse contient des choices valides
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
      return JSON.parse(response);
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

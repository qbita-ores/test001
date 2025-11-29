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
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
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
      request.text,
      `You are a professional translator. Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}. Only provide the translation, no explanations.`
    );
  }

  async suggestResponses(request: ResponseSuggestionRequest): Promise<string[]> {
    const conversationText = request.conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await this.makeRequest(
      conversationText,
      `You are a language learning assistant. Based on the conversation, suggest 3 possible responses the student could use to continue the conversation in ${request.targetLanguage}. The student's native language is ${request.nativeLanguage}. Return the suggestions as a JSON array of strings.`
    );

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

    return this.makeRequest(
      `Create a lesson about: ${request.context}${contextInfo}`,
      `You are an expert language teacher creating a ${request.level} level lesson for learning ${request.targetLanguage}. The student's native language is ${request.nativeLanguage}.
        
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
}`
    );
  }

  async generateExerciseText(request: TextCompletionRequest): Promise<string> {
    const prompt = request.partialText
      ? `Complete or expand this text for a ${request.level} level ${request.targetLanguage} exercise: "${request.partialText}"`
      : `Generate a ${request.level} level text in ${request.targetLanguage} suitable for a language learning exercise (2-3 paragraphs).`;

    return this.makeRequest(
      prompt,
      `You are a language learning content creator. Create engaging content in ${request.targetLanguage} appropriate for ${request.level} level students.`
    );
  }

  async completeText(request: TextCompletionRequest): Promise<string> {
    return this.makeRequest(
      request.partialText || 'Generate a topic suggestion for language learning.',
      `You are helping a language student complete their text. Continue or expand the text naturally in ${request.targetLanguage} at ${request.level} level.`
    );
  }

  async evaluatePronunciation(
    request: PronunciationEvaluationRequest
  ): Promise<string> {
    return this.makeRequest(
      `Original text: "${request.originalText}"\nTranscribed speech: "${request.transcribedText}"`,
      `You are a pronunciation evaluation expert for ${request.targetLanguage}. Compare the original text with what the student said and provide detailed feedback.
        
Return JSON format:
{
  "accuracy": 0-100,
  "errors": [{"word": "word", "expected": "expected", "actual": "what was said", "suggestion": "how to improve"}],
  "overallScore": 0-100,
  "suggestions": ["suggestion 1", "suggestion 2"]
}`
    );
  }

  async evaluateListening(request: ListeningEvaluationRequest): Promise<string> {
    return this.makeRequest(
      `Original text: "${request.originalText}"\nStudent's transcription: "${request.userTranscription}"`,
      `You are a listening comprehension evaluator for ${request.targetLanguage}. Compare what the student wrote with the original text.
        
Return JSON format:
{
  "accuracy": 0-100,
  "errors": [{"position": 0, "expected": "expected word", "actual": "what was written"}],
  "spellingErrors": ["word1", "word2"],
  "overallScore": 0-100,
  "comprehensionLevel": "excellent|good|fair|needs-improvement"
}`
    );
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${apiKey}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.models
        ?.filter((m: { name: string }) => m.name.includes('gemini'))
        .map((m: { name: string }) => m.name.replace('models/', ''))
        .sort() || [];
    } catch {
      return [];
    }
  }
}

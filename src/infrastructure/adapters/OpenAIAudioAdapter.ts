import {
  IAudioProviderPort,
  TextToSpeechRequest,
  SpeechToTextRequest,
} from '@/domain/ports/AudioProviderPort';

export class OpenAIAudioAdapter implements IAudioProviderPort {
  private apiKey: string;
  private model: string;
  private voice: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(
    apiKey: string,
    model: string = 'tts-1',
    voice: string = 'alloy'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.voice = voice;
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: request.text,
        voice: request.voice || this.voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS error: ${response.statusText}`);
    }

    return response.blob();
  }

  async speechToText(request: SpeechToTextRequest): Promise<string> {
    const formData = new FormData();
    formData.append('file', request.audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', this.getLanguageCode(request.language));

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI STT error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  }

  private getLanguageCode(language: string): string {
    const codes: Record<string, string> = {
      English: 'en',
      Français: 'fr',
      Español: 'es',
      Deutsch: 'de',
      Italiano: 'it',
      Português: 'pt',
      日本語: 'ja',
      中文: 'zh',
      한국어: 'ko',
      العربية: 'ar',
      Русский: 'ru',
      Nederlands: 'nl',
      Polski: 'pl',
      Türkçe: 'tr',
      Svenska: 'sv',
    };
    return codes[language] || 'en';
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

  async getAvailableModels(): Promise<string[]> {
    return ['tts-1', 'tts-1-hd'];
  }

  async getAvailableVoices(): Promise<string[]> {
    return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  }
}

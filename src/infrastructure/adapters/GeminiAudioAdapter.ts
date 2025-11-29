import {
  IAudioProviderPort,
  TextToSpeechRequest,
  SpeechToTextRequest,
} from '@/domain/ports/AudioProviderPort';

export class GeminiAudioAdapter implements IAudioProviderPort {
  private apiKey: string;
  private model: string;
  private voice: string;
  private baseUrl = 'https://texttospeech.googleapis.com/v1';

  constructor(
    apiKey: string,
    model: string = 'en-US-Standard-A',
    voice: string = 'en-US-Standard-A'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.voice = voice;
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
    const languageCode = this.getLanguageCode(request.language);
    
    const response = await fetch(`${this.baseUrl}/text:synthesize?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: request.text },
        voice: {
          languageCode,
          name: request.voice || this.voice,
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google TTS error: ${response.statusText}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent;
    
    // Convert base64 to Blob
    const byteCharacters = atob(audioContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/mp3' });
  }

  async speechToText(request: SpeechToTextRequest): Promise<string> {
    // Convert blob to base64
    const arrayBuffer = await request.audioBlob.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    const languageCode = this.getLanguageCode(request.language);

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode,
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google STT error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results?.[0]?.alternatives?.[0]?.transcript || '';
  }

  private getLanguageCode(language: string): string {
    const codes: Record<string, string> = {
      English: 'en-US',
      Français: 'fr-FR',
      Español: 'es-ES',
      Deutsch: 'de-DE',
      Italiano: 'it-IT',
      Português: 'pt-BR',
      日本語: 'ja-JP',
      中文: 'zh-CN',
      한국어: 'ko-KR',
      العربية: 'ar-XA',
      Русский: 'ru-RU',
      Nederlands: 'nl-NL',
      Polski: 'pl-PL',
      Türkçe: 'tr-TR',
      Svenska: 'sv-SE',
    };
    return codes[language] || 'en-US';
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/voices?key=${apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return ['Standard', 'WaveNet', 'Neural2'];
  }

  async getAvailableVoices(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/voices?key=${apiKey}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.voices?.map((v: { name: string }) => v.name).slice(0, 20) || [];
    } catch {
      return ['en-US-Standard-A', 'en-US-Standard-B', 'en-US-Standard-C'];
    }
  }
}

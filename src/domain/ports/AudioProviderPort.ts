export interface TextToSpeechRequest {
  text: string;
  language: string;
  voice?: string;
}

export interface SpeechToTextRequest {
  audioBlob: Blob;
  language: string;
}

export interface IAudioProviderPort {
  textToSpeech(request: TextToSpeechRequest): Promise<Blob>;
  speechToText(request: SpeechToTextRequest): Promise<string>;
  validateApiKey(apiKey: string): Promise<boolean>;
  getAvailableModels(apiKey: string): Promise<string[]>;
  getAvailableVoices(apiKey: string): Promise<string[]>;
}

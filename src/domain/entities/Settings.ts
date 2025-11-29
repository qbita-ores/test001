import { LessonLevel } from './Lesson';

export type { LessonLevel };

export type TextProvider = 'openai' | 'gemini' | 'local';
export type AudioProvider = 'openai' | 'gemini';
export type LocalProvider = 'lmstudio' | 'ollama';

export interface TextProviderConfig {
  provider: TextProvider;
  apiKey: string;
  isValid: boolean;
  selectedModel: string;
  availableModels: string[];
  localProvider?: LocalProvider;
  localEndpoint?: string;
}

export interface AudioProviderConfig {
  provider: AudioProvider;
  apiKey: string;
  isValid: boolean;
  selectedModel: string;
  availableModels: string[];
  selectedVoice: string;
  availableVoices: string[];
}

export interface Settings {
  defaultLevel: LessonLevel;
  nativeLanguage: string;
  targetLanguage: string;
  textProvider: TextProviderConfig;
  audioProvider: AudioProviderConfig;
}

export const defaultSettings: Settings = {
  defaultLevel: 'C1',
  nativeLanguage: 'Français',
  targetLanguage: 'English',
  textProvider: {
    provider: 'openai',
    apiKey: '',
    isValid: false,
    selectedModel: '',
    availableModels: [],
  },
  audioProvider: {
    provider: 'openai',
    apiKey: '',
    isValid: false,
    selectedModel: '',
    availableModels: [],
    selectedVoice: '',
    availableVoices: [],
  },
};

export const updateTextProviderConfig = (
  settings: Settings,
  config: Partial<TextProviderConfig>
): Settings => ({
  ...settings,
  textProvider: {
    ...settings.textProvider,
    ...config,
  },
});

export const updateAudioProviderConfig = (
  settings: Settings,
  config: Partial<AudioProviderConfig>
): Settings => ({
  ...settings,
  audioProvider: {
    ...settings.audioProvider,
    ...config,
  },
});

export const SUPPORTED_LANGUAGES = [
  'English',
  'Français',
  'Español',
  'Deutsch',
  'Italiano',
  'Português',
  '日本語',
  '中文',
  '한국어',
  'العربية',
  'Русский',
  'Nederlands',
  'Polski',
  'Türkçe',
  'Svenska',
];

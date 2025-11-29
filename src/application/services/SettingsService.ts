import {
  Settings,
  TextProviderConfig,
  AudioProviderConfig,
  updateTextProviderConfig,
  updateAudioProviderConfig,
  defaultSettings,
} from '../../domain/entities/Settings';
import { IStoragePort } from '../../domain/ports';

export interface IProviderValidator {
  validateTextApiKey(provider: string, apiKey: string): Promise<boolean>;
  getTextModels(provider: string, apiKey: string): Promise<string[]>;
  validateAudioApiKey(provider: string, apiKey: string): Promise<boolean>;
  getAudioModels(provider: string, apiKey: string): Promise<string[]>;
  getAudioVoices(provider: string, apiKey: string): Promise<string[]>;
}

export class SettingsService {
  constructor(
    private storage: IStoragePort,
    private providerValidator: IProviderValidator
  ) {}

  async getSettings(): Promise<Settings> {
    const stored = await this.storage.getSettings();
    return stored || defaultSettings;
  }

  async saveSettings(settings: Settings): Promise<void> {
    await this.storage.saveSettings(settings);
  }

  async updateLanguages(
    settings: Settings,
    nativeLanguage: string,
    targetLanguage: string
  ): Promise<Settings> {
    const updated = {
      ...settings,
      nativeLanguage,
      targetLanguage,
    };
    await this.storage.saveSettings(updated);
    return updated;
  }

  async validateAndUpdateTextProvider(
    settings: Settings,
    config: Partial<TextProviderConfig>
  ): Promise<Settings> {
    let isValid = false;
    let availableModels: string[] = [];

    if (config.apiKey && config.provider) {
      isValid = await this.providerValidator.validateTextApiKey(
        config.provider,
        config.apiKey
      );

      if (isValid) {
        availableModels = await this.providerValidator.getTextModels(
          config.provider,
          config.apiKey
        );
      }
    }

    const updatedSettings = updateTextProviderConfig(settings, {
      ...config,
      isValid,
      availableModels,
      selectedModel:
        config.selectedModel ||
        (availableModels.length > 0 ? availableModels[0] : ''),
    });

    await this.storage.saveSettings(updatedSettings);
    return updatedSettings;
  }

  async validateAndUpdateAudioProvider(
    settings: Settings,
    config: Partial<AudioProviderConfig>
  ): Promise<Settings> {
    let isValid = false;
    let availableModels: string[] = [];
    let availableVoices: string[] = [];

    if (config.apiKey && config.provider) {
      isValid = await this.providerValidator.validateAudioApiKey(
        config.provider,
        config.apiKey
      );

      if (isValid) {
        [availableModels, availableVoices] = await Promise.all([
          this.providerValidator.getAudioModels(config.provider, config.apiKey),
          this.providerValidator.getAudioVoices(config.provider, config.apiKey),
        ]);
      }
    }

    const updatedSettings = updateAudioProviderConfig(settings, {
      ...config,
      isValid,
      availableModels,
      availableVoices,
      selectedModel:
        config.selectedModel ||
        (availableModels.length > 0 ? availableModels[0] : ''),
      selectedVoice:
        config.selectedVoice ||
        (availableVoices.length > 0 ? availableVoices[0] : ''),
    });

    await this.storage.saveSettings(updatedSettings);
    return updatedSettings;
  }
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  Volume2,
  Type,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  Settings,
  SUPPORTED_LANGUAGES,
  TextProvider,
  AudioProvider,
  LocalProvider,
  LessonLevel,
} from '@/domain/entities/Settings';
import { cn } from '@/lib/utils';

interface SettingsPageProps {
  settings: Settings;
  onSave: () => Promise<void>;
  onUpdateSettings: (settings: Settings) => void;
  onValidateTextProvider: (apiKey: string) => Promise<boolean>;
  onValidateAudioProvider: (apiKey: string) => Promise<boolean>;
}

export function SettingsPage({
  settings,
  onSave,
  onUpdateSettings,
  onValidateTextProvider,
  onValidateAudioProvider,
}: SettingsPageProps) {
  const [isValidatingText, setIsValidatingText] = useState(false);
  const [isValidatingAudio, setIsValidatingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [textApiKey, setTextApiKey] = useState(settings.textProvider.apiKey);
  const [audioApiKey, setAudioApiKey] = useState(settings.audioProvider.apiKey);

  const languageOptions = SUPPORTED_LANGUAGES.map((lang) => ({
    value: lang,
    label: lang,
  }));

  const levelOptions = [
    { value: 'C1', label: 'C1 - Intermediate' },
    { value: 'C2', label: 'C2 - Upper Intermediate' },
    { value: 'C3', label: 'C3 - Advanced' },
  ];

  const textProviderOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'local', label: 'Local (LM Studio / Ollama)' },
  ];

  const audioProviderOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Cloud TTS' },
  ];

  const localProviderOptions = [
    { value: 'lmstudio', label: 'LM Studio' },
    { value: 'ollama', label: 'Ollama' },
  ];

  const handleValidateTextProvider = useCallback(async () => {
    if (!textApiKey && settings.textProvider.provider !== 'local') return;
    setIsValidatingText(true);
    try {
      await onValidateTextProvider(textApiKey);
    } finally {
      setIsValidatingText(false);
    }
  }, [textApiKey, settings.textProvider.provider, onValidateTextProvider]);

  const handleValidateAudioProvider = useCallback(async () => {
    if (!audioApiKey) return;
    setIsValidatingAudio(true);
    try {
      await onValidateAudioProvider(audioApiKey);
    } finally {
      setIsValidatingAudio(false);
    }
  }, [audioApiKey, onValidateAudioProvider]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const updateTextProvider = (updates: Partial<typeof settings.textProvider>) => {
    onUpdateSettings({
      ...settings,
      textProvider: { ...settings.textProvider, ...updates },
    });
  };

  const updateAudioProvider = (updates: Partial<typeof settings.audioProvider>) => {
    onUpdateSettings({
      ...settings,
      audioProvider: { ...settings.audioProvider, ...updates },
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure your language learning preferences</p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>General Settings</span>
          </CardTitle>
          <CardDescription>
            Set your language preferences and default learning level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Native Language
              </label>
              <Select
                value={settings.nativeLanguage}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, nativeLanguage: e.target.value })
                }
                options={languageOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Language (Learning)
              </label>
              <Select
                value={settings.targetLanguage}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, targetLanguage: e.target.value })
                }
                options={languageOptions}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Learning Level
            </label>
            <Select
              value={settings.defaultLevel}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultLevel: e.target.value as LessonLevel,
                })
              }
              options={levelOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Provider Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="h-5 w-5 text-green-600" />
            <span>Text Generation Provider</span>
          </CardTitle>
          <CardDescription>
            Configure the AI provider for text generation and conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <Select
              value={settings.textProvider.provider}
              onChange={(e) =>
                updateTextProvider({
                  provider: e.target.value as TextProvider,
                  isValid: false,
                  availableModels: [],
                })
              }
              options={textProviderOptions}
            />
          </div>

          {settings.textProvider.provider === 'local' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local Provider Type
                </label>
                <Select
                  value={settings.textProvider.localProvider || 'lmstudio'}
                  onChange={(e) =>
                    updateTextProvider({
                      localProvider: e.target.value as LocalProvider,
                    })
                  }
                  options={localProviderOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint URL
                </label>
                <Input
                  value={settings.textProvider.localEndpoint || 'http://localhost:1234'}
                  onChange={(e) =>
                    updateTextProvider({ localEndpoint: e.target.value })
                  }
                  placeholder="http://localhost:1234"
                />
              </div>
            </>
          )}

          {settings.textProvider.provider !== 'local' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="flex space-x-2">
                <Input
                  type="password"
                  value={textApiKey}
                  onChange={(e) => setTextApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1"
                />
                <Button
                  onClick={handleValidateTextProvider}
                  disabled={!textApiKey || isValidatingText}
                >
                  {isValidatingText ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {settings.textProvider.apiKey && (
                <div className="flex items-center mt-2">
                  {settings.textProvider.isValid ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      API key validated
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Invalid API key
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {settings.textProvider.availableModels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <Select
                value={settings.textProvider.selectedModel}
                onChange={(e) =>
                  updateTextProvider({ selectedModel: e.target.value })
                }
                options={settings.textProvider.availableModels.map((m) => ({
                  value: m,
                  label: m,
                }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Provider Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            <span>Audio Provider</span>
          </CardTitle>
          <CardDescription>
            Configure the AI provider for text-to-speech and speech-to-text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <Select
              value={settings.audioProvider.provider}
              onChange={(e) =>
                updateAudioProvider({
                  provider: e.target.value as AudioProvider,
                  isValid: false,
                  availableModels: [],
                  availableVoices: [],
                })
              }
              options={audioProviderOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="flex space-x-2">
              <Input
                type="password"
                value={audioApiKey}
                onChange={(e) => setAudioApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="flex-1"
              />
              <Button
                onClick={handleValidateAudioProvider}
                disabled={!audioApiKey || isValidatingAudio}
              >
                {isValidatingAudio ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
              </Button>
            </div>
            {settings.audioProvider.apiKey && (
              <div className="flex items-center mt-2">
                {settings.audioProvider.isValid ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    API key validated
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 text-sm">
                    <XCircle className="h-4 w-4 mr-1" />
                    Invalid API key
                  </span>
                )}
              </div>
            )}
          </div>

          {settings.audioProvider.availableModels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <Select
                value={settings.audioProvider.selectedModel}
                onChange={(e) =>
                  updateAudioProvider({ selectedModel: e.target.value })
                }
                options={settings.audioProvider.availableModels.map((m) => ({
                  value: m,
                  label: m,
                }))}
              />
            </div>
          )}

          {settings.audioProvider.availableVoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice
              </label>
              <Select
                value={settings.audioProvider.selectedVoice}
                onChange={(e) =>
                  updateAudioProvider({ selectedVoice: e.target.value })
                }
                options={settings.audioProvider.availableVoices.map((v) => ({
                  value: v,
                  label: v,
                }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

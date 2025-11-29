'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useSettings } from '@/hooks/useServices';
import { Spinner } from '@/components/ui/Spinner';

export default function SettingsPageRoute() {
  const {
    settings,
    loadSettings,
    saveSettings,
    validateTextProvider,
    validateAudioProvider,
    setSettings,
  } = useSettings();

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadSettings();
      setIsInitialLoading(false);
    };
    init();
  }, [loadSettings]);

  if (isInitialLoading) {
    return (
      <MainLayout title="Settings">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Settings">
      <SettingsPage
        settings={settings}
        onSave={saveSettings}
        onUpdateSettings={setSettings}
        onValidateTextProvider={validateTextProvider}
        onValidateAudioProvider={validateAudioProvider}
      />
    </MainLayout>
  );
}

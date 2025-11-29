'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  SpeakingExerciseCreator,
  SpeakingExerciseViewer,
} from '@/components/exercise/SpeakingExercise';
import { ExerciseList } from '@/components/exercise/ExerciseList';
import { useExercise } from '@/hooks/useServices';
import { useAppStore } from '@/lib/store';
import { Spinner } from '@/components/ui/Spinner';
import { LessonLevel } from '@/domain/entities/Lesson';

export default function SpeakingPage() {
  const {
    speakingExercises,
    currentSpeakingExercise,
    loadExercises,
    createSpeakingExercise,
    evaluateSpeaking,
    deleteSpeakingExercise,
    selectSpeakingExercise,
    setCurrentSpeakingExercise,
    generateExerciseText,
  } = useExercise();

  const { settings } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [tempExercise, setTempExercise] = useState<{
    title: string;
    level: string;
    originalText: string;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadExercises();
      setIsInitialLoading(false);
    };
    init();
  }, [loadExercises]);

  const handleCreateExercise = useCallback(
    async (title: string, context: string, level: LessonLevel) => {
      // Switch to viewer immediately with loading state
      setTempExercise({ title, level, originalText: context });
      setShowCreator(false);
      setIsGeneratingContent(true);
      
      try {
        // Create exercise in background
        await createSpeakingExercise(title, context);
        setTempExercise(null);
      } catch (error) {
        console.error('Error creating exercise:', error);
        // Go back to creator on error
        setShowCreator(true);
        setTempExercise(null);
      } finally {
        setIsGeneratingContent(false);
      }
    },
    [createSpeakingExercise]
  );

  const handleGenerateText = useCallback(
    async (partial: string) => {
      return generateExerciseText(partial, 'speaking');
    },
    [generateExerciseText]
  );

  const handleEvaluate = useCallback(
    async (recordingBlob: Blob) => {
      setIsLoading(true);
      try {
        await evaluateSpeaking(recordingBlob);
      } finally {
        setIsLoading(false);
      }
    },
    [evaluateSpeaking]
  );

  const handleSelectExercise = useCallback(
    async (id: string) => {
      await selectSpeakingExercise(id);
      setShowCreator(false);
    },
    [selectSpeakingExercise]
  );

  const handleNewExercise = useCallback(() => {
    setCurrentSpeakingExercise(null);
    setShowCreator(true);
  }, [setCurrentSpeakingExercise]);

  if (isInitialLoading) {
    return (
      <MainLayout title="Speaking Practice">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Speaking Practice"
      sidebar={
        <ExerciseList
          exercises={speakingExercises}
          type="speaking"
          currentExerciseId={currentSpeakingExercise?.id}
          onSelectExercise={handleSelectExercise}
          onDeleteExercise={deleteSpeakingExercise}
          onNewExercise={handleNewExercise}
        />
      }
    >
      <div className={showCreator || (!currentSpeakingExercise && !tempExercise) ? "p-6" : "p-6 h-full flex flex-col"}>
        {showCreator || (!currentSpeakingExercise && !tempExercise) ? (
          <SpeakingExerciseCreator
            onCreateExercise={handleCreateExercise}
            onGenerateText={handleGenerateText}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <SpeakingExerciseViewer
              exercise={currentSpeakingExercise || {
                id: 'temp',
                title: tempExercise?.title || '',
                level: (tempExercise?.level as LessonLevel) || 'C1',
                originalText: tempExercise?.originalText || '',
                context: tempExercise?.originalText || '',
                targetLanguage: settings.targetLanguage,
                nativeLanguage: settings.nativeLanguage,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              onEvaluate={handleEvaluate}
              isLoading={isLoading}
              isGenerating={isGeneratingContent}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

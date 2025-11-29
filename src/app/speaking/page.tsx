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

  useEffect(() => {
    const init = async () => {
      await loadExercises();
      setIsInitialLoading(false);
    };
    init();
  }, [loadExercises]);

  const handleCreateExercise = useCallback(
    async (title: string, context: string, level: LessonLevel) => {
      setIsLoading(true);
      try {
        // Create exercise and switch to viewer immediately
        await createSpeakingExercise(title, context);
        setShowCreator(false);
        setIsGeneratingContent(true);
      } catch (error) {
        console.error('Error creating exercise:', error);
      } finally {
        setIsLoading(false);
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
      <div className={showCreator || !currentSpeakingExercise ? "p-6" : "p-6 h-full flex flex-col"}>
        {showCreator || !currentSpeakingExercise ? (
          <SpeakingExerciseCreator
            onCreateExercise={handleCreateExercise}
            onGenerateText={handleGenerateText}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <SpeakingExerciseViewer
              exercise={currentSpeakingExercise}
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

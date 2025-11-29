'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  ListeningExerciseCreator,
  ListeningExerciseViewer,
} from '@/components/exercise/ListeningExercise';
import { ExerciseList } from '@/components/exercise/ExerciseList';
import { useExercise } from '@/hooks/useServices';
import { useAppStore } from '@/lib/store';
import { Spinner } from '@/components/ui/Spinner';
import { LessonLevel } from '@/domain/entities/Lesson';

export default function ListeningPage() {
  const {
    listeningExercises,
    currentListeningExercise,
    loadExercises,
    createListeningExercise,
    generateListeningAudio,
    evaluateListening,
    deleteListeningExercise,
    selectListeningExercise,
    setCurrentListeningExercise,
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
        await createListeningExercise(title, context);
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
    [createListeningExercise]
  );

  const handleGenerateText = useCallback(
    async (partial: string) => {
      return generateExerciseText(partial, 'listening');
    },
    [generateExerciseText]
  );

  const handleGenerateAudio = useCallback(async () => {
    setIsLoading(true);
    try {
      await generateListeningAudio();
    } finally {
      setIsLoading(false);
    }
  }, [generateListeningAudio]);

  const handleEvaluate = useCallback(
    async (transcription: string) => {
      setIsLoading(true);
      try {
        await evaluateListening(transcription);
      } finally {
        setIsLoading(false);
      }
    },
    [evaluateListening]
  );

  const handleSelectExercise = useCallback(
    async (id: string) => {
      await selectListeningExercise(id);
      setShowCreator(false);
    },
    [selectListeningExercise]
  );

  const handleNewExercise = useCallback(() => {
    setCurrentListeningExercise(null);
    setShowCreator(true);
  }, [setCurrentListeningExercise]);

  if (isInitialLoading) {
    return (
      <MainLayout title="Listening Practice">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Listening Practice"
      sidebar={
        <ExerciseList
          exercises={listeningExercises}
          type="listening"
          currentExerciseId={currentListeningExercise?.id}
          onSelectExercise={handleSelectExercise}
          onDeleteExercise={deleteListeningExercise}
          onNewExercise={handleNewExercise}
        />
      }
    >
      <div className={showCreator || (!currentListeningExercise && !tempExercise) ? "p-6" : "p-6 h-full flex flex-col"}>
        {showCreator || (!currentListeningExercise && !tempExercise) ? (
          <ListeningExerciseCreator
            onCreateExercise={handleCreateExercise}
            onGenerateText={handleGenerateText}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <ListeningExerciseViewer
              exercise={currentListeningExercise || {
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
              onGenerateAudio={handleGenerateAudio}
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

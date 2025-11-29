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
        await createListeningExercise(title, context);
        setShowCreator(false);
      } finally {
        setIsLoading(false);
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
      <div className={showCreator || !currentListeningExercise ? "p-6" : "p-6 h-full flex flex-col"}>
        {showCreator || !currentListeningExercise ? (
          <ListeningExerciseCreator
            onCreateExercise={handleCreateExercise}
            onGenerateText={handleGenerateText}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <ListeningExerciseViewer
              exercise={currentListeningExercise}
              onGenerateAudio={handleGenerateAudio}
              onEvaluate={handleEvaluate}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

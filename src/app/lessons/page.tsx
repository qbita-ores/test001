'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LessonCreator, LessonViewer } from '@/components/lesson/LessonCreator';
import { LessonList } from '@/components/lesson/LessonList';
import { useLesson, useChat } from '@/hooks/useServices';
import { useAppStore } from '@/lib/store';
import { Spinner } from '@/components/ui/Spinner';
import { LessonLevel } from '@/domain/entities/Lesson';

export default function LessonsPage() {
  const {
    lessons,
    currentLesson,
    loadLessons,
    createLesson,
    generateContent,
    suggestContext,
    completeContext,
    deleteLesson,
    selectLesson,
    setCurrentLesson,
  } = useLesson();

  const { currentChat } = useChat();
  const { settings } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadLessons();
      setIsInitialLoading(false);
    };
    init();
  }, [loadLessons]);

  const handleCreateLesson = useCallback(
    async (title: string, context: string, level: LessonLevel) => {
      setIsLoading(true);
      try {
        const newLesson = await createLesson(title, context);
        await generateContent(newLesson);
        setShowCreator(false);
      } finally {
        setIsLoading(false);
      }
    },
    [createLesson, generateContent]
  );

  const handleSelectLesson = useCallback(
    async (id: string) => {
      await selectLesson(id);
      setShowCreator(false);
    },
    [selectLesson]
  );

  const handleNewLesson = useCallback(() => {
    setCurrentLesson(null);
    setShowCreator(true);
  }, [setCurrentLesson]);

  if (isInitialLoading) {
    return (
      <MainLayout title="Lessons">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Lessons"
      sidebar={
        <LessonList
          lessons={lessons}
          currentLessonId={currentLesson?.id}
          onSelectLesson={handleSelectLesson}
          onDeleteLesson={deleteLesson}
          onNewLesson={handleNewLesson}
        />
      }
    >
      <div className="p-6">
        {showCreator || !currentLesson ? (
          <LessonCreator
            onCreateLesson={handleCreateLesson}
            onSuggestContext={suggestContext}
            onCompleteContext={completeContext}
            chatAvailable={!!currentChat && currentChat.messages.length > 0}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <LessonViewer lesson={currentLesson} />
        )}
      </div>
    </MainLayout>
  );
}

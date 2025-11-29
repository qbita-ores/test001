'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseList, CourseCreator, CourseViewer, CourseFormData } from '@/components/course';
import { useCourse, useLesson } from '@/hooks/useServices';
import { useAppStore } from '@/lib/store';
import { Spinner } from '@/components/ui/Spinner';

export default function CoursesPage() {
  const {
    courses,
    currentCourse,
    courseLessons,
    loadCourses,
    createCourse,
    updateCourse,
    publishCourse,
    archiveCourse,
    deleteCourse,
    selectCourse,
    setCurrentCourse,
    addLesson,
    removeLesson,
    reorderLessons,
  } = useCourse();

  const { loadLessons } = useLesson();
  const { settings } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCourses(), loadLessons()]);
      setIsInitialLoading(false);
    };
    init();
  }, [loadCourses, loadLessons]);

  const handleCreateCourse = useCallback(
    async (data: CourseFormData) => {
      setIsLoading(true);
      try {
        await createCourse(data);
        setShowCreator(false);
      } catch (error) {
        console.error('Error creating course:', error);
        alert('Erreur lors de la création du cours: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    },
    [createCourse]
  );

  const handleSelectCourse = useCallback(
    async (id: string) => {
      await selectCourse(id);
      setShowCreator(false);
    },
    [selectCourse]
  );

  const handleNewCourse = useCallback(() => {
    setCurrentCourse(null);
    setShowCreator(true);
  }, [setCurrentCourse]);

  const handleDeleteCourse = useCallback(
    async (id: string) => {
      await deleteCourse(id);
      if (currentCourse?.id === id) {
        setCurrentCourse(null);
      }
    },
    [deleteCourse, currentCourse, setCurrentCourse]
  );

  const handleUpdate = useCallback(
    async (updates: Partial<typeof currentCourse>) => {
      if (!updates) return;
      await updateCourse(updates);
    },
    [updateCourse]
  );

  const handleAddLesson = useCallback(() => {
    // TODO: Open lesson selector modal
    alert('Fonctionnalité à venir: Sélectionner une leçon existante ou créer une nouvelle leçon');
  }, []);

  const handleViewLesson = useCallback((lessonId: string) => {
    // TODO: Navigate to lesson page
    console.log('View lesson:', lessonId);
  }, []);

  if (isInitialLoading) {
    return (
      <MainLayout title="Cours">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Cours"
      sidebar={
        <CourseList
          courses={courses}
          currentCourseId={currentCourse?.id}
          onSelectCourse={handleSelectCourse}
          onDeleteCourse={handleDeleteCourse}
          onNewCourse={handleNewCourse}
        />
      }
    >
      <div className={showCreator || !currentCourse ? "p-6" : "p-6 h-full flex flex-col"}>
        {showCreator || !currentCourse ? (
          <CourseCreator
            onCreateCourse={handleCreateCourse}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <CourseViewer
              course={currentCourse}
              lessons={courseLessons}
              onUpdate={handleUpdate}
              onDelete={() => handleDeleteCourse(currentCourse.id)}
              onPublish={publishCourse}
              onArchive={archiveCourse}
              onAddLesson={handleAddLesson}
              onRemoveLesson={removeLesson}
              onReorderLessons={reorderLessons}
              onViewLesson={handleViewLesson}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProgrammeList, ProgrammeCreator, ProgrammeViewer, ProgrammeFormData } from '@/components/programme';
import { useProgramme } from '@/hooks/useServices';
import { useAppStore } from '@/lib/store';
import { Spinner } from '@/components/ui/Spinner';

export default function ProgrammesPage() {
  const {
    programmes,
    currentProgramme,
    programmeCourses,
    courses,
    loadProgrammes,
    loadCourses,
    createProgramme,
    updateProgramme,
    publishProgramme,
    archiveProgramme,
    deleteProgramme,
    selectProgramme,
    setCurrentProgramme,
    addCourse,
    removeCourse,
    reorderCourses,
  } = useProgramme();

  const { settings } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadProgrammes(), loadCourses()]);
      setIsInitialLoading(false);
    };
    init();
  }, [loadProgrammes, loadCourses]);

  const handleCreateProgramme = useCallback(
    async (data: ProgrammeFormData) => {
      setIsLoading(true);
      try {
        await createProgramme(data);
        setShowCreator(false);
      } catch (error) {
        console.error('Error creating programme:', error);
        alert('Erreur lors de la création du programme: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    },
    [createProgramme]
  );

  const handleSelectProgramme = useCallback(
    async (id: string) => {
      await selectProgramme(id);
      setShowCreator(false);
    },
    [selectProgramme]
  );

  const handleNewProgramme = useCallback(() => {
    setCurrentProgramme(null);
    setShowCreator(true);
  }, [setCurrentProgramme]);

  const handleDeleteProgramme = useCallback(
    async (id: string) => {
      await deleteProgramme(id);
      if (currentProgramme?.id === id) {
        setCurrentProgramme(null);
      }
    },
    [deleteProgramme, currentProgramme, setCurrentProgramme]
  );

  const handleUpdate = useCallback(
    async (updates: Partial<typeof currentProgramme>) => {
      if (!updates) return;
      await updateProgramme(updates);
    },
    [updateProgramme]
  );

  const handleAddCourse = useCallback(() => {
    // TODO: Open course selector modal
    alert('Fonctionnalité à venir: Sélectionner un cours existant ou créer un nouveau cours');
  }, []);

  const handleViewCourse = useCallback((courseId: string) => {
    // TODO: Navigate to course page
    console.log('View course:', courseId);
  }, []);

  if (isInitialLoading) {
    return (
      <MainLayout title="Programmes">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Programmes"
      sidebar={
        <ProgrammeList
          programmes={programmes}
          currentProgrammeId={currentProgramme?.id}
          onSelectProgramme={handleSelectProgramme}
          onDeleteProgramme={handleDeleteProgramme}
          onNewProgramme={handleNewProgramme}
        />
      }
    >
      <div className={showCreator || !currentProgramme ? "p-6" : "p-6 h-full flex flex-col"}>
        {showCreator || !currentProgramme ? (
          <ProgrammeCreator
            onCreateProgramme={handleCreateProgramme}
            isLoading={isLoading}
            defaultLevel={settings.defaultLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <ProgrammeViewer
              programme={currentProgramme}
              courses={programmeCourses}
              onUpdate={handleUpdate}
              onDelete={() => handleDeleteProgramme(currentProgramme.id)}
              onPublish={publishProgramme}
              onArchive={archiveProgramme}
              onAddCourse={handleAddCourse}
              onRemoveCourse={removeCourse}
              onReorderCourses={reorderCourses}
              onViewCourse={handleViewCourse}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

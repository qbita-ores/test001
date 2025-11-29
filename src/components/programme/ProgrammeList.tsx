'use client';

import { Programme } from '@/domain/entities/Programme';
import { BookOpen, Plus, Trash2, Clock, Users, GraduationCap } from 'lucide-react';

interface ProgrammeListProps {
  programmes: Programme[];
  currentProgrammeId?: string;
  onSelectProgramme: (id: string) => void;
  onDeleteProgramme: (id: string) => void;
  onNewProgramme: () => void;
}

export function ProgrammeList({
  programmes,
  currentProgrammeId,
  onSelectProgramme,
  onDeleteProgramme,
  onNewProgramme,
}: ProgrammeListProps) {
  const getStatusBadge = (status: Programme['status']) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      archived: 'Archivé',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      C1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      C2: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      C3: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[level] || styles.C1}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewProgramme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Nouveau Programme</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {programmes.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun programme</p>
            <p className="text-xs mt-1">Créez votre premier programme d&apos;apprentissage</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {programmes.map((programme) => (
              <div
                key={programme.id}
                onClick={() => onSelectProgramme(programme.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all border ${
                  currentProgrammeId === programme.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {programme.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {programme.description || 'Aucune description'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {getLevelBadge(programme.level)}
                      {getStatusBadge(programme.status)}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {programme.duration.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {programme.courseIds.length} cours
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Supprimer ce programme ?')) {
                        onDeleteProgramme(programme.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

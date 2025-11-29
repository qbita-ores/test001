'use client';

import { format } from 'date-fns';
import { Mic, Headphones, Trash2, MoreVertical, CheckCircle } from 'lucide-react';
import { SpeakingExercise, ListeningExercise } from '@/domain/entities/Exercise';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface ExerciseListProps {
  exercises: (SpeakingExercise | ListeningExercise)[];
  type: 'speaking' | 'listening';
  currentExerciseId?: string;
  onSelectExercise: (id: string) => void;
  onDeleteExercise: (id: string) => void;
  onNewExercise: () => void;
}

export function ExerciseList({
  exercises,
  type,
  currentExerciseId,
  onSelectExercise,
  onDeleteExercise,
  onNewExercise,
}: ExerciseListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDeleteExercise(id);
      setMenuOpenId(null);
    },
    [onDeleteExercise]
  );

  const Icon = type === 'speaking' ? Mic : Headphones;
  const iconColor = type === 'speaking' ? 'text-green-600' : 'text-purple-600';
  const buttonColor = type === 'speaking' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'C1':
        return 'bg-green-100 text-green-700';
      case 'C2':
        return 'bg-yellow-100 text-yellow-700';
      case 'C3':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Exercise Button */}
      <div className="p-3 border-b border-gray-100">
        <Button onClick={onNewExercise} className={cn("w-full text-white", buttonColor)}>
          <Icon className="h-4 w-4 mr-2" />
          New {type === 'speaking' ? 'Speaking' : 'Listening'} Exercise
        </Button>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto">
        {exercises.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No {type} exercises yet. Create your first one!
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {exercises.map((exercise) => (
              <li
                key={exercise.id}
                onClick={() => onSelectExercise(exercise.id)}
                className={cn(
                  "relative px-3 py-3 cursor-pointer transition-colors hover:bg-gray-50",
                  currentExerciseId === exercise.id && "bg-blue-50 hover:bg-blue-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          currentExerciseId === exercise.id ? "text-blue-600" : "text-gray-900"
                        )}
                      >
                        {exercise.title}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getLevelColor(exercise.level)
                        )}
                      >
                        {exercise.level}
                      </span>
                      {exercise.completedAt && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {exercise.targetLanguage}
                    </p>
                  </div>

                  {/* Menu Button */}
                  <div className="relative ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === exercise.id ? null : exercise.id);
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>

                    {menuOpenId === exercise.id && (
                      <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={(e) => handleDelete(e, exercise.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400 mt-2">
                  {format(new Date(exercise.updatedAt), 'MMM d, yyyy')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

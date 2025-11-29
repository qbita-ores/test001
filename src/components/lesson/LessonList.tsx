'use client';

import { format } from 'date-fns';
import { BookOpen, Trash2, MoreVertical, Check } from 'lucide-react';
import { Lesson } from '@/domain/entities/Lesson';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId?: string;
  onSelectLesson: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onNewLesson: () => void;
}

export function LessonList({
  lessons,
  currentLessonId,
  onSelectLesson,
  onDeleteLesson,
  onNewLesson,
}: LessonListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDeleteLesson(id);
      setMenuOpenId(null);
    },
    [onDeleteLesson]
  );

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
      {/* New Lesson Button */}
      <div className="p-3 border-b border-gray-100">
        <Button onClick={onNewLesson} className="w-full">
          <BookOpen className="h-4 w-4 mr-2" />
          New Lesson
        </Button>
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto">
        {lessons.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No lessons yet. Create your first lesson!
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className={cn(
                  "relative px-3 py-3 cursor-pointer transition-colors hover:bg-gray-50",
                  currentLessonId === lesson.id && "bg-blue-50 hover:bg-blue-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          currentLessonId === lesson.id ? "text-blue-600" : "text-gray-900"
                        )}
                      >
                        {lesson.title}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getLevelColor(lesson.level)
                        )}
                      >
                        {lesson.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lesson.targetLanguage}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                        {lesson.content.vocabulary.length} words
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                        {lesson.content.grammar.length} rules
                      </span>
                    </div>
                  </div>

                  {/* Menu Button */}
                  <div className="relative ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === lesson.id ? null : lesson.id);
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>

                    {menuOpenId === lesson.id && (
                      <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={(e) => handleDelete(e, lesson.id)}
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
                  {format(new Date(lesson.updatedAt), 'MMM d, yyyy')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

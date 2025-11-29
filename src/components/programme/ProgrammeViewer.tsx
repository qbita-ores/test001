'use client';

import { Programme } from '@/domain/entities/Programme';
import { Course } from '@/domain/entities/Course';
import { 
  BookOpen, Edit2, Save, X, Trash2, Plus, GripVertical,
  Clock, Target, Globe, Tag, Calendar, Eye, EyeOff,
  ChevronRight, GraduationCap, CheckCircle, AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { LessonLevel } from '@/domain/entities/Lesson';
import { Spinner } from '@/components/ui/Spinner';

interface ProgrammeViewerProps {
  programme: Programme;
  courses: Course[];
  onUpdate: (updates: Partial<Programme>) => Promise<void>;
  onDelete: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onAddCourse: () => void;
  onRemoveCourse: (courseId: string) => void;
  onReorderCourses: (courseIds: string[]) => void;
  onViewCourse: (courseId: string) => void;
  isLoading?: boolean;
}

const LANGUAGES: Record<string, { name: string; flag: string }> = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  ar: { name: 'العربية', flag: '🇸🇦' },
};

export function ProgrammeViewer({
  programme,
  courses,
  onUpdate,
  onDelete,
  onPublish,
  onArchive,
  onAddCourse,
  onRemoveCourse,
  onReorderCourses,
  onViewCourse,
  isLoading = false,
}: ProgrammeViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(programme.title);
  const [editedDescription, setEditedDescription] = useState(programme.description);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        title: editedTitle,
        description: editedDescription,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(programme.title);
    setEditedDescription(programme.description);
    setIsEditing(false);
  };

  const handleDragStart = (courseId: string) => {
    setDraggedCourseId(courseId);
  };

  const handleDragOver = (e: React.DragEvent, targetCourseId: string) => {
    e.preventDefault();
    if (!draggedCourseId || draggedCourseId === targetCourseId) return;

    const newOrder = [...programme.courseIds];
    const draggedIndex = newOrder.indexOf(draggedCourseId);
    const targetIndex = newOrder.indexOf(targetCourseId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCourseId);

    onReorderCourses(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedCourseId(null);
  };

  const getStatusConfig = (status: Programme['status']) => {
    const configs = {
      draft: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        icon: AlertCircle,
        label: 'Brouillon',
      },
      published: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        icon: CheckCircle,
        label: 'Publié',
      },
      archived: {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-800 dark:text-gray-400',
        icon: EyeOff,
        label: 'Archivé',
      },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(programme.status);
  const StatusIcon = statusConfig.icon;

  const targetLang = LANGUAGES[programme.targetLanguage] || { name: programme.targetLanguage, flag: '🌐' };
  const nativeLang = LANGUAGES[programme.nativeLanguage] || { name: programme.nativeLanguage, flag: '🌐' };

  // Get courses in order
  const orderedCourses = programme.courseIds
    .map(id => courses.find(c => c.id === id))
    .filter((c): c is Course => c !== undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement du programme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-2xl font-bold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-blue-500" />
                {programme.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                <Target className="w-4 h-4" />
                Niveau {programme.level}
              </span>

              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                {targetLang.flag} {targetLang.name} → {nativeLang.flag} {nativeLang.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {programme.status === 'draft' && (
                  <button
                    onClick={onPublish}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Publier
                  </button>
                )}
                {programme.status === 'published' && (
                  <button
                    onClick={onArchive}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <EyeOff className="w-4 h-4" />
                    Archiver
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
                      onDelete();
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Description du programme..."
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {programme.description || 'Aucune description'}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {programme.duration.estimatedHours}h estimées
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {programme.duration.weeksRecommended} semaines
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {programme.courseIds.length} cours
          </span>
        </div>

        {/* Tags */}
        {programme.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Tag className="w-4 h-4 text-gray-400" />
            {programme.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Courses List */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Cours du programme
          </h2>
          <button
            onClick={onAddCourse}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter un cours
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {orderedCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun cours dans ce programme</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Ajoutez des cours pour construire votre programme
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderedCourses.map((course, index) => (
                <div
                  key={course.id}
                  draggable
                  onDragStart={() => handleDragStart(course.id)}
                  onDragOver={(e) => handleDragOver(e, course.id)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-move ${
                    draggedCourseId === course.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{course.lessonIds.length} leçons</span>
                      <span>•</span>
                      <span>{course.duration.estimatedHours}h</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        course.status === 'published' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {course.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewCourse(course.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="Voir le cours"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Retirer ce cours du programme ?')) {
                          onRemoveCourse(course.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Retirer"
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
    </div>
  );
}

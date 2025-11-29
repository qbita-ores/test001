'use client';

import { Course } from '@/domain/entities/Course';
import { Lesson } from '@/domain/entities/Lesson';
import { 
  BookOpen, Edit2, Save, X, Trash2, Plus, GripVertical,
  Clock, Target, Globe, Tag, Calendar, Eye, EyeOff,
  ChevronRight, Layers, CheckCircle, AlertCircle, ListChecks
} from 'lucide-react';
import { useState } from 'react';
import { LessonLevel } from '@/domain/entities/Lesson';
import { Spinner } from '@/components/ui/Spinner';

interface CourseViewerProps {
  course: Course;
  lessons: Lesson[];
  onUpdate: (updates: Partial<Course>) => Promise<void>;
  onDelete: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onAddLesson: () => void;
  onRemoveLesson: (lessonId: string) => void;
  onReorderLessons: (lessonIds: string[]) => void;
  onViewLesson: (lessonId: string) => void;
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

export function CourseViewer({
  course,
  lessons,
  onUpdate,
  onDelete,
  onPublish,
  onArchive,
  onAddLesson,
  onRemoveLesson,
  onReorderLessons,
  onViewLesson,
  isLoading = false,
}: CourseViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(course.title);
  const [editedDescription, setEditedDescription] = useState(course.description);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'objectives' | 'info'>('lessons');

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
    setEditedTitle(course.title);
    setEditedDescription(course.description);
    setIsEditing(false);
  };

  const handleDragStart = (lessonId: string) => {
    setDraggedLessonId(lessonId);
  };

  const handleDragOver = (e: React.DragEvent, targetLessonId: string) => {
    e.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetLessonId) return;

    const newOrder = [...course.lessonIds];
    const draggedIndex = newOrder.indexOf(draggedLessonId);
    const targetIndex = newOrder.indexOf(targetLessonId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedLessonId);

    onReorderLessons(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedLessonId(null);
  };

  const getStatusConfig = (status: Course['status']) => {
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

  const statusConfig = getStatusConfig(course.status);
  const StatusIcon = statusConfig.icon;

  const targetLang = LANGUAGES[course.targetLanguage] || { name: course.targetLanguage, flag: '🌐' };
  const nativeLang = LANGUAGES[course.nativeLanguage] || { name: course.nativeLanguage, flag: '🌐' };

  // Get lessons in order
  const orderedLessons = course.lessonIds
    .map(id => lessons.find(l => l.id === id))
    .filter((l): l is Lesson => l !== undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement du cours...</p>
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
                className="w-full text-2xl font-bold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-indigo-500" />
                {course.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400">
                <Target className="w-4 h-4" />
                Niveau {course.level}
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
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {course.status === 'draft' && (
                  <button
                    onClick={onPublish}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Publier
                  </button>
                )}
                {course.status === 'published' && (
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
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Description du cours..."
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {course.description || 'Aucune description'}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {course.duration.estimatedHours}h estimées
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            {course.lessonIds.length} leçons
          </span>
        </div>

        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Tag className="w-4 h-4 text-gray-400" />
            {course.tags.map((tag) => (
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

      {/* Tabs */}
      <div className="flex-shrink-0 flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'lessons'
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Leçons ({orderedLessons.length})
        </button>
        <button
          onClick={() => setActiveTab('objectives')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'objectives'
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ListChecks className="w-4 h-4 inline mr-2" />
          Objectifs ({course.objectives.length})
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'info'
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Infos
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        {activeTab === 'lessons' && (
          <>
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Leçons du cours
              </h2>
              <button
                onClick={onAddLesson}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Ajouter une leçon
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {orderedLessons.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune leçon dans ce cours</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Ajoutez des leçons pour construire votre cours
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderedLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      draggable
                      onDragStart={() => handleDragStart(lesson.id)}
                      onDragOver={(e) => handleDragOver(e, lesson.id)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-move ${
                        draggedLessonId === lesson.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{lesson.topic}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded ${
                            lesson.status === 'published' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {lesson.status === 'published' ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewLesson(lesson.id)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          title="Voir la leçon"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Retirer cette leçon du cours ?')) {
                              onRemoveLesson(lesson.id);
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
          </>
        )}

        {activeTab === 'objectives' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Objectives */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Objectifs d&apos;apprentissage
                </h3>
                {course.objectives.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun objectif défini</p>
                ) : (
                  <ul className="space-y-2">
                    {course.objectives.map((obj, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{obj}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Prerequisites */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Prérequis
                </h3>
                {course.prerequisites.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun prérequis</p>
                ) : (
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                        <span className="text-gray-700 dark:text-gray-300">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm mt-1">{course.slug}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé le</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(course.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modifié le</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(course.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durée</label>
                  <p className="text-gray-900 dark:text-white mt-1">{course.duration.estimatedHours} heures</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leçons</label>
                  <p className="text-gray-900 dark:text-white mt-1">{course.duration.lessonsCount}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activités</label>
                  <p className="text-gray-900 dark:text-white mt-1">{course.duration.activitiesCount}</p>
                </div>
                {course.publishedAt && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Publié le</label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {new Date(course.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

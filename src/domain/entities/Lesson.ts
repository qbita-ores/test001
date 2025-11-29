import { v4 as uuidv4 } from 'uuid';

export type LessonLevel = 'C1' | 'C2' | 'C3';

export type LessonStatus = 'draft' | 'published' | 'archived';

export interface VocabularyItem {
  term: string;
  definition: string;
  example: string;
  audioUrl?: string;
}

export interface GrammarPoint {
  title: string;
  explanation: string;
  examples: string[];
}

export interface ConjugationTable {
  verb: string;
  tense: string;
  conjugations: Record<string, string>;
}

export interface LessonContent {
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  conjugations: ConjugationTable[];
}

export interface LessonDuration {
  estimatedMinutes: number;
  activitiesCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: LessonLevel;
  status: LessonStatus;
  context: string;
  content: LessonContent;
  objectives: string[];
  targetLanguage: string;
  nativeLanguage: string;
  courseId?: string; // Belongs to one course
  order: number; // Position within the course
  duration: LessonDuration;
  activityIds: string[]; // Ordered list of activity IDs
  chatId?: string;
  // Legacy - kept for backward compatibility
  speakingExerciseIds: string[];
  listeningExerciseIds: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export const createLesson = (
  title: string,
  level: LessonLevel,
  context: string,
  targetLanguage: string,
  nativeLanguage: string,
  courseId?: string,
  order: number = 0,
  chatId?: string
): Lesson => ({
  id: uuidv4(),
  title,
  description: '',
  level,
  status: 'draft',
  context,
  content: {
    vocabulary: [],
    grammar: [],
    conjugations: [],
  },
  objectives: [],
  targetLanguage,
  nativeLanguage,
  courseId,
  order,
  duration: {
    estimatedMinutes: 0,
    activitiesCount: 0,
  },
  activityIds: [],
  chatId,
  speakingExerciseIds: [],
  listeningExerciseIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const updateLesson = (
  lesson: Lesson,
  updates: Partial<Omit<Lesson, 'id' | 'createdAt'>>
): Lesson => ({
  ...lesson,
  ...updates,
  updatedAt: new Date(),
});

export const updateLessonContent = (
  lesson: Lesson,
  content: LessonContent
): Lesson => ({
  ...lesson,
  content,
  updatedAt: new Date(),
});

export const publishLesson = (lesson: Lesson): Lesson => ({
  ...lesson,
  status: 'published',
  publishedAt: new Date(),
  updatedAt: new Date(),
});

export const archiveLesson = (lesson: Lesson): Lesson => ({
  ...lesson,
  status: 'archived',
  updatedAt: new Date(),
});

export const addActivityToLesson = (
  lesson: Lesson,
  activityId: string
): Lesson => ({
  ...lesson,
  activityIds: [...lesson.activityIds, activityId],
  duration: {
    ...lesson.duration,
    activitiesCount: lesson.activityIds.length + 1,
  },
  updatedAt: new Date(),
});

export const removeActivityFromLesson = (
  lesson: Lesson,
  activityId: string
): Lesson => ({
  ...lesson,
  activityIds: lesson.activityIds.filter(id => id !== activityId),
  duration: {
    ...lesson.duration,
    activitiesCount: lesson.activityIds.length - 1,
  },
  updatedAt: new Date(),
});

export const reorderLessonActivities = (
  lesson: Lesson,
  activityIds: string[]
): Lesson => ({
  ...lesson,
  activityIds,
  updatedAt: new Date(),
});

export const addLessonObjective = (
  lesson: Lesson,
  objective: string
): Lesson => ({
  ...lesson,
  objectives: [...lesson.objectives, objective],
  updatedAt: new Date(),
});

export const updateLessonDuration = (
  lesson: Lesson,
  duration: Partial<LessonDuration>
): Lesson => ({
  ...lesson,
  duration: { ...lesson.duration, ...duration },
  updatedAt: new Date(),
});

// Legacy functions - kept for backward compatibility
export const linkSpeakingExercise = (
  lesson: Lesson,
  exerciseId: string
): Lesson => ({
  ...lesson,
  speakingExerciseIds: [...lesson.speakingExerciseIds, exerciseId],
  updatedAt: new Date(),
});

export const linkListeningExercise = (
  lesson: Lesson,
  exerciseId: string
): Lesson => ({
  ...lesson,
  listeningExerciseIds: [...lesson.listeningExerciseIds, exerciseId],
  updatedAt: new Date(),
});

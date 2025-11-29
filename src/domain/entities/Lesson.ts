import { v4 as uuidv4 } from 'uuid';

export type LessonLevel = 'C1' | 'C2' | 'C3';

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

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  context: string;
  content: LessonContent;
  targetLanguage: string;
  nativeLanguage: string;
  chatId?: string;
  speakingExerciseIds: string[];
  listeningExerciseIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const createLesson = (
  title: string,
  level: LessonLevel,
  context: string,
  targetLanguage: string,
  nativeLanguage: string,
  chatId?: string
): Lesson => ({
  id: uuidv4(),
  title,
  level,
  context,
  content: {
    vocabulary: [],
    grammar: [],
    conjugations: [],
  },
  targetLanguage,
  nativeLanguage,
  chatId,
  speakingExerciseIds: [],
  listeningExerciseIds: [],
  createdAt: new Date(),
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

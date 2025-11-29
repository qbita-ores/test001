import { v4 as uuidv4 } from 'uuid';
import { LessonLevel } from './Lesson';
import { PronunciationFeedback, ListeningFeedback } from './Exercise';

export type ActivityType = 'SPEAKING' | 'LISTENING' | 'READING' | 'WRITING' | 'VOCABULARY' | 'GRAMMAR' | 'QUIZ';

export type ActivityStatus = 'draft' | 'published' | 'archived';

export type ActivityDifficulty = 'easy' | 'medium' | 'hard';

// Base Activity interface
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  level: LessonLevel;
  lessonId: string;
  order: number; // Position within the lesson
  status: ActivityStatus;
  difficulty: ActivityDifficulty;
  estimatedMinutes: number;
  points: number; // Points awarded for completion
  instructions: string;
  targetLanguage: string;
  nativeLanguage: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Speaking Activity
export interface SpeakingActivity extends Activity {
  type: 'SPEAKING';
  content: SpeakingActivityContent;
  feedback?: PronunciationFeedback;
}

export interface SpeakingActivityContent {
  textToRead: string;
  context: string;
  hints?: string[];
  audioExampleUrl?: string;
  pronunciationFocus?: string[];
}

// Listening Activity
export interface ListeningActivity extends Activity {
  type: 'LISTENING';
  content: ListeningActivityContent;
  feedback?: ListeningFeedback;
}

export interface ListeningActivityContent {
  originalText: string;
  audioUrl?: string;
  audioBlob?: Blob;
  hints?: string[];
  playbackSpeed?: number;
  maxListens?: number;
}

// Reading Activity
export interface ReadingActivity extends Activity {
  type: 'READING';
  content: ReadingActivityContent;
}

export interface ReadingActivityContent {
  text: string;
  questions: ReadingQuestion[];
  vocabulary?: string[];
  audioUrl?: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'open-ended';
  options?: string[];
  correctAnswer: string | boolean;
  explanation?: string;
}

// Writing Activity
export interface WritingActivity extends Activity {
  type: 'WRITING';
  content: WritingActivityContent;
}

export interface WritingActivityContent {
  prompt: string;
  context: string;
  minWords?: number;
  maxWords?: number;
  exampleResponse?: string;
  rubric?: WritingRubric[];
}

export interface WritingRubric {
  criterion: string;
  weight: number;
  description: string;
}

// Vocabulary Activity
export interface VocabularyActivity extends Activity {
  type: 'VOCABULARY';
  content: VocabularyActivityContent;
}

export interface VocabularyActivityContent {
  words: VocabularyWord[];
  exerciseType: 'flashcard' | 'matching' | 'fill-blank' | 'multiple-choice';
}

export interface VocabularyWord {
  term: string;
  definition: string;
  example: string;
  audioUrl?: string;
  imageUrl?: string;
  partOfSpeech?: string;
}

// Grammar Activity
export interface GrammarActivity extends Activity {
  type: 'GRAMMAR';
  content: GrammarActivityContent;
}

export interface GrammarActivityContent {
  rule: string;
  explanation: string;
  examples: string[];
  exercises: GrammarExercise[];
}

export interface GrammarExercise {
  id: string;
  type: 'fill-blank' | 'correction' | 'transformation' | 'multiple-choice';
  sentence: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
}

// Quiz Activity
export interface QuizActivity extends Activity {
  type: 'QUIZ';
  content: QuizActivityContent;
}

export interface QuizActivityContent {
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching';
  options?: string[];
  correctAnswer: string | boolean | string[];
  points: number;
  explanation?: string;
}

// Union type for all activities
export type AnyActivity = 
  | SpeakingActivity 
  | ListeningActivity 
  | ReadingActivity 
  | WritingActivity 
  | VocabularyActivity 
  | GrammarActivity 
  | QuizActivity;

// Factory functions
export const createBaseActivity = (
  type: ActivityType,
  title: string,
  description: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  targetLanguage: string,
  nativeLanguage: string
): Omit<Activity, 'type'> => ({
  id: uuidv4(),
  title,
  description,
  level,
  lessonId,
  order,
  status: 'draft',
  difficulty: 'medium',
  estimatedMinutes: 10,
  points: 100,
  instructions: '',
  targetLanguage,
  nativeLanguage,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createSpeakingActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  textToRead: string,
  context: string,
  targetLanguage: string,
  nativeLanguage: string
): SpeakingActivity => ({
  ...createBaseActivity('SPEAKING', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'SPEAKING',
  instructions: 'Read the text aloud and record your voice.',
  content: {
    textToRead,
    context,
  },
});

export const createListeningActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  originalText: string,
  targetLanguage: string,
  nativeLanguage: string
): ListeningActivity => ({
  ...createBaseActivity('LISTENING', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'LISTENING',
  instructions: 'Listen to the audio and transcribe what you hear.',
  content: {
    originalText,
  },
});

export const createReadingActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  text: string,
  targetLanguage: string,
  nativeLanguage: string
): ReadingActivity => ({
  ...createBaseActivity('READING', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'READING',
  instructions: 'Read the text and answer the questions.',
  content: {
    text,
    questions: [],
  },
});

export const createWritingActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  prompt: string,
  context: string,
  targetLanguage: string,
  nativeLanguage: string
): WritingActivity => ({
  ...createBaseActivity('WRITING', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'WRITING',
  instructions: 'Write a response to the prompt.',
  content: {
    prompt,
    context,
  },
});

export const createVocabularyActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  words: VocabularyWord[],
  exerciseType: VocabularyActivityContent['exerciseType'],
  targetLanguage: string,
  nativeLanguage: string
): VocabularyActivity => ({
  ...createBaseActivity('VOCABULARY', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'VOCABULARY',
  instructions: 'Learn the vocabulary words.',
  content: {
    words,
    exerciseType,
  },
});

export const createGrammarActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  rule: string,
  explanation: string,
  examples: string[],
  targetLanguage: string,
  nativeLanguage: string
): GrammarActivity => ({
  ...createBaseActivity('GRAMMAR', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'GRAMMAR',
  instructions: 'Learn the grammar rule and complete the exercises.',
  content: {
    rule,
    explanation,
    examples,
    exercises: [],
  },
});

export const createQuizActivity = (
  title: string,
  level: LessonLevel,
  lessonId: string,
  order: number,
  passingScore: number,
  targetLanguage: string,
  nativeLanguage: string
): QuizActivity => ({
  ...createBaseActivity('QUIZ', title, '', level, lessonId, order, targetLanguage, nativeLanguage),
  type: 'QUIZ',
  instructions: 'Answer all questions to complete the quiz.',
  content: {
    questions: [],
    passingScore,
    shuffleQuestions: true,
    showCorrectAnswers: true,
  },
});

// Update functions
export const updateActivity = <T extends Activity>(
  activity: T,
  updates: Partial<Omit<T, 'id' | 'type' | 'lessonId' | 'createdAt'>>
): T => ({
  ...activity,
  ...updates,
  updatedAt: new Date(),
} as T);

export const publishActivity = <T extends Activity>(activity: T): T => ({
  ...activity,
  status: 'published',
  updatedAt: new Date(),
});

export const archiveActivity = <T extends Activity>(activity: T): T => ({
  ...activity,
  status: 'archived',
  updatedAt: new Date(),
});

// Helper to filter activities by type
export const filterActivitiesByType = <T extends AnyActivity>(
  activities: AnyActivity[],
  type: ActivityType
): T[] => activities.filter(a => a.type === type) as T[];

export const getSpeakingActivities = (activities: AnyActivity[]): SpeakingActivity[] =>
  filterActivitiesByType<SpeakingActivity>(activities, 'SPEAKING');

export const getListeningActivities = (activities: AnyActivity[]): ListeningActivity[] =>
  filterActivitiesByType<ListeningActivity>(activities, 'LISTENING');

export const getReadingActivities = (activities: AnyActivity[]): ReadingActivity[] =>
  filterActivitiesByType<ReadingActivity>(activities, 'READING');

export const getWritingActivities = (activities: AnyActivity[]): WritingActivity[] =>
  filterActivitiesByType<WritingActivity>(activities, 'WRITING');

export const getVocabularyActivities = (activities: AnyActivity[]): VocabularyActivity[] =>
  filterActivitiesByType<VocabularyActivity>(activities, 'VOCABULARY');

export const getGrammarActivities = (activities: AnyActivity[]): GrammarActivity[] =>
  filterActivitiesByType<GrammarActivity>(activities, 'GRAMMAR');

export const getQuizActivities = (activities: AnyActivity[]): QuizActivity[] =>
  filterActivitiesByType<QuizActivity>(activities, 'QUIZ');

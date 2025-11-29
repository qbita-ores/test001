import { v4 as uuidv4 } from 'uuid';
import { LessonLevel } from './Lesson';

export interface PronunciationFeedback {
  accuracy: number;
  errors: Array<{
    word: string;
    expected: string;
    actual: string;
    suggestion: string;
  }>;
  overallScore: number;
  suggestions: string[];
}

export interface ListeningFeedback {
  accuracy: number;
  errors: Array<{
    position: number;
    expected: string;
    actual: string;
  }>;
  spellingErrors: string[];
  overallScore: number;
  comprehensionLevel: 'excellent' | 'good' | 'fair' | 'needs-improvement';
}

export interface SpeakingExercise {
  id: string;
  title: string;
  level: LessonLevel;
  originalText: string;
  context: string;
  targetLanguage: string;
  nativeLanguage: string;
  lessonId?: string;
  userRecordingUrl?: string;
  userRecordingBlob?: Blob;
  transcription?: string;
  feedback?: PronunciationFeedback;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ListeningExercise {
  id: string;
  title: string;
  level: LessonLevel;
  originalText: string;
  context: string;
  audioUrl?: string;
  audioBlob?: Blob;
  targetLanguage: string;
  nativeLanguage: string;
  lessonId?: string;
  userTranscription?: string;
  feedback?: ListeningFeedback;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const createSpeakingExercise = (
  title: string,
  level: LessonLevel,
  originalText: string,
  context: string,
  targetLanguage: string,
  nativeLanguage: string,
  lessonId?: string
): SpeakingExercise => ({
  id: uuidv4(),
  title,
  level,
  originalText,
  context,
  targetLanguage,
  nativeLanguage,
  lessonId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createListeningExercise = (
  title: string,
  level: LessonLevel,
  originalText: string,
  context: string,
  targetLanguage: string,
  nativeLanguage: string,
  lessonId?: string
): ListeningExercise => ({
  id: uuidv4(),
  title,
  level,
  originalText,
  context,
  targetLanguage,
  nativeLanguage,
  lessonId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const updateSpeakingExercise = (
  exercise: SpeakingExercise,
  updates: Partial<SpeakingExercise>
): SpeakingExercise => ({
  ...exercise,
  ...updates,
  updatedAt: new Date(),
});

export const updateListeningExercise = (
  exercise: ListeningExercise,
  updates: Partial<ListeningExercise>
): ListeningExercise => ({
  ...exercise,
  ...updates,
  updatedAt: new Date(),
});

export const completeSpeakingExercise = (
  exercise: SpeakingExercise,
  transcription: string,
  feedback: PronunciationFeedback,
  recordingBlob: Blob
): SpeakingExercise => ({
  ...exercise,
  transcription,
  feedback,
  userRecordingBlob: recordingBlob,
  completedAt: new Date(),
  updatedAt: new Date(),
});

export const completeListeningExercise = (
  exercise: ListeningExercise,
  userTranscription: string,
  feedback: ListeningFeedback
): ListeningExercise => ({
  ...exercise,
  userTranscription,
  feedback,
  completedAt: new Date(),
  updatedAt: new Date(),
});

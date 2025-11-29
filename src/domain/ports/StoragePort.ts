import { Chat } from '../entities/Chat';
import { Lesson } from '../entities/Lesson';
import { SpeakingExercise, ListeningExercise } from '../entities/Exercise';
import { Settings } from '../entities/Settings';

export interface IStoragePort {
  // Chat operations
  saveChat(chat: Chat): Promise<void>;
  getChat(id: string): Promise<Chat | null>;
  getAllChats(): Promise<Chat[]>;
  deleteChat(id: string): Promise<void>;

  // Lesson operations
  saveLesson(lesson: Lesson): Promise<void>;
  getLesson(id: string): Promise<Lesson | null>;
  getAllLessons(): Promise<Lesson[]>;
  deleteLesson(id: string): Promise<void>;

  // Speaking Exercise operations
  saveSpeakingExercise(exercise: SpeakingExercise): Promise<void>;
  getSpeakingExercise(id: string): Promise<SpeakingExercise | null>;
  getAllSpeakingExercises(): Promise<SpeakingExercise[]>;
  deleteSpeakingExercise(id: string): Promise<void>;

  // Listening Exercise operations
  saveListeningExercise(exercise: ListeningExercise): Promise<void>;
  getListeningExercise(id: string): Promise<ListeningExercise | null>;
  getAllListeningExercises(): Promise<ListeningExercise[]>;
  deleteListeningExercise(id: string): Promise<void>;

  // Settings operations
  saveSettings(settings: Settings): Promise<void>;
  getSettings(): Promise<Settings | null>;

  // Audio cache operations
  saveAudioCache(key: string, blob: Blob): Promise<void>;
  getAudioCache(key: string): Promise<Blob | null>;
  deleteAudioCache(key: string): Promise<void>;

  // Translation cache operations
  saveTranslationCache(key: string, translation: string): Promise<void>;
  getTranslationCache(key: string): Promise<string | null>;
}

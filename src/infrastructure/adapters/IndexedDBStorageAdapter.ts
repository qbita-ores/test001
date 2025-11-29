import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IStoragePort } from '@/domain/ports/StoragePort';
import { Chat } from '@/domain/entities/Chat';
import { Lesson } from '@/domain/entities/Lesson';
import { SpeakingExercise, ListeningExercise } from '@/domain/entities/Exercise';
import { Settings } from '@/domain/entities/Settings';

interface LanguageLearningDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
    indexes: { 'by-date': Date };
  };
  lessons: {
    key: string;
    value: Lesson;
    indexes: { 'by-date': Date; 'by-chat': string };
  };
  speakingExercises: {
    key: string;
    value: SpeakingExercise;
    indexes: { 'by-date': Date; 'by-lesson': string };
  };
  listeningExercises: {
    key: string;
    value: ListeningExercise;
    indexes: { 'by-date': Date; 'by-lesson': string };
  };
  settings: {
    key: string;
    value: Settings;
  };
  audioCache: {
    key: string;
    value: Blob;
  };
  translationCache: {
    key: string;
    value: string;
  };
}

const DB_NAME = 'language-learning-db';
const DB_VERSION = 1;

export class IndexedDBStorageAdapter implements IStoragePort {
  private db: IDBPDatabase<LanguageLearningDB> | null = null;

  private async getDB(): Promise<IDBPDatabase<LanguageLearningDB>> {
    if (this.db) return this.db;

    this.db = await openDB<LanguageLearningDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Chats store
        if (!db.objectStoreNames.contains('chats')) {
          const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
          chatStore.createIndex('by-date', 'createdAt');
        }

        // Lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonStore.createIndex('by-date', 'createdAt');
          lessonStore.createIndex('by-chat', 'chatId');
        }

        // Speaking exercises store
        if (!db.objectStoreNames.contains('speakingExercises')) {
          const speakingStore = db.createObjectStore('speakingExercises', {
            keyPath: 'id',
          });
          speakingStore.createIndex('by-date', 'createdAt');
          speakingStore.createIndex('by-lesson', 'lessonId');
        }

        // Listening exercises store
        if (!db.objectStoreNames.contains('listeningExercises')) {
          const listeningStore = db.createObjectStore('listeningExercises', {
            keyPath: 'id',
          });
          listeningStore.createIndex('by-date', 'createdAt');
          listeningStore.createIndex('by-lesson', 'lessonId');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }

        // Audio cache store
        if (!db.objectStoreNames.contains('audioCache')) {
          db.createObjectStore('audioCache');
        }

        // Translation cache store
        if (!db.objectStoreNames.contains('translationCache')) {
          db.createObjectStore('translationCache');
        }
      },
    });

    return this.db;
  }

  // Chat operations
  async saveChat(chat: Chat): Promise<void> {
    const db = await this.getDB();
    await db.put('chats', chat);
  }

  async getChat(id: string): Promise<Chat | null> {
    const db = await this.getDB();
    return (await db.get('chats', id)) || null;
  }

  async getAllChats(): Promise<Chat[]> {
    const db = await this.getDB();
    const chats = await db.getAllFromIndex('chats', 'by-date');
    return chats.reverse(); // Most recent first
  }

  async deleteChat(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('chats', id);
  }

  // Lesson operations
  async saveLesson(lesson: Lesson): Promise<void> {
    const db = await this.getDB();
    await db.put('lessons', lesson);
  }

  async getLesson(id: string): Promise<Lesson | null> {
    const db = await this.getDB();
    return (await db.get('lessons', id)) || null;
  }

  async getAllLessons(): Promise<Lesson[]> {
    const db = await this.getDB();
    const lessons = await db.getAllFromIndex('lessons', 'by-date');
    return lessons.reverse();
  }

  async deleteLesson(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('lessons', id);
  }

  // Speaking Exercise operations
  async saveSpeakingExercise(exercise: SpeakingExercise): Promise<void> {
    const db = await this.getDB();
    await db.put('speakingExercises', exercise);
  }

  async getSpeakingExercise(id: string): Promise<SpeakingExercise | null> {
    const db = await this.getDB();
    return (await db.get('speakingExercises', id)) || null;
  }

  async getAllSpeakingExercises(): Promise<SpeakingExercise[]> {
    const db = await this.getDB();
    const exercises = await db.getAllFromIndex('speakingExercises', 'by-date');
    return exercises.reverse();
  }

  async deleteSpeakingExercise(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('speakingExercises', id);
  }

  // Listening Exercise operations
  async saveListeningExercise(exercise: ListeningExercise): Promise<void> {
    const db = await this.getDB();
    await db.put('listeningExercises', exercise);
  }

  async getListeningExercise(id: string): Promise<ListeningExercise | null> {
    const db = await this.getDB();
    return (await db.get('listeningExercises', id)) || null;
  }

  async getAllListeningExercises(): Promise<ListeningExercise[]> {
    const db = await this.getDB();
    const exercises = await db.getAllFromIndex('listeningExercises', 'by-date');
    return exercises.reverse();
  }

  async deleteListeningExercise(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('listeningExercises', id);
  }

  // Settings operations
  async saveSettings(settings: Settings): Promise<void> {
    const db = await this.getDB();
    await db.put('settings', settings, 'main');
  }

  async getSettings(): Promise<Settings | null> {
    const db = await this.getDB();
    return (await db.get('settings', 'main')) || null;
  }

  // Audio cache operations
  async saveAudioCache(key: string, blob: Blob): Promise<void> {
    const db = await this.getDB();
    await db.put('audioCache', blob, key);
  }

  async getAudioCache(key: string): Promise<Blob | null> {
    const db = await this.getDB();
    return (await db.get('audioCache', key)) || null;
  }

  async deleteAudioCache(key: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('audioCache', key);
  }

  // Translation cache operations
  async saveTranslationCache(key: string, translation: string): Promise<void> {
    const db = await this.getDB();
    await db.put('translationCache', translation, key);
  }

  async getTranslationCache(key: string): Promise<string | null> {
    const db = await this.getDB();
    return (await db.get('translationCache', key)) || null;
  }
}

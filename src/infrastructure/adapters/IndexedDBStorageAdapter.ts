import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IStoragePort } from '@/domain/ports/StoragePort';
import { Chat } from '@/domain/entities/Chat';
import { Lesson } from '@/domain/entities/Lesson';
import { SpeakingExercise, ListeningExercise } from '@/domain/entities/Exercise';
import { Settings } from '@/domain/entities/Settings';
import { User, Enrollment, UserLessonProgress, UserActivityProgress } from '@/domain/entities/User';
import { Programme, ProgrammeCourse } from '@/domain/entities/Programme';
import { Course } from '@/domain/entities/Course';
import { AnyActivity } from '@/domain/entities/Activity';

interface LanguageLearningDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
    indexes: { 'by-date': Date };
  };
  lessons: {
    key: string;
    value: Lesson;
    indexes: { 'by-date': Date; 'by-chat': string; 'by-course': string };
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
  // New stores for Programme/Course/User model
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string; 'by-date': Date };
  };
  programmes: {
    key: string;
    value: Programme;
    indexes: { 'by-date': Date; 'by-status': string; 'by-slug': string; 'by-author': string };
  };
  courses: {
    key: string;
    value: Course;
    indexes: { 'by-date': Date; 'by-status': string; 'by-slug': string; 'by-author': string };
  };
  activities: {
    key: string;
    value: AnyActivity;
    indexes: { 'by-lesson': string; 'by-type': string; 'by-date': Date };
  };
  enrollments: {
    key: string;
    value: Enrollment;
    indexes: { 'by-user': string; 'by-programme': string };
  };
  programmeCourses: {
    key: string;
    value: ProgrammeCourse;
    indexes: { 'by-programme': string; 'by-course': string };
  };
  userLessonProgress: {
    key: string;
    value: UserLessonProgress;
    indexes: { 'by-user': string; 'by-lesson': string };
  };
  userActivityProgress: {
    key: string;
    value: UserActivityProgress;
    indexes: { 'by-user': string; 'by-activity': string };
  };
}

const DB_NAME = 'language-learning-db';
const DB_VERSION = 3; // Incremented for new stores and indexes

export class IndexedDBStorageAdapter implements IStoragePort {
  private db: IDBPDatabase<LanguageLearningDB> | null = null;

  private async getDB(): Promise<IDBPDatabase<LanguageLearningDB>> {
    if (this.db) return this.db;

    this.db = await openDB<LanguageLearningDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
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
          lessonStore.createIndex('by-course', 'courseId');
        } else if (oldVersion < 2) {
          const lessonStore = transaction.objectStore('lessons');
          if (!lessonStore.indexNames.contains('by-course')) {
            lessonStore.createIndex('by-course', 'courseId');
          }
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

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('by-email', 'email', { unique: true });
          usersStore.createIndex('by-date', 'createdAt');
        }

        // Programmes store
        if (!db.objectStoreNames.contains('programmes')) {
          const programmesStore = db.createObjectStore('programmes', { keyPath: 'id' });
          programmesStore.createIndex('by-date', 'createdAt');
          programmesStore.createIndex('by-status', 'status');
          programmesStore.createIndex('by-slug', 'slug', { unique: true });
          programmesStore.createIndex('by-author', 'authorId');
        } else if (oldVersion < 3) {
          const programmesStore = transaction.objectStore('programmes');
          if (!programmesStore.indexNames.contains('by-slug')) {
            programmesStore.createIndex('by-slug', 'slug', { unique: true });
          }
          if (!programmesStore.indexNames.contains('by-author')) {
            programmesStore.createIndex('by-author', 'authorId');
          }
        }

        // Courses store
        if (!db.objectStoreNames.contains('courses')) {
          const coursesStore = db.createObjectStore('courses', { keyPath: 'id' });
          coursesStore.createIndex('by-date', 'createdAt');
          coursesStore.createIndex('by-status', 'status');
          coursesStore.createIndex('by-slug', 'slug', { unique: true });
          coursesStore.createIndex('by-author', 'authorId');
        } else if (oldVersion < 3) {
          const coursesStore = transaction.objectStore('courses');
          if (!coursesStore.indexNames.contains('by-slug')) {
            coursesStore.createIndex('by-slug', 'slug', { unique: true });
          }
          if (!coursesStore.indexNames.contains('by-author')) {
            coursesStore.createIndex('by-author', 'authorId');
          }
        }

        // Activities store
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id' });
          activitiesStore.createIndex('by-lesson', 'lessonId');
          activitiesStore.createIndex('by-type', 'type');
          activitiesStore.createIndex('by-date', 'createdAt');
        }

        // Enrollments store
        if (!db.objectStoreNames.contains('enrollments')) {
          const enrollmentsStore = db.createObjectStore('enrollments', { keyPath: 'id' });
          enrollmentsStore.createIndex('by-user', 'userId');
          enrollmentsStore.createIndex('by-programme', 'programmeId');
        }

        // ProgrammeCourses store (junction table)
        if (!db.objectStoreNames.contains('programmeCourses')) {
          const pcStore = db.createObjectStore('programmeCourses', { keyPath: 'id' });
          pcStore.createIndex('by-programme', 'programmeId');
          pcStore.createIndex('by-course', 'courseId');
        }

        // UserLessonProgress store
        if (!db.objectStoreNames.contains('userLessonProgress')) {
          const progressStore = db.createObjectStore('userLessonProgress', { keyPath: 'id' });
          progressStore.createIndex('by-user', 'userId');
          progressStore.createIndex('by-lesson', 'lessonId');
        }

        // UserActivityProgress store (new in v3)
        if (!db.objectStoreNames.contains('userActivityProgress')) {
          const activityProgressStore = db.createObjectStore('userActivityProgress', { keyPath: 'id' });
          activityProgressStore.createIndex('by-user', 'userId');
          activityProgressStore.createIndex('by-activity', 'activityId');
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

  // ==================== NEW METHODS ====================

  // Lesson by course
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('lessons', 'by-course', courseId);
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    const db = await this.getDB();
    await db.put('users', user);
  }

  async getUser(id: string): Promise<User | null> {
    const db = await this.getDB();
    return (await db.get('users', id)) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDB();
    return (await db.getFromIndex('users', 'by-email', email)) || null;
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.getDB();
    const users = await db.getAllFromIndex('users', 'by-date');
    return users.reverse();
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('users', id);
  }

  // Programme operations
  async saveProgramme(programme: Programme): Promise<void> {
    const db = await this.getDB();
    await db.put('programmes', programme);
  }

  async getProgramme(id: string): Promise<Programme | null> {
    const db = await this.getDB();
    return (await db.get('programmes', id)) || null;
  }

  async getProgrammeBySlug(slug: string): Promise<Programme | null> {
    const db = await this.getDB();
    return (await db.getFromIndex('programmes', 'by-slug', slug)) || null;
  }

  async getAllProgrammes(): Promise<Programme[]> {
    const db = await this.getDB();
    const programmes = await db.getAllFromIndex('programmes', 'by-date');
    return programmes.reverse();
  }

  async getPublishedProgrammes(): Promise<Programme[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('programmes', 'by-status', 'published');
  }

  async getProgrammesByAuthor(authorId: string): Promise<Programme[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('programmes', 'by-author', authorId);
  }

  async deleteProgramme(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('programmes', id);
  }

  // Programme-Course relation operations
  async saveProgrammeCourse(programmeCourse: ProgrammeCourse): Promise<void> {
    const db = await this.getDB();
    await db.put('programmeCourses', programmeCourse);
  }

  async getProgrammeCourses(programmeId: string): Promise<ProgrammeCourse[]> {
    const db = await this.getDB();
    const pcs = await db.getAllFromIndex('programmeCourses', 'by-programme', programmeId);
    return pcs.sort((a, b) => a.order - b.order);
  }

  async deleteProgrammeCourse(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('programmeCourses', id);
  }

  async deleteAllProgrammeCourses(programmeId: string): Promise<void> {
    const db = await this.getDB();
    const pcs = await db.getAllFromIndex('programmeCourses', 'by-programme', programmeId);
    const tx = db.transaction('programmeCourses', 'readwrite');
    await Promise.all([
      ...pcs.map(pc => tx.store.delete(pc.id)),
      tx.done,
    ]);
  }

  // Course operations
  async saveCourse(course: Course): Promise<void> {
    const db = await this.getDB();
    await db.put('courses', course);
  }

  async getCourse(id: string): Promise<Course | null> {
    const db = await this.getDB();
    return (await db.get('courses', id)) || null;
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    const db = await this.getDB();
    return (await db.getFromIndex('courses', 'by-slug', slug)) || null;
  }

  async getAllCourses(): Promise<Course[]> {
    const db = await this.getDB();
    const courses = await db.getAllFromIndex('courses', 'by-date');
    return courses.reverse();
  }

  async getPublishedCourses(): Promise<Course[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('courses', 'by-status', 'published');
  }

  async getCoursesByAuthor(authorId: string): Promise<Course[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('courses', 'by-author', authorId);
  }

  async getCoursesByProgramme(programmeId: string): Promise<Course[]> {
    const db = await this.getDB();
    const pcs = await this.getProgrammeCourses(programmeId);
    const courseIds = pcs.map(pc => pc.courseId);
    const courses = await Promise.all(courseIds.map(id => this.getCourse(id)));
    return courses.filter((c): c is Course => c !== null);
  }

  async deleteCourse(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('courses', id);
  }

  // Activity operations
  async saveActivity(activity: AnyActivity): Promise<void> {
    const db = await this.getDB();
    await db.put('activities', activity);
  }

  async getActivity(id: string): Promise<AnyActivity | null> {
    const db = await this.getDB();
    return (await db.get('activities', id)) || null;
  }

  async getActivitiesByLesson(lessonId: string): Promise<AnyActivity[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('activities', 'by-lesson', lessonId);
  }

  async getActivitiesByType(lessonId: string, type: string): Promise<AnyActivity[]> {
    const db = await this.getDB();
    const allActivities = await db.getAllFromIndex('activities', 'by-lesson', lessonId);
    return allActivities.filter(a => a.type === type);
  }

  async deleteActivity(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('activities', id);
  }

  // Enrollment operations
  async saveEnrollment(enrollment: Enrollment): Promise<void> {
    const db = await this.getDB();
    await db.put('enrollments', enrollment);
  }

  async getEnrollment(id: string): Promise<Enrollment | null> {
    const db = await this.getDB();
    return (await db.get('enrollments', id)) || null;
  }

  async getEnrollmentByUserAndProgramme(userId: string, programmeId: string): Promise<Enrollment | null> {
    const db = await this.getDB();
    const enrollments = await db.getAllFromIndex('enrollments', 'by-user', userId);
    return enrollments.find(e => e.programmeId === programmeId) || null;
  }

  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('enrollments', 'by-user', userId);
  }

  async getEnrollmentsByProgramme(programmeId: string): Promise<Enrollment[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('enrollments', 'by-programme', programmeId);
  }

  async deleteEnrollment(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('enrollments', id);
  }

  // UserLessonProgress operations
  async saveUserLessonProgress(progress: UserLessonProgress): Promise<void> {
    const db = await this.getDB();
    await db.put('userLessonProgress', progress);
  }

  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
    const db = await this.getDB();
    const allProgress = await db.getAllFromIndex('userLessonProgress', 'by-user', userId);
    return allProgress.find(p => p.lessonId === lessonId) || null;
  }

  async getUserLessonProgressByUser(userId: string): Promise<UserLessonProgress[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('userLessonProgress', 'by-user', userId);
  }

  async getUserLessonProgressByLesson(lessonId: string): Promise<UserLessonProgress[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('userLessonProgress', 'by-lesson', lessonId);
  }

  async deleteUserLessonProgress(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('userLessonProgress', id);
  }

  // UserActivityProgress operations
  async saveUserActivityProgress(progress: UserActivityProgress): Promise<void> {
    const db = await this.getDB();
    await db.put('userActivityProgress', progress);
  }

  async getUserActivityProgress(userId: string, activityId: string): Promise<UserActivityProgress | null> {
    const db = await this.getDB();
    const allProgress = await db.getAllFromIndex('userActivityProgress', 'by-user', userId);
    return allProgress.find(p => p.activityId === activityId) || null;
  }

  async getUserActivityProgressByUser(userId: string): Promise<UserActivityProgress[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('userActivityProgress', 'by-user', userId);
  }

  async getUserActivityProgressByActivity(activityId: string): Promise<UserActivityProgress[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('userActivityProgress', 'by-activity', activityId);
  }

  async deleteUserActivityProgress(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('userActivityProgress', id);
  }
}

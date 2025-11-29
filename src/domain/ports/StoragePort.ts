import { Chat } from '../entities/Chat';
import { Lesson } from '../entities/Lesson';
import { SpeakingExercise, ListeningExercise } from '../entities/Exercise';
import { Settings } from '../entities/Settings';
import { User, Enrollment, UserLessonProgress, UserActivityProgress } from '../entities/User';
import { Programme, ProgrammeCourse } from '../entities/Programme';
import { Course } from '../entities/Course';
import { AnyActivity } from '../entities/Activity';

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
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
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

  // User operations
  saveUser(user: User): Promise<void>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  // Programme operations
  saveProgramme(programme: Programme): Promise<void>;
  getProgramme(id: string): Promise<Programme | null>;
  getProgrammeBySlug(slug: string): Promise<Programme | null>;
  getAllProgrammes(): Promise<Programme[]>;
  getPublishedProgrammes(): Promise<Programme[]>;
  getProgrammesByAuthor(authorId: string): Promise<Programme[]>;
  deleteProgramme(id: string): Promise<void>;

  // Programme-Course relation operations
  saveProgrammeCourse(programmeCourse: ProgrammeCourse): Promise<void>;
  getProgrammeCourses(programmeId: string): Promise<ProgrammeCourse[]>;
  deleteProgrammeCourse(id: string): Promise<void>;
  deleteAllProgrammeCourses(programmeId: string): Promise<void>;

  // Course operations
  saveCourse(course: Course): Promise<void>;
  getCourse(id: string): Promise<Course | null>;
  getCourseBySlug(slug: string): Promise<Course | null>;
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getCoursesByAuthor(authorId: string): Promise<Course[]>;
  getCoursesByProgramme(programmeId: string): Promise<Course[]>;
  deleteCourse(id: string): Promise<void>;

  // Activity operations
  saveActivity(activity: AnyActivity): Promise<void>;
  getActivity(id: string): Promise<AnyActivity | null>;
  getActivitiesByLesson(lessonId: string): Promise<AnyActivity[]>;
  getActivitiesByType(lessonId: string, type: string): Promise<AnyActivity[]>;
  deleteActivity(id: string): Promise<void>;

  // Enrollment operations
  saveEnrollment(enrollment: Enrollment): Promise<void>;
  getEnrollment(id: string): Promise<Enrollment | null>;
  getEnrollmentByUserAndProgramme(userId: string, programmeId: string): Promise<Enrollment | null>;
  getEnrollmentsByUser(userId: string): Promise<Enrollment[]>;
  getEnrollmentsByProgramme(programmeId: string): Promise<Enrollment[]>;
  deleteEnrollment(id: string): Promise<void>;

  // User Lesson Progress operations
  saveUserLessonProgress(progress: UserLessonProgress): Promise<void>;
  getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null>;
  getUserLessonProgressByUser(userId: string): Promise<UserLessonProgress[]>;
  getUserLessonProgressByLesson(lessonId: string): Promise<UserLessonProgress[]>;
  deleteUserLessonProgress(id: string): Promise<void>;

  // User Activity Progress operations
  saveUserActivityProgress(progress: UserActivityProgress): Promise<void>;
  getUserActivityProgress(userId: string, activityId: string): Promise<UserActivityProgress | null>;
  getUserActivityProgressByUser(userId: string): Promise<UserActivityProgress[]>;
  getUserActivityProgressByActivity(activityId: string): Promise<UserActivityProgress[]>;
  deleteUserActivityProgress(id: string): Promise<void>;
}

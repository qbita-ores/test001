import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  nativeLanguage: string;
  targetLanguages: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface UserPreferences {
  defaultLevel: 'C1' | 'C2' | 'C3';
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface Enrollment {
  id: string;
  userId: string;
  programmeId: string;
  enrolledAt: Date;
  status: EnrollmentStatus;
  progress: number; // 0-100 percentage
  completedAt?: Date;
}

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'dropped';

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonProgressStatus;
  progress: number; // 0-100 percentage
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  timeSpentMinutes: number;
  attempts: number;
  scores: ActivityScore[];
}

export type LessonProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'needs-review';

export interface ActivityScore {
  activityId: string;
  activityType: string;
  score: number;
  completedAt: Date;
  attempts: number;
}

export interface UserActivityProgress {
  id: string;
  userId: string;
  activityId: string;
  status: ActivityProgressStatus;
  score?: number;
  attempts: number;
  startedAt: Date;
  completedAt?: Date;
  lastAttemptAt: Date;
  feedback?: Record<string, unknown>;
}

export type ActivityProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'needs-review';

// Factory functions
export const createUser = (
  email: string,
  displayName: string,
  nativeLanguage: string,
  role: UserRole = 'student'
): User => ({
  id: uuidv4(),
  email,
  displayName,
  role,
  nativeLanguage,
  targetLanguages: [],
  preferences: {
    defaultLevel: 'C1',
    dailyGoalMinutes: 30,
    notificationsEnabled: true,
    theme: 'system',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createEnrollment = (
  userId: string,
  programmeId: string
): Enrollment => ({
  id: uuidv4(),
  userId,
  programmeId,
  enrolledAt: new Date(),
  status: 'active',
  progress: 0,
});

export const createUserLessonProgress = (
  userId: string,
  lessonId: string
): UserLessonProgress => ({
  id: uuidv4(),
  userId,
  lessonId,
  status: 'not-started',
  progress: 0,
  startedAt: new Date(),
  lastAccessedAt: new Date(),
  timeSpentMinutes: 0,
  attempts: 0,
  scores: [],
});

export const createUserActivityProgress = (
  userId: string,
  activityId: string
): UserActivityProgress => ({
  id: uuidv4(),
  userId,
  activityId,
  status: 'not-started',
  attempts: 0,
  startedAt: new Date(),
  lastAttemptAt: new Date(),
});

// Update functions
export const updateUser = (
  user: User,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): User => ({
  ...user,
  ...updates,
  updatedAt: new Date(),
});

export const updateEnrollment = (
  enrollment: Enrollment,
  updates: Partial<Omit<Enrollment, 'id' | 'userId' | 'programmeId' | 'enrolledAt'>>
): Enrollment => ({
  ...enrollment,
  ...updates,
});

export const updateUserLessonProgress = (
  progress: UserLessonProgress,
  updates: Partial<Omit<UserLessonProgress, 'id' | 'userId' | 'lessonId' | 'startedAt'>>
): UserLessonProgress => ({
  ...progress,
  ...updates,
  lastAccessedAt: new Date(),
});

export const completeLesson = (
  progress: UserLessonProgress
): UserLessonProgress => ({
  ...progress,
  status: 'completed',
  progress: 100,
  completedAt: new Date(),
  lastAccessedAt: new Date(),
});

export const updateUserActivityProgress = (
  progress: UserActivityProgress,
  updates: Partial<Omit<UserActivityProgress, 'id' | 'userId' | 'activityId' | 'startedAt'>>
): UserActivityProgress => ({
  ...progress,
  ...updates,
  lastAttemptAt: new Date(),
});

export const completeActivity = (
  progress: UserActivityProgress,
  score: number
): UserActivityProgress => ({
  ...progress,
  status: 'completed',
  score,
  completedAt: new Date(),
  lastAttemptAt: new Date(),
  attempts: progress.attempts + 1,
});

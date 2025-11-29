import { v4 as uuidv4 } from 'uuid';
import { LessonLevel } from './Lesson';

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: LessonLevel;
  targetLanguage: string;
  nativeLanguage: string;
  thumbnailUrl?: string;
  status: CourseStatus;
  objectives: string[];
  prerequisites: string[];
  tags: string[];
  authorId: string;
  lessonIds: string[]; // Ordered list of lesson IDs
  duration: CourseDuration;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CourseDuration {
  estimatedHours: number;
  lessonsCount: number;
  activitiesCount: number;
}

export interface CourseMetadata {
  totalLessons: number;
  totalActivities: number;
  completedByStudents: number;
  averageRating?: number;
  averageCompletionTime?: number; // in hours
}

// Factory functions
export const createCourse = (
  title: string,
  description: string,
  level: LessonLevel,
  targetLanguage: string,
  nativeLanguage: string,
  authorId: string
): Course => {
  const slug = generateSlug(title);
  return {
    id: uuidv4(),
    title,
    description,
    slug,
    level,
    targetLanguage,
    nativeLanguage,
    status: 'draft',
    objectives: [],
    prerequisites: [],
    tags: [],
    authorId,
    lessonIds: [],
    duration: {
      estimatedHours: 0,
      lessonsCount: 0,
      activitiesCount: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Update functions
export const updateCourse = (
  course: Course,
  updates: Partial<Omit<Course, 'id' | 'slug' | 'authorId' | 'createdAt'>>
): Course => ({
  ...course,
  ...updates,
  updatedAt: new Date(),
});

export const publishCourse = (course: Course): Course => ({
  ...course,
  status: 'published',
  publishedAt: new Date(),
  updatedAt: new Date(),
});

export const archiveCourse = (course: Course): Course => ({
  ...course,
  status: 'archived',
  updatedAt: new Date(),
});

export const addLessonToCourse = (
  course: Course,
  lessonId: string
): Course => ({
  ...course,
  lessonIds: [...course.lessonIds, lessonId],
  duration: {
    ...course.duration,
    lessonsCount: course.lessonIds.length + 1,
  },
  updatedAt: new Date(),
});

export const removeLessonFromCourse = (
  course: Course,
  lessonId: string
): Course => ({
  ...course,
  lessonIds: course.lessonIds.filter(id => id !== lessonId),
  duration: {
    ...course.duration,
    lessonsCount: course.lessonIds.length - 1,
  },
  updatedAt: new Date(),
});

export const reorderCourseLessons = (
  course: Course,
  lessonIds: string[]
): Course => ({
  ...course,
  lessonIds,
  updatedAt: new Date(),
});

export const updateCourseDuration = (
  course: Course,
  duration: Partial<CourseDuration>
): Course => ({
  ...course,
  duration: { ...course.duration, ...duration },
  updatedAt: new Date(),
});

export const addCourseObjective = (
  course: Course,
  objective: string
): Course => ({
  ...course,
  objectives: [...course.objectives, objective],
  updatedAt: new Date(),
});

export const removeCourseObjective = (
  course: Course,
  index: number
): Course => ({
  ...course,
  objectives: course.objectives.filter((_, i) => i !== index),
  updatedAt: new Date(),
});

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const calculateCourseDuration = (
  lessonDurations: { estimatedMinutes: number; activitiesCount: number }[]
): CourseDuration => {
  const totalMinutes = lessonDurations.reduce((sum, l) => sum + l.estimatedMinutes, 0);
  const totalActivities = lessonDurations.reduce((sum, l) => sum + l.activitiesCount, 0);
  return {
    estimatedHours: Math.ceil(totalMinutes / 60),
    lessonsCount: lessonDurations.length,
    activitiesCount: totalActivities,
  };
};

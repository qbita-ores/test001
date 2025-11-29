import { v4 as uuidv4 } from 'uuid';
import { LessonLevel } from './Lesson';

export type ProgrammeStatus = 'draft' | 'published' | 'archived';

export interface Programme {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: LessonLevel;
  targetLanguage: string;
  nativeLanguage: string;
  thumbnailUrl?: string;
  status: ProgrammeStatus;
  duration: ProgrammeDuration;
  tags: string[];
  authorId: string;
  courseIds: string[]; // Ordered list of course IDs
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ProgrammeDuration {
  estimatedHours: number;
  weeksRecommended: number;
}

export interface ProgrammeCourse {
  id: string;
  programmeId: string;
  courseId: string;
  order: number; // Position in the programme
  isRequired: boolean;
  createdAt: Date;
}

export interface ProgrammeMetadata {
  totalCourses: number;
  totalLessons: number;
  totalActivities: number;
  enrolledStudents: number;
  averageRating?: number;
  completionRate?: number;
}

// Factory functions
export const createProgramme = (
  title: string,
  description: string,
  level: LessonLevel,
  targetLanguage: string,
  nativeLanguage: string,
  authorId: string
): Programme => {
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
    duration: {
      estimatedHours: 0,
      weeksRecommended: 0,
    },
    tags: [],
    authorId,
    courseIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const createProgrammeCourse = (
  programmeId: string,
  courseId: string,
  order: number,
  isRequired: boolean = true
): ProgrammeCourse => ({
  id: uuidv4(),
  programmeId,
  courseId,
  order,
  isRequired,
  createdAt: new Date(),
});

// Update functions
export const updateProgramme = (
  programme: Programme,
  updates: Partial<Omit<Programme, 'id' | 'slug' | 'authorId' | 'createdAt'>>
): Programme => ({
  ...programme,
  ...updates,
  updatedAt: new Date(),
});

export const publishProgramme = (programme: Programme): Programme => ({
  ...programme,
  status: 'published',
  publishedAt: new Date(),
  updatedAt: new Date(),
});

export const archiveProgramme = (programme: Programme): Programme => ({
  ...programme,
  status: 'archived',
  updatedAt: new Date(),
});

export const addCourseToProgramme = (
  programme: Programme,
  courseId: string
): Programme => ({
  ...programme,
  courseIds: [...programme.courseIds, courseId],
  updatedAt: new Date(),
});

export const removeCoursFromProgramme = (
  programme: Programme,
  courseId: string
): Programme => ({
  ...programme,
  courseIds: programme.courseIds.filter(id => id !== courseId),
  updatedAt: new Date(),
});

export const reorderProgrammeCourses = (
  programme: Programme,
  courseIds: string[]
): Programme => ({
  ...programme,
  courseIds,
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

export const calculateProgrammeDuration = (
  courseDurations: { estimatedHours: number }[]
): ProgrammeDuration => {
  const totalHours = courseDurations.reduce((sum, c) => sum + c.estimatedHours, 0);
  return {
    estimatedHours: totalHours,
    weeksRecommended: Math.ceil(totalHours / 5), // Assuming 5 hours per week
  };
};

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat } from '@/domain/entities/Chat';
import { Lesson } from '@/domain/entities/Lesson';
import { SpeakingExercise, ListeningExercise } from '@/domain/entities/Exercise';
import { Settings, defaultSettings } from '@/domain/entities/Settings';
import { Programme } from '@/domain/entities/Programme';
import { Course } from '@/domain/entities/Course';

interface AppState {
  // Settings
  settings: Settings;
  setSettings: (settings: Settings) => void;

  // Chats
  chats: Chat[];
  currentChat: Chat | null;
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chat: Chat) => void;
  removeChat: (id: string) => void;

  // Lessons
  lessons: Lesson[];
  currentLesson: Lesson | null;
  setLessons: (lessons: Lesson[]) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  addLesson: (lesson: Lesson) => void;
  updateLesson: (lesson: Lesson) => void;
  removeLesson: (id: string) => void;

  // Speaking Exercises
  speakingExercises: SpeakingExercise[];
  currentSpeakingExercise: SpeakingExercise | null;
  setSpeakingExercises: (exercises: SpeakingExercise[]) => void;
  setCurrentSpeakingExercise: (exercise: SpeakingExercise | null) => void;
  addSpeakingExercise: (exercise: SpeakingExercise) => void;
  updateSpeakingExercise: (exercise: SpeakingExercise) => void;
  removeSpeakingExercise: (id: string) => void;

  // Listening Exercises
  listeningExercises: ListeningExercise[];
  currentListeningExercise: ListeningExercise | null;
  setListeningExercises: (exercises: ListeningExercise[]) => void;
  setCurrentListeningExercise: (exercise: ListeningExercise | null) => void;
  addListeningExercise: (exercise: ListeningExercise) => void;
  updateListeningExercise: (exercise: ListeningExercise) => void;
  removeListeningExercise: (id: string) => void;

  // Programmes
  programmes: Programme[];
  currentProgramme: Programme | null;
  setProgrammes: (programmes: Programme[]) => void;
  setCurrentProgramme: (programme: Programme | null) => void;
  addProgramme: (programme: Programme) => void;
  updateProgramme: (programme: Programme) => void;
  removeProgramme: (id: string) => void;

  // Courses
  courses: Course[];
  currentCourse: Course | null;
  setCourses: (courses: Course[]) => void;
  setCurrentCourse: (course: Course | null) => void;
  addCourse: (course: Course) => void;
  updateCourseInStore: (course: Course) => void;
  removeCourse: (id: string) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: 'chat' | 'lessons' | 'speaking' | 'listening' | 'settings' | 'programmes' | 'courses';
  setActiveTab: (tab: 'chat' | 'lessons' | 'speaking' | 'listening' | 'settings' | 'programmes' | 'courses') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Settings
      settings: defaultSettings,
      setSettings: (settings) => set({ settings }),

      // Chats
      chats: [],
      currentChat: null,
      setChats: (chats) => set({ chats }),
      setCurrentChat: (currentChat) => set({ currentChat }),
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (chat) =>
        set((state) => ({
          chats: state.chats.map((c) => (c.id === chat.id ? chat : c)),
          currentChat: state.currentChat?.id === chat.id ? chat : state.currentChat,
        })),
      removeChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          currentChat: state.currentChat?.id === id ? null : state.currentChat,
        })),

      // Lessons
      lessons: [],
      currentLesson: null,
      setLessons: (lessons) => set({ lessons }),
      setCurrentLesson: (currentLesson) => set({ currentLesson }),
      addLesson: (lesson) => set((state) => ({ lessons: [lesson, ...state.lessons] })),
      updateLesson: (lesson) =>
        set((state) => ({
          lessons: state.lessons.map((l) => (l.id === lesson.id ? lesson : l)),
          currentLesson: state.currentLesson?.id === lesson.id ? lesson : state.currentLesson,
        })),
      removeLesson: (id) =>
        set((state) => ({
          lessons: state.lessons.filter((l) => l.id !== id),
          currentLesson: state.currentLesson?.id === id ? null : state.currentLesson,
        })),

      // Speaking Exercises
      speakingExercises: [],
      currentSpeakingExercise: null,
      setSpeakingExercises: (speakingExercises) => set({ speakingExercises }),
      setCurrentSpeakingExercise: (currentSpeakingExercise) =>
        set({ currentSpeakingExercise }),
      addSpeakingExercise: (exercise) =>
        set((state) => ({ speakingExercises: [exercise, ...state.speakingExercises] })),
      updateSpeakingExercise: (exercise) =>
        set((state) => ({
          speakingExercises: state.speakingExercises.map((e) =>
            e.id === exercise.id ? exercise : e
          ),
          currentSpeakingExercise:
            state.currentSpeakingExercise?.id === exercise.id
              ? exercise
              : state.currentSpeakingExercise,
        })),
      removeSpeakingExercise: (id) =>
        set((state) => ({
          speakingExercises: state.speakingExercises.filter((e) => e.id !== id),
          currentSpeakingExercise:
            state.currentSpeakingExercise?.id === id ? null : state.currentSpeakingExercise,
        })),

      // Listening Exercises
      listeningExercises: [],
      currentListeningExercise: null,
      setListeningExercises: (listeningExercises) => set({ listeningExercises }),
      setCurrentListeningExercise: (currentListeningExercise) =>
        set({ currentListeningExercise }),
      addListeningExercise: (exercise) =>
        set((state) => ({ listeningExercises: [exercise, ...state.listeningExercises] })),
      updateListeningExercise: (exercise) =>
        set((state) => ({
          listeningExercises: state.listeningExercises.map((e) =>
            e.id === exercise.id ? exercise : e
          ),
          currentListeningExercise:
            state.currentListeningExercise?.id === exercise.id
              ? exercise
              : state.currentListeningExercise,
        })),
      removeListeningExercise: (id) =>
        set((state) => ({
          listeningExercises: state.listeningExercises.filter((e) => e.id !== id),
          currentListeningExercise:
            state.currentListeningExercise?.id === id ? null : state.currentListeningExercise,
        })),

      // Programmes
      programmes: [],
      currentProgramme: null,
      setProgrammes: (programmes) => set({ programmes }),
      setCurrentProgramme: (currentProgramme) => set({ currentProgramme }),
      addProgramme: (programme) =>
        set((state) => ({ programmes: [programme, ...state.programmes] })),
      updateProgramme: (programme) =>
        set((state) => ({
          programmes: state.programmes.map((p) => (p.id === programme.id ? programme : p)),
          currentProgramme:
            state.currentProgramme?.id === programme.id ? programme : state.currentProgramme,
        })),
      removeProgramme: (id) =>
        set((state) => ({
          programmes: state.programmes.filter((p) => p.id !== id),
          currentProgramme: state.currentProgramme?.id === id ? null : state.currentProgramme,
        })),

      // Courses
      courses: [],
      currentCourse: null,
      setCourses: (courses) => set({ courses }),
      setCurrentCourse: (currentCourse) => set({ currentCourse }),
      addCourse: (course) =>
        set((state) => ({ courses: [course, ...state.courses] })),
      updateCourseInStore: (course) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === course.id ? course : c)),
          currentCourse:
            state.currentCourse?.id === course.id ? course : state.currentCourse,
        })),
      removeCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
        })),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      activeTab: 'chat',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'language-learning-storage',
      partialize: (state) => ({
        settings: state.settings,
        activeTab: state.activeTab,
      }),
    }
  )
);

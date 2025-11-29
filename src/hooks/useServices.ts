'use client';

import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { ChatService } from '@/application/services/ChatService';
import { LessonService } from '@/application/services/LessonService';
import { ExerciseService } from '@/application/services/ExerciseService';
import { SettingsService, IProviderValidator } from '@/application/services/SettingsService';
import { IndexedDBStorageAdapter } from '@/infrastructure/adapters/IndexedDBStorageAdapter';
import { OpenAITextAdapter } from '@/infrastructure/adapters/OpenAITextAdapter';
import { GeminiTextAdapter } from '@/infrastructure/adapters/GeminiTextAdapter';
import { LocalTextAdapter } from '@/infrastructure/adapters/LocalTextAdapter';
import { OpenAIAudioAdapter } from '@/infrastructure/adapters/OpenAIAudioAdapter';
import { GeminiAudioAdapter } from '@/infrastructure/adapters/GeminiAudioAdapter';
import { ITextProviderPort } from '@/domain/ports/TextProviderPort';
import { IAudioProviderPort } from '@/domain/ports/AudioProviderPort';
import { Lesson } from '@/domain/entities/Lesson';
import { Programme, createProgramme, updateProgramme as updateProgrammeEntity, publishProgramme, archiveProgramme, addCourseToProgramme, removeCoursFromProgramme, reorderProgrammeCourses } from '@/domain/entities/Programme';
import { Course, createCourse, updateCourse as updateCourseEntity } from '@/domain/entities/Course';

export function useServices() {
  const { settings } = useAppStore();

  const storage = useMemo(() => new IndexedDBStorageAdapter(), []);

  const textProvider: ITextProviderPort = useMemo(() => {
    const { textProvider: config } = settings;
    
    switch (config.provider) {
      case 'openai':
        return new OpenAITextAdapter(config.apiKey, config.selectedModel);
      case 'gemini':
        return new GeminiTextAdapter(config.apiKey, config.selectedModel);
      case 'local':
        return new LocalTextAdapter(
          config.localEndpoint || 'http://localhost:1234',
          config.selectedModel,
          config.localProvider || 'lmstudio'
        );
      default:
        return new OpenAITextAdapter(config.apiKey, config.selectedModel);
    }
  }, [settings.textProvider]);

  const audioProvider: IAudioProviderPort = useMemo(() => {
    const { audioProvider: config } = settings;

    switch (config.provider) {
      case 'openai':
        return new OpenAIAudioAdapter(
          config.apiKey,
          config.selectedModel,
          config.selectedVoice
        );
      case 'gemini':
        return new GeminiAudioAdapter(
          config.apiKey,
          config.selectedModel,
          config.selectedVoice
        );
      default:
        return new OpenAIAudioAdapter(
          config.apiKey,
          config.selectedModel,
          config.selectedVoice
        );
    }
  }, [settings.audioProvider]);

  const providerValidator: IProviderValidator = useMemo(
    () => ({
      validateTextApiKey: async (provider: string, apiKey: string) => {
        switch (provider) {
          case 'openai':
            return new OpenAITextAdapter(apiKey).validateApiKey(apiKey);
          case 'gemini':
            return new GeminiTextAdapter(apiKey).validateApiKey(apiKey);
          case 'local':
            return new LocalTextAdapter(apiKey, '').validateApiKey();
          default:
            return false;
        }
      },
      getTextModels: async (provider: string, apiKey: string) => {
        switch (provider) {
          case 'openai':
            return new OpenAITextAdapter(apiKey).getAvailableModels(apiKey);
          case 'gemini':
            return new GeminiTextAdapter(apiKey).getAvailableModels(apiKey);
          case 'local':
            return new LocalTextAdapter(apiKey, '').getAvailableModels();
          default:
            return [];
        }
      },
      validateAudioApiKey: async (provider: string, apiKey: string) => {
        switch (provider) {
          case 'openai':
            return new OpenAIAudioAdapter(apiKey).validateApiKey(apiKey);
          case 'gemini':
            return new GeminiAudioAdapter(apiKey).validateApiKey(apiKey);
          default:
            return false;
        }
      },
      getAudioModels: async (provider: string, apiKey: string) => {
        switch (provider) {
          case 'openai':
            return new OpenAIAudioAdapter(apiKey).getAvailableModels();
          case 'gemini':
            return new GeminiAudioAdapter(apiKey).getAvailableModels();
          default:
            return [];
        }
      },
      getAudioVoices: async (provider: string, apiKey: string) => {
        switch (provider) {
          case 'openai':
            return new OpenAIAudioAdapter(apiKey).getAvailableVoices();
          case 'gemini':
            return new GeminiAudioAdapter(apiKey).getAvailableVoices(apiKey);
          default:
            return [];
        }
      },
    }),
    []
  );

  const chatService = useMemo(
    () => new ChatService(textProvider, audioProvider, storage),
    [textProvider, audioProvider, storage]
  );

  const lessonService = useMemo(
    () => new LessonService(textProvider, storage),
    [textProvider, storage]
  );

  const exerciseService = useMemo(
    () => new ExerciseService(textProvider, audioProvider, storage),
    [textProvider, audioProvider, storage]
  );

  const settingsService = useMemo(
    () => new SettingsService(storage, providerValidator),
    [storage, providerValidator]
  );

  return {
    chatService,
    lessonService,
    exerciseService,
    settingsService,
    storage,
  };
}

export function useChat() {
  const {
    chats,
    currentChat,
    settings,
    setChats,
    setCurrentChat,
    addChat,
    updateChat,
    removeChat,
  } = useAppStore();
  const { chatService } = useServices();

  const loadChats = useCallback(async () => {
    const allChats = await chatService.getAllChats();
    setChats(allChats);
  }, [chatService, setChats]);

  const createChat = useCallback(
    async (title?: string) => {
      const chat = await chatService.createNewChat(
        settings.targetLanguage,
        settings.nativeLanguage,
        title
      );
      addChat(chat);
      setCurrentChat(chat);
      return chat;
    },
    [chatService, settings, addChat, setCurrentChat]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentChat) return;
      const updatedChat = await chatService.sendMessage(currentChat, content);
      updateChat(updatedChat);
      return updatedChat;
    },
    [chatService, currentChat, updateChat]
  );

  const generateAudio = useCallback(
    async (messageId: string) => {
      if (!currentChat) return;
      const updatedChat = await chatService.generateAudioForMessage(
        currentChat,
        messageId
      );
      updateChat(updatedChat);
      return updatedChat;
    },
    [chatService, currentChat, updateChat]
  );

  const translateMessage = useCallback(
    async (messageId: string) => {
      if (!currentChat) return;
      const { chat } = await chatService.translateMessage(currentChat, messageId);
      updateChat(chat);
      return chat;
    },
    [chatService, currentChat, updateChat]
  );

  const suggestResponses = useCallback(async () => {
    if (!currentChat) return [];
    return chatService.suggestResponses(currentChat);
  }, [chatService, currentChat]);

  const deleteChat = useCallback(
    async (id: string) => {
      await chatService.deleteChat(id);
      removeChat(id);
    },
    [chatService, removeChat]
  );

  const selectChat = useCallback(
    async (id: string) => {
      const chat = await chatService.getChat(id);
      setCurrentChat(chat);
    },
    [chatService, setCurrentChat]
  );

  return {
    chats,
    currentChat,
    loadChats,
    createChat,
    sendMessage,
    generateAudio,
    translateMessage,
    suggestResponses,
    deleteChat,
    selectChat,
    setCurrentChat,
  };
}

export function useLesson() {
  const {
    lessons,
    currentLesson,
    currentChat,
    settings,
    setLessons,
    setCurrentLesson,
    addLesson,
    updateLesson,
    removeLesson,
  } = useAppStore();
  const { lessonService } = useServices();

  const loadLessons = useCallback(async () => {
    const allLessons = await lessonService.getAllLessons();
    setLessons(allLessons);
  }, [lessonService, setLessons]);

  const createLesson = useCallback(
    async (title: string, context: string) => {
      const lesson = await lessonService.createLesson(
        title,
        settings.defaultLevel,
        context,
        settings.targetLanguage,
        settings.nativeLanguage,
        currentChat?.id
      );
      addLesson(lesson);
      setCurrentLesson(lesson);
      return lesson;
    },
    [lessonService, settings, currentChat, addLesson, setCurrentLesson]
  );

  const generateContent = useCallback(async (lessonToGenerate?: Lesson | null) => {
    const lesson = lessonToGenerate || currentLesson;
    if (!lesson) return;
    const updatedLesson = await lessonService.generateLessonContent(
      lesson,
      currentChat?.messages
    );
    updateLesson(updatedLesson);
    setCurrentLesson(updatedLesson);
    return updatedLesson;
  }, [lessonService, currentLesson, currentChat, updateLesson, setCurrentLesson]);

  const suggestContext = useCallback(async () => {
    return lessonService.suggestContext(
      settings.targetLanguage,
      settings.defaultLevel
    );
  }, [lessonService, settings]);

  const completeContext = useCallback(
    async (partialText: string) => {
      return lessonService.generateContext(
        partialText,
        settings.targetLanguage,
        settings.defaultLevel
      );
    },
    [lessonService, settings]
  );

  const deleteLesson = useCallback(
    async (id: string) => {
      await lessonService.deleteLesson(id);
      removeLesson(id);
    },
    [lessonService, removeLesson]
  );

  const selectLesson = useCallback(
    async (id: string) => {
      const lesson = await lessonService.getLesson(id);
      setCurrentLesson(lesson);
    },
    [lessonService, setCurrentLesson]
  );

  return {
    lessons,
    currentLesson,
    loadLessons,
    createLesson,
    generateContent,
    suggestContext,
    completeContext,
    deleteLesson,
    selectLesson,
    setCurrentLesson,
  };
}

export function useExercise() {
  const {
    speakingExercises,
    listeningExercises,
    currentSpeakingExercise,
    currentListeningExercise,
    currentLesson,
    settings,
    setSpeakingExercises,
    setListeningExercises,
    setCurrentSpeakingExercise,
    setCurrentListeningExercise,
    addSpeakingExercise,
    addListeningExercise,
    updateSpeakingExercise,
    updateListeningExercise,
    removeSpeakingExercise,
    removeListeningExercise,
  } = useAppStore();
  const { exerciseService } = useServices();

  const loadExercises = useCallback(async () => {
    const [speaking, listening] = await Promise.all([
      exerciseService.getAllSpeakingExercises(),
      exerciseService.getAllListeningExercises(),
    ]);
    setSpeakingExercises(speaking);
    setListeningExercises(listening);
  }, [exerciseService, setSpeakingExercises, setListeningExercises]);

  // Speaking exercises
  const createSpeakingExercise = useCallback(
    async (title: string, context: string) => {
      const exercise = await exerciseService.createSpeakingExercise(
        title,
        settings.defaultLevel,
        context,
        settings.targetLanguage,
        settings.nativeLanguage,
        currentLesson?.id
      );
      addSpeakingExercise(exercise);
      setCurrentSpeakingExercise(exercise);
      return exercise;
    },
    [exerciseService, settings, currentLesson, addSpeakingExercise, setCurrentSpeakingExercise]
  );

  const evaluateSpeaking = useCallback(
    async (recordingBlob: Blob) => {
      if (!currentSpeakingExercise) return;
      const updatedExercise = await exerciseService.evaluateSpeaking(
        currentSpeakingExercise,
        recordingBlob
      );
      updateSpeakingExercise(updatedExercise);
      return updatedExercise;
    },
    [exerciseService, currentSpeakingExercise, updateSpeakingExercise]
  );

  const deleteSpeakingExercise = useCallback(
    async (id: string) => {
      await exerciseService.deleteSpeakingExercise(id);
      removeSpeakingExercise(id);
    },
    [exerciseService, removeSpeakingExercise]
  );

  const selectSpeakingExercise = useCallback(
    async (id: string) => {
      const exercise = await exerciseService.getSpeakingExercise(id);
      setCurrentSpeakingExercise(exercise);
    },
    [exerciseService, setCurrentSpeakingExercise]
  );

  // Listening exercises
  const createListeningExercise = useCallback(
    async (title: string, context: string) => {
      const exercise = await exerciseService.createListeningExercise(
        title,
        settings.defaultLevel,
        context,
        settings.targetLanguage,
        settings.nativeLanguage,
        currentLesson?.id
      );
      addListeningExercise(exercise);
      setCurrentListeningExercise(exercise);
      return exercise;
    },
    [exerciseService, settings, currentLesson, addListeningExercise, setCurrentListeningExercise]
  );

  const generateListeningAudio = useCallback(async () => {
    if (!currentListeningExercise) return;
    const updatedExercise = await exerciseService.generateListeningAudio(
      currentListeningExercise
    );
    updateListeningExercise(updatedExercise);
    return updatedExercise;
  }, [exerciseService, currentListeningExercise, updateListeningExercise]);

  const evaluateListening = useCallback(
    async (userTranscription: string) => {
      if (!currentListeningExercise) return;
      const updatedExercise = await exerciseService.evaluateListening(
        currentListeningExercise,
        userTranscription
      );
      updateListeningExercise(updatedExercise);
      return updatedExercise;
    },
    [exerciseService, currentListeningExercise, updateListeningExercise]
  );

  const deleteListeningExercise = useCallback(
    async (id: string) => {
      await exerciseService.deleteListeningExercise(id);
      removeListeningExercise(id);
    },
    [exerciseService, removeListeningExercise]
  );

  const selectListeningExercise = useCallback(
    async (id: string) => {
      const exercise = await exerciseService.getListeningExercise(id);
      setCurrentListeningExercise(exercise);
    },
    [exerciseService, setCurrentListeningExercise]
  );

  const generateExerciseText = useCallback(
    async (partialText: string, type: 'speaking' | 'listening') => {
      if (type === 'speaking') {
        return exerciseService.generateSpeakingText(
          partialText,
          settings.targetLanguage,
          settings.defaultLevel
        );
      }
      return exerciseService.generateListeningText(
        partialText,
        settings.targetLanguage,
        settings.defaultLevel
      );
    },
    [exerciseService, settings]
  );

  return {
    speakingExercises,
    listeningExercises,
    currentSpeakingExercise,
    currentListeningExercise,
    loadExercises,
    createSpeakingExercise,
    evaluateSpeaking,
    deleteSpeakingExercise,
    selectSpeakingExercise,
    setCurrentSpeakingExercise,
    createListeningExercise,
    generateListeningAudio,
    evaluateListening,
    deleteListeningExercise,
    selectListeningExercise,
    setCurrentListeningExercise,
    generateExerciseText,
  };
}

export function useSettings() {
  const { settings, setSettings } = useAppStore();
  const { settingsService } = useServices();

  const loadSettings = useCallback(async () => {
    const stored = await settingsService.getSettings();
    setSettings(stored);
  }, [settingsService, setSettings]);

  const saveSettings = useCallback(async () => {
    await settingsService.saveSettings(settings);
  }, [settingsService, settings]);

  const updateLanguages = useCallback(
    async (nativeLanguage: string, targetLanguage: string) => {
      const updated = await settingsService.updateLanguages(
        settings,
        nativeLanguage,
        targetLanguage
      );
      setSettings(updated);
    },
    [settingsService, settings, setSettings]
  );

  const validateTextProvider = useCallback(
    async (apiKey: string) => {
      const updated = await settingsService.validateAndUpdateTextProvider(settings, {
        apiKey,
        provider: settings.textProvider.provider,
      });
      setSettings(updated);
      return updated.textProvider.isValid;
    },
    [settingsService, settings, setSettings]
  );

  const validateAudioProvider = useCallback(
    async (apiKey: string) => {
      const updated = await settingsService.validateAndUpdateAudioProvider(settings, {
        apiKey,
        provider: settings.audioProvider.provider,
      });
      setSettings(updated);
      return updated.audioProvider.isValid;
    },
    [settingsService, settings, setSettings]
  );

  return {
    settings,
    loadSettings,
    saveSettings,
    updateLanguages,
    validateTextProvider,
    validateAudioProvider,
    setSettings,
  };
}

export function useProgramme() {
  const {
    programmes,
    currentProgramme,
    courses,
    settings,
    setProgrammes,
    setCurrentProgramme,
    addProgramme,
    updateProgramme: updateProgrammeInStore,
    removeProgramme,
    setCourses,
  } = useAppStore();
  const { storage } = useServices();

  const loadProgrammes = useCallback(async () => {
    const allProgrammes = await storage.getAllProgrammes();
    setProgrammes(allProgrammes);
  }, [storage, setProgrammes]);

  const loadCourses = useCallback(async () => {
    const allCourses = await storage.getAllCourses();
    setCourses(allCourses);
  }, [storage, setCourses]);

  const createNewProgramme = useCallback(
    async (data: {
      title: string;
      description: string;
      level: 'C1' | 'C2' | 'C3';
      targetLanguage: string;
      nativeLanguage: string;
      tags: string[];
      estimatedHours: number;
      weeksRecommended: number;
    }) => {
      const programme = createProgramme(
        data.title,
        data.description,
        data.level,
        data.targetLanguage,
        data.nativeLanguage,
        'current-user' // TODO: Replace with actual user ID
      );
      programme.tags = data.tags;
      programme.duration = {
        estimatedHours: data.estimatedHours,
        weeksRecommended: data.weeksRecommended,
      };
      
      await storage.saveProgramme(programme);
      addProgramme(programme);
      setCurrentProgramme(programme);
      return programme;
    },
    [storage, addProgramme, setCurrentProgramme]
  );

  const updateCurrentProgramme = useCallback(
    async (updates: Partial<Programme>) => {
      if (!currentProgramme) return;
      const updated = updateProgrammeEntity(currentProgramme, updates);
      await storage.saveProgramme(updated);
      updateProgrammeInStore(updated);
      return updated;
    },
    [storage, currentProgramme, updateProgrammeInStore]
  );

  const publishCurrentProgramme = useCallback(async () => {
    if (!currentProgramme) return;
    const published = publishProgramme(currentProgramme);
    await storage.saveProgramme(published);
    updateProgrammeInStore(published);
    return published;
  }, [storage, currentProgramme, updateProgrammeInStore]);

  const archiveCurrentProgramme = useCallback(async () => {
    if (!currentProgramme) return;
    const archived = archiveProgramme(currentProgramme);
    await storage.saveProgramme(archived);
    updateProgrammeInStore(archived);
    return archived;
  }, [storage, currentProgramme, updateProgrammeInStore]);

  const deleteProgramme = useCallback(
    async (id: string) => {
      await storage.deleteProgramme(id);
      removeProgramme(id);
    },
    [storage, removeProgramme]
  );

  const selectProgramme = useCallback(
    async (id: string) => {
      const programme = await storage.getProgramme(id);
      setCurrentProgramme(programme);
    },
    [storage, setCurrentProgramme]
  );

  const addCourse = useCallback(
    async (courseId: string) => {
      if (!currentProgramme) return;
      const updated = addCourseToProgramme(currentProgramme, courseId);
      await storage.saveProgramme(updated);
      updateProgrammeInStore(updated);
      return updated;
    },
    [storage, currentProgramme, updateProgrammeInStore]
  );

  const removeCourseFromProgramme = useCallback(
    async (courseId: string) => {
      if (!currentProgramme) return;
      const updated = removeCoursFromProgramme(currentProgramme, courseId);
      await storage.saveProgramme(updated);
      updateProgrammeInStore(updated);
      return updated;
    },
    [storage, currentProgramme, updateProgrammeInStore]
  );

  const reorderCourses = useCallback(
    async (courseIds: string[]) => {
      if (!currentProgramme) return;
      const updated = reorderProgrammeCourses(currentProgramme, courseIds);
      await storage.saveProgramme(updated);
      updateProgrammeInStore(updated);
      return updated;
    },
    [storage, currentProgramme, updateProgrammeInStore]
  );

  // Get courses for current programme
  const programmeCourses = useMemo(() => {
    if (!currentProgramme) return [];
    return currentProgramme.courseIds
      .map(id => courses.find(c => c.id === id))
      .filter((c): c is Course => c !== undefined);
  }, [currentProgramme, courses]);

  return {
    programmes,
    currentProgramme,
    programmeCourses,
    courses,
    loadProgrammes,
    loadCourses,
    createProgramme: createNewProgramme,
    updateProgramme: updateCurrentProgramme,
    publishProgramme: publishCurrentProgramme,
    archiveProgramme: archiveCurrentProgramme,
    deleteProgramme,
    selectProgramme,
    setCurrentProgramme,
    addCourse,
    removeCourse: removeCourseFromProgramme,
    reorderCourses,
  };
}

export function useCourse() {
  const {
    courses,
    currentCourse,
    settings,
    setCourses,
    setCurrentCourse,
    addCourse,
    updateCourseInStore,
    removeCourse,
  } = useAppStore();
  const { storage } = useServices();

  const loadCourses = useCallback(async () => {
    const allCourses = await storage.getAllCourses();
    setCourses(allCourses);
  }, [storage, setCourses]);

  const createNewCourse = useCallback(
    async (data: {
      title: string;
      description: string;
      level: 'C1' | 'C2' | 'C3';
      targetLanguage: string;
      nativeLanguage: string;
      tags: string[];
      estimatedHours: number;
    }) => {
      const course = createCourse(
        data.title,
        data.description,
        data.level,
        data.targetLanguage,
        data.nativeLanguage,
        'current-user' // TODO: Replace with actual user ID
      );
      course.tags = data.tags;
      course.duration = {
        estimatedHours: data.estimatedHours,
        lessonsCount: 0,
        activitiesCount: 0,
      };
      
      await storage.saveCourse(course);
      addCourse(course);
      setCurrentCourse(course);
      return course;
    },
    [storage, addCourse, setCurrentCourse]
  );

  const updateCurrentCourse = useCallback(
    async (updates: Partial<Course>) => {
      if (!currentCourse) return;
      const updated = updateCourseEntity(currentCourse, updates);
      await storage.saveCourse(updated);
      updateCourseInStore(updated);
      return updated;
    },
    [storage, currentCourse, updateCourseInStore]
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      await storage.deleteCourse(id);
      removeCourse(id);
    },
    [storage, removeCourse]
  );

  const selectCourse = useCallback(
    async (id: string) => {
      const course = await storage.getCourse(id);
      setCurrentCourse(course);
    },
    [storage, setCurrentCourse]
  );

  return {
    courses,
    currentCourse,
    loadCourses,
    createCourse: createNewCourse,
    updateCourse: updateCurrentCourse,
    deleteCourse,
    selectCourse,
    setCurrentCourse,
  };
}

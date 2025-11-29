import {
  SpeakingExercise,
  ListeningExercise,
  PronunciationFeedback,
  ListeningFeedback,
  createSpeakingExercise,
  createListeningExercise,
  completeSpeakingExercise,
  completeListeningExercise,
} from '../../domain/entities/Exercise';
import { LessonLevel } from '../../domain/entities/Lesson';
import { ITextProviderPort, IAudioProviderPort, IStoragePort } from '../../domain/ports';

export class ExerciseService {
  constructor(
    private textProvider: ITextProviderPort,
    private audioProvider: IAudioProviderPort,
    private storage: IStoragePort
  ) {}

  // Speaking Exercise Methods
  async createSpeakingExercise(
    title: string,
    level: LessonLevel,
    context: string,
    targetLanguage: string,
    nativeLanguage: string,
    lessonId?: string
  ): Promise<SpeakingExercise> {
    const text = await this.textProvider.generateExerciseText({
      partialText: context,
      purpose: 'exercise',
      targetLanguage,
      level,
    });

    const exercise = createSpeakingExercise(
      title,
      level,
      text,
      context,
      targetLanguage,
      nativeLanguage,
      lessonId
    );

    await this.storage.saveSpeakingExercise(exercise);
    return exercise;
  }

  async generateSpeakingText(
    partialText: string,
    targetLanguage: string,
    level: LessonLevel
  ): Promise<string> {
    return this.textProvider.generateExerciseText({
      partialText,
      purpose: 'exercise',
      targetLanguage,
      level,
    });
  }

  async evaluateSpeaking(
    exercise: SpeakingExercise,
    recordingBlob: Blob
  ): Promise<SpeakingExercise> {
    // Transcribe the recording
    const transcription = await this.audioProvider.speechToText({
      audioBlob: recordingBlob,
      language: exercise.targetLanguage,
    });

    // Evaluate pronunciation
    const evaluationResponse = await this.textProvider.evaluatePronunciation({
      originalText: exercise.originalText,
      transcribedText: transcription,
      targetLanguage: exercise.targetLanguage,
    });

    let feedback: PronunciationFeedback;
    try {
      feedback = JSON.parse(evaluationResponse);
    } catch {
      feedback = {
        accuracy: 0,
        errors: [],
        overallScore: 0,
        suggestions: [evaluationResponse],
      };
    }

    const completedExercise = completeSpeakingExercise(
      exercise,
      transcription,
      feedback,
      recordingBlob
    );

    await this.storage.saveSpeakingExercise(completedExercise);
    return completedExercise;
  }

  async getSpeakingExercise(id: string): Promise<SpeakingExercise | null> {
    return this.storage.getSpeakingExercise(id);
  }

  async getAllSpeakingExercises(): Promise<SpeakingExercise[]> {
    return this.storage.getAllSpeakingExercises();
  }

  async deleteSpeakingExercise(id: string): Promise<void> {
    return this.storage.deleteSpeakingExercise(id);
  }

  // Listening Exercise Methods
  async createListeningExercise(
    title: string,
    level: LessonLevel,
    context: string,
    targetLanguage: string,
    nativeLanguage: string,
    lessonId?: string
  ): Promise<ListeningExercise> {
    const text = await this.textProvider.generateExerciseText({
      partialText: context,
      purpose: 'exercise',
      targetLanguage,
      level,
    });

    const exercise = createListeningExercise(
      title,
      level,
      text,
      context,
      targetLanguage,
      nativeLanguage,
      lessonId
    );

    // Generate audio for the exercise
    const audioBlob = await this.audioProvider.textToSpeech({
      text,
      language: targetLanguage,
    });

    const exerciseWithAudio = {
      ...exercise,
      audioBlob,
      audioUrl: URL.createObjectURL(audioBlob),
    };

    // Cache the audio
    await this.storage.saveAudioCache(`listening_${exercise.id}`, audioBlob);
    await this.storage.saveListeningExercise(exerciseWithAudio);

    return exerciseWithAudio;
  }

  async generateListeningText(
    partialText: string,
    targetLanguage: string,
    level: LessonLevel
  ): Promise<string> {
    return this.textProvider.generateExerciseText({
      partialText,
      purpose: 'exercise',
      targetLanguage,
      level,
    });
  }

  async generateListeningAudio(
    exercise: ListeningExercise
  ): Promise<ListeningExercise> {
    // Check cache first
    const cacheKey = `listening_${exercise.id}`;
    let audioBlob = await this.storage.getAudioCache(cacheKey);

    if (!audioBlob) {
      audioBlob = await this.audioProvider.textToSpeech({
        text: exercise.originalText,
        language: exercise.targetLanguage,
      });
      await this.storage.saveAudioCache(cacheKey, audioBlob);
    }

    const updatedExercise = {
      ...exercise,
      audioBlob,
      audioUrl: URL.createObjectURL(audioBlob),
    };

    await this.storage.saveListeningExercise(updatedExercise);
    return updatedExercise;
  }

  async evaluateListening(
    exercise: ListeningExercise,
    userTranscription: string
  ): Promise<ListeningExercise> {
    const evaluationResponse = await this.textProvider.evaluateListening({
      originalText: exercise.originalText,
      userTranscription,
      targetLanguage: exercise.targetLanguage,
    });

    let feedback: ListeningFeedback;
    try {
      feedback = JSON.parse(evaluationResponse);
    } catch {
      feedback = {
        accuracy: 0,
        errors: [],
        spellingErrors: [],
        overallScore: 0,
        comprehensionLevel: 'needs-improvement',
      };
    }

    const completedExercise = completeListeningExercise(
      exercise,
      userTranscription,
      feedback
    );

    await this.storage.saveListeningExercise(completedExercise);
    return completedExercise;
  }

  async getListeningExercise(id: string): Promise<ListeningExercise | null> {
    return this.storage.getListeningExercise(id);
  }

  async getAllListeningExercises(): Promise<ListeningExercise[]> {
    return this.storage.getAllListeningExercises();
  }

  async deleteListeningExercise(id: string): Promise<void> {
    return this.storage.deleteListeningExercise(id);
  }

  async updateSpeakingExercise(exercise: SpeakingExercise): Promise<void> {
    await this.storage.saveSpeakingExercise(exercise);
  }

  async updateListeningExercise(exercise: ListeningExercise): Promise<void> {
    await this.storage.saveListeningExercise(exercise);
  }
}

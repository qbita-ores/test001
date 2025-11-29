import {
  Lesson,
  LessonLevel,
  LessonContent,
  createLesson,
  updateLessonContent,
  linkSpeakingExercise,
  linkListeningExercise,
} from '../../domain/entities/Lesson';
import { Message } from '../../domain/entities/Chat';
import { ITextProviderPort, IStoragePort } from '../../domain/ports';
import { PromptTemplates, ExerciseTextResponse } from '../../domain/prompts';

export class LessonService {
  constructor(
    private textProvider: ITextProviderPort,
    private storage: IStoragePort
  ) {}

  /**
   * Parse AI response to extract structured text
   */
  private parseExerciseTextResponse(response: string): ExerciseTextResponse {
    return PromptTemplates.exerciseText.parseResponse(response);
  }

  async createLesson(
    title: string,
    level: LessonLevel,
    context: string,
    targetLanguage: string,
    nativeLanguage: string,
    chatId?: string
  ): Promise<Lesson> {
    const lesson = createLesson(
      title,
      level,
      context,
      targetLanguage,
      nativeLanguage,
      chatId
    );
    await this.storage.saveLesson(lesson);
    return lesson;
  }

  async generateLessonContent(
    lesson: Lesson,
    conversationContext?: Message[]
  ): Promise<Lesson> {
    const response = await this.textProvider.generateLesson({
      context: lesson.context,
      level: lesson.level,
      targetLanguage: lesson.targetLanguage,
      nativeLanguage: lesson.nativeLanguage,
      conversationContext,
    });

    let content: LessonContent;
    try {
      content = JSON.parse(response);
    } catch {
      // If parsing fails, create a structured response from text
      content = this.parseUnstructuredContent(response);
    }

    const updatedLesson = updateLessonContent(lesson, content);
    await this.storage.saveLesson(updatedLesson);
    return updatedLesson;
  }

  private parseUnstructuredContent(text: string): LessonContent {
    // Basic fallback parser for unstructured AI responses
    return {
      vocabulary: [],
      grammar: [
        {
          title: 'Lesson Content',
          explanation: text,
          examples: [],
        },
      ],
      conjugations: [],
    };
  }

  async generateContext(
    partialText: string,
    targetLanguage: string,
    level: LessonLevel
  ): Promise<ExerciseTextResponse> {
    const response = await this.textProvider.completeText({
      partialText,
      purpose: 'context',
      targetLanguage,
      level,
    });
    return this.parseExerciseTextResponse(response);
  }

  async suggestContext(
    targetLanguage: string,
    level: LessonLevel
  ): Promise<ExerciseTextResponse> {
    const response = await this.textProvider.generateExerciseText({
      partialText: '',
      purpose: 'lesson',
      targetLanguage,
      level,
    });
    return this.parseExerciseTextResponse(response);
  }

  async linkExerciseToLesson(
    lesson: Lesson,
    exerciseId: string,
    type: 'speaking' | 'listening'
  ): Promise<Lesson> {
    const updatedLesson =
      type === 'speaking'
        ? linkSpeakingExercise(lesson, exerciseId)
        : linkListeningExercise(lesson, exerciseId);

    await this.storage.saveLesson(updatedLesson);
    return updatedLesson;
  }

  async getLesson(id: string): Promise<Lesson | null> {
    return this.storage.getLesson(id);
  }

  async getAllLessons(): Promise<Lesson[]> {
    return this.storage.getAllLessons();
  }

  async deleteLesson(id: string): Promise<void> {
    return this.storage.deleteLesson(id);
  }

  async updateLesson(lesson: Lesson): Promise<void> {
    await this.storage.saveLesson(lesson);
  }
}

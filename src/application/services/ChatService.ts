import {
  Chat,
  Message,
  createChat,
  createMessage,
  addMessageToChat,
  updateMessageInChat,
} from '../../domain/entities/Chat';
import { ITextProviderPort, IStoragePort, IAudioProviderPort } from '../../domain/ports';
import { PromptTemplates } from '../../domain/prompts';

export class ChatService {
  constructor(
    private textProvider: ITextProviderPort,
    private audioProvider: IAudioProviderPort,
    private storage: IStoragePort
  ) {}

  async createNewChat(
    targetLanguage: string,
    nativeLanguage: string,
    title?: string
  ): Promise<Chat> {
    const chat = createChat(targetLanguage, nativeLanguage, title);
    await this.storage.saveChat(chat);
    return chat;
  }

  async sendMessage(chat: Chat, userContent: string): Promise<Chat> {
    // Add user message
    const userMessage = createMessage('user', userContent);
    let updatedChat = addMessageToChat(chat, userMessage);

    // Generate AI response using centralized prompt
    const systemPrompt = PromptTemplates.chat.systemPrompt(
      chat.targetLanguage,
      chat.nativeLanguage
    );

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...updatedChat.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const response = await this.textProvider.generateResponse({
      messages,
      targetLanguage: chat.targetLanguage,
      nativeLanguage: chat.nativeLanguage,
    });

    const assistantMessage = createMessage('assistant', response);
    updatedChat = addMessageToChat(updatedChat, assistantMessage);

    await this.storage.saveChat(updatedChat);
    return updatedChat;
  }

  async generateAudioForMessage(
    chat: Chat,
    messageId: string
  ): Promise<Chat> {
    const message = chat.messages.find((m) => m.id === messageId);
    if (!message) throw new Error('Message not found');

    // Check cache first
    const cacheKey = `audio_${messageId}`;
    let audioBlob = await this.storage.getAudioCache(cacheKey);

    if (!audioBlob) {
      audioBlob = await this.audioProvider.textToSpeech({
        text: message.content,
        language: chat.targetLanguage,
      });
      await this.storage.saveAudioCache(cacheKey, audioBlob);
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const updatedChat = updateMessageInChat(chat, messageId, {
      audioUrl,
      audioBlob,
    });

    await this.storage.saveChat(updatedChat);
    return updatedChat;
  }

  async translateMessage(
    chat: Chat,
    messageId: string
  ): Promise<{ chat: Chat; translation: string }> {
    const message = chat.messages.find((m) => m.id === messageId);
    if (!message) throw new Error('Message not found');

    // Check cache first
    const cacheKey = `translation_${messageId}`;
    let translation = await this.storage.getTranslationCache(cacheKey);

    if (!translation) {
      translation = await this.textProvider.translate({
        text: message.content,
        sourceLanguage: chat.targetLanguage,
        targetLanguage: chat.nativeLanguage,
      });
      await this.storage.saveTranslationCache(cacheKey, translation);
    }

    const updatedChat = updateMessageInChat(chat, messageId, { translation });
    await this.storage.saveChat(updatedChat);

    return { chat: updatedChat, translation };
  }

  async suggestResponses(chat: Chat): Promise<string[]> {
    return this.textProvider.suggestResponses({
      conversationHistory: chat.messages,
      targetLanguage: chat.targetLanguage,
      nativeLanguage: chat.nativeLanguage,
    });
  }

  async getChat(id: string): Promise<Chat | null> {
    return this.storage.getChat(id);
  }

  async getAllChats(): Promise<Chat[]> {
    return this.storage.getAllChats();
  }

  async deleteChat(id: string): Promise<void> {
    return this.storage.deleteChat(id);
  }

  async updateChat(chat: Chat): Promise<void> {
    await this.storage.saveChat(chat);
  }
}

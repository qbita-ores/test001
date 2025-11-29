import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  audioUrl?: string;
  audioBlob?: Blob;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  targetLanguage: string;
  nativeLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  lessonIds: string[];
}

export const createChat = (
  targetLanguage: string,
  nativeLanguage: string,
  title?: string
): Chat => ({
  id: uuidv4(),
  title: title || `Conversation ${new Date().toLocaleDateString()}`,
  messages: [],
  targetLanguage,
  nativeLanguage,
  createdAt: new Date(),
  updatedAt: new Date(),
  lessonIds: [],
});

export const createMessage = (
  role: 'user' | 'assistant',
  content: string
): Message => ({
  id: uuidv4(),
  role,
  content,
  timestamp: new Date(),
});

export const addMessageToChat = (chat: Chat, message: Message): Chat => ({
  ...chat,
  messages: [...chat.messages, message],
  updatedAt: new Date(),
});

export const updateMessageInChat = (
  chat: Chat,
  messageId: string,
  updates: Partial<Message>
): Chat => ({
  ...chat,
  messages: chat.messages.map((msg) =>
    msg.id === messageId ? { ...msg, ...updates } : msg
  ),
  updatedAt: new Date(),
});

export const linkLessonToChat = (chat: Chat, lessonId: string): Chat => ({
  ...chat,
  lessonIds: [...chat.lessonIds, lessonId],
  updatedAt: new Date(),
});

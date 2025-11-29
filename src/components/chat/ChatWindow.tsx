'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Chat, Message } from '@/domain/entities/Chat';
import { Spinner } from '@/components/ui/Spinner';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  chat: Chat | null;
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onGenerateAudio: (messageId: string) => Promise<void>;
  onTranslate: (messageId: string) => Promise<void>;
  onSuggestResponses: () => Promise<string[]>;
}

export function ChatWindow({
  chat,
  isLoading = false,
  onSendMessage,
  onGenerateAudio,
  onTranslate,
  onSuggestResponses,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
        <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">
          Start a Conversation
        </h3>
        <p className="text-center max-w-md">
          Create a new chat to start practicing your language skills with AI.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-center">
              Start the conversation by sending a message in {chat.targetLanguage}!
            </p>
          </div>
        ) : (
          <>
            {chat.messages.map((message: Message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onGenerateAudio={() => onGenerateAudio(message.id)}
                onTranslate={() => onTranslate(message.id)}
                isLoading={isLoading}
              />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Spinner size="sm" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <ChatInput
          onSendMessage={onSendMessage}
          onSuggestResponses={onSuggestResponses}
          isLoading={isLoading}
          placeholder={`Write in ${chat.targetLanguage}...`}
        />
      </div>
    </div>
  );
}

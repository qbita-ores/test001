'use client';

import { useState, useCallback } from 'react';
import { Volume2, Languages, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Message } from '@/domain/entities/Chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  onGenerateAudio: () => Promise<void>;
  onTranslate: () => Promise<void>;
  isLoading?: boolean;
}

export function ChatMessage({
  message,
  onGenerateAudio,
  onTranslate,
  isLoading = false,
}: ChatMessageProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const isUser = message.role === 'user';

  const handleGenerateAudio = useCallback(async () => {
    setIsGeneratingAudio(true);
    try {
      await onGenerateAudio();
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [onGenerateAudio]);

  const handleTranslate = useCallback(async () => {
    if (message.translation) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      await onTranslate();
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  }, [message.translation, showTranslation, onTranslate]);

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] space-x-3",
          isUser && "flex-row-reverse space-x-reverse"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUser ? "bg-blue-600" : "bg-gradient-to-br from-purple-500 to-pink-500"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col space-y-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              isUser
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {showTranslation && message.translation
                ? message.translation
                : message.content}
            </p>
          </div>

          {/* Actions */}
          <div className={cn("flex items-center space-x-1", isUser && "justify-end")}>
            {/* Audio Player / Generate Button */}
            {message.audioUrl || message.audioBlob ? (
              <AudioPlayer
                audioUrl={message.audioUrl}
                audioBlob={message.audioBlob}
                compact
              />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio || isLoading}
                className="h-7 w-7"
                title="Generate Audio"
              >
                <Volume2 className={cn("h-3.5 w-3.5", isGeneratingAudio && "animate-pulse")} />
              </Button>
            )}

            {/* Translate Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTranslate}
              disabled={isTranslating || isLoading}
              className={cn("h-7 w-7", showTranslation && "text-blue-600")}
              title={showTranslation ? "Show Original" : "Translate"}
            >
              <Languages className={cn("h-3.5 w-3.5", isTranslating && "animate-pulse")} />
            </Button>
          </div>

          {/* Timestamp */}
          <span className={cn("text-xs text-gray-400", isUser && "text-right")}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

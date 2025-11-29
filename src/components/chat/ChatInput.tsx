'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSuggestResponses: () => Promise<string[]>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onSuggestResponses,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isLoading || disabled) return;

    const content = message.trim();
    setMessage('');
    setSuggestions([]);
    setShowSuggestions(false);

    await onSendMessage(content);
  }, [message, isLoading, disabled, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleSuggestResponses = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const newSuggestions = await onSuggestResponses();
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [onSuggestResponses]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <div className="space-y-3">
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-xs text-blue-600 font-medium w-full mb-1">
            Suggested responses:
          </span>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="text-sm px-3 py-1.5 bg-white border border-blue-200 rounded-full hover:bg-blue-100 hover:border-blue-300 transition-colors"
            >
              {suggestion.length > 50 ? `${suggestion.substring(0, 50)}...` : suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-2 bg-gray-50 rounded-xl p-2">
        {/* Suggestion Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSuggestResponses}
          disabled={isLoadingSuggestions || isLoading || disabled}
          className="h-10 w-10 flex-shrink-0"
          title="Get response suggestions"
        >
          {isLoadingSuggestions ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Lightbulb className="h-5 w-5" />
          )}
        </Button>

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          className="flex-1 min-h-[40px] max-h-[150px] border-0 bg-transparent focus:ring-0 resize-none"
          rows={1}
        />

        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading || disabled}
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0",
            message.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

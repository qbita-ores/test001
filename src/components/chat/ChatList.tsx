'use client';

import { format } from 'date-fns';
import { MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import { Chat } from '@/domain/entities/Chat';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface ChatListProps {
  chats: Chat[];
  currentChatId?: string;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
}

export function ChatList({
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: ChatListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDeleteChat(id);
      setMenuOpenId(null);
    },
    [onDeleteChat]
  );

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-100">
        <Button onClick={onNewChat} className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No conversations yet. Start a new one!
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {chats.map((chat) => (
              <li
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "relative px-3 py-3 cursor-pointer transition-colors hover:bg-gray-50",
                  currentChatId === chat.id && "bg-blue-50 hover:bg-blue-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        currentChatId === chat.id ? "text-blue-600" : "text-gray-900"
                      )}
                    >
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {chat.targetLanguage}
                    </p>
                    {chat.messages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {chat.messages[chat.messages.length - 1].content.substring(0, 40)}...
                      </p>
                    )}
                  </div>

                  {/* Menu Button */}
                  <div className="relative ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>

                    {menuOpenId === chat.id && (
                      <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={(e) => handleDelete(e, chat.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400 mt-2">
                  {format(new Date(chat.updatedAt), 'MMM d, yyyy')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

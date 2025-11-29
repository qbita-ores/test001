'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatList } from '@/components/chat/ChatList';
import { useChat } from '@/hooks/useServices';
import { Spinner } from '@/components/ui/Spinner';

export default function ChatPage() {
  const {
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
  } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadChats();
      setIsInitialLoading(false);
    };
    init();
  }, [loadChats]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentChat) {
        // Create a new chat if none exists
        const chat = await createChat();
        setIsLoading(true);
        try {
          // Need to send message to the newly created chat
          // Since the hook will update currentChat, we need to wait
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        await sendMessage(content);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat, createChat, sendMessage]
  );

  const handleGenerateAudio = useCallback(
    async (messageId: string) => {
      await generateAudio(messageId);
    },
    [generateAudio]
  );

  const handleTranslate = useCallback(
    async (messageId: string) => {
      await translateMessage(messageId);
    },
    [translateMessage]
  );

  const handleNewChat = useCallback(async () => {
    await createChat();
  }, [createChat]);

  const handleSelectChat = useCallback(
    async (id: string) => {
      await selectChat(id);
    },
    [selectChat]
  );

  if (isInitialLoading) {
    return (
      <MainLayout title="Chat">
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Conversation Practice"
      sidebar={
        <ChatList
          chats={chats}
          currentChatId={currentChat?.id}
          onSelectChat={handleSelectChat}
          onDeleteChat={deleteChat}
          onNewChat={handleNewChat}
        />
      }
    >
      <ChatWindow
        chat={currentChat}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onGenerateAudio={handleGenerateAudio}
        onTranslate={handleTranslate}
        onSuggestResponses={suggestResponses}
      />
    </MainLayout>
  );
}

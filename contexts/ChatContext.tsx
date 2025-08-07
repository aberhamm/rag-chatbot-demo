'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useChat, type Message } from '@ai-sdk/react';





// Types for our chat context
interface ChatContextType {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  hasActiveChat: boolean;
  clearChat: () => void;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Session storage key
const CHAT_SESSION_KEY = 'rag-chat-session';

// Provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Initialize useChat with potential session data
  const chatHook = useChat({
    api: '/api/chat',
    initialMessages: [], // Will be loaded from session storage
  });

  const { messages, input, handleInputChange, handleSubmit, status, setMessages } = chatHook;

  // Load messages from session storage on mount
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem(CHAT_SESSION_KEY);
      if (savedSession) {
        const { messages: savedMessages, timestamp } = JSON.parse(savedSession);

        // Only restore if session is from the same browser session
        // (this provides the "fresh on refresh" behavior)
        const now = Date.now();
        const sessionAge = now - timestamp;
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours max

        if (sessionAge < maxSessionAge && savedMessages.length > 0) {
          console.log('📝 Restoring chat session with', savedMessages.length, 'messages');
          setMessages(savedMessages);
        }
      }
    } catch (error) {
      console.warn('Failed to load chat session:', error);
      // Clear corrupted session data
      sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, [setMessages]);

  // Save messages to session storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const sessionData = {
          messages,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(sessionData));
        console.log('💾 Chat session saved with', messages.length, 'messages');
      } catch (error) {
        console.warn('Failed to save chat session:', error);
      }
    }
  }, [messages]);

  // Function to clear the chat
  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(CHAT_SESSION_KEY);
    console.log('🗑️ Chat session cleared');
  };

  // Check if there's an active chat conversation
  const hasActiveChat = messages.length > 0;

  const contextValue: ChatContextType = {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleSubmit as (e: React.FormEvent<HTMLFormElement>) => void,
    isLoading: status === 'streaming',
    hasActiveChat,
    clearChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// Helper hook to check if there's an active chat (can be used anywhere)
export function useHasActiveChat() {
  const context = useContext(ChatContext);
  return context?.hasActiveChat ?? false;
}

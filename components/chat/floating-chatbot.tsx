'use client';

import React, { useState, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { PopupChat } from './popup-chat';

interface FloatingChatbotProps {
  className?: string;
}

export function FloatingChatbot({ className = '' }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Simple Chat Button */}
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <button
          onClick={toggleChat}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md flex items-center justify-center"
          aria-label="Chat"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Popup Chat */}
      <PopupChat isOpen={isOpen} onClose={closeChat} />
    </>
  );
}
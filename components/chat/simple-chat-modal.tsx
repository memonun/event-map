'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

interface SimpleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleChatModal({ isOpen, onClose }: SimpleChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Merhaba! Etkinlik hakkında ne öğrenmek istiyorsun?',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-5)
        }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Üzgünüm, bir hata oluştu.',
        timestamp: new Date().toISOString(),
        event_recommendations: data.eventRecommendations || []
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Bağlantı hatası. Tekrar deneyin.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
      <div className="bg-white w-80 h-full shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium">Chat</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`text-sm ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block p-2 rounded max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.content}
              </div>
              
              {/* Simple event recommendations */}
              {message.event_recommendations && message.event_recommendations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.event_recommendations.map((event) => (
                    <div key={event.id} className="text-xs bg-gray-50 p-2 rounded border">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-gray-600">
                        {new Date(event.date).toLocaleDateString('tr-TR')} • {event.venue?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 p-2 rounded text-sm">
                <span className="text-gray-600">Yazıyor...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesaj yaz..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
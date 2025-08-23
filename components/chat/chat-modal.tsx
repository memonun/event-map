'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Bot, User, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from '@/components/ui/chat-input';
import { EventRecommendationCard } from './event-recommendation-card';
import type { ChatMessage } from '@/lib/types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [conversationId] = useState(() => `chat-${Date.now()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: '👋 Merhaba! Ben senin AI etkinlik asistanınım. İstanbul\'daki konserler, tiyatro oyunları, stand-up gösteriler ve daha birçok etkinlik hakkında soru sorabilirsin. Hangi tür etkinlikler seni ilgilendiriyor?',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        event_recommendations: data.eventRecommendations || []
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '😔 Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const clearConversation = () => {
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: '👋 Yeni bir sohbet başlattık! Hangi etkinlikler hakkında bilgi almak istiyorsun?',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-card border border-border rounded-2xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-blue-950/50 dark:to-purple-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">AI Etkinlik Asistanı</h2>
                  <p className="text-sm text-muted-foreground">Event Map AI ile etkinlik keşfet</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Yeni Sohbet
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-accent"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex-1 max-w-[70%]">
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  
                  {/* Event recommendations */}
                  {message.event_recommendations && message.event_recommendations.length > 0 && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-gray-600 font-medium">Önerilen Etkinlikler:</p>
                      {message.event_recommendations.map((event) => (
                        <EventRecommendationCard
                          key={event.id}
                          event={event}
                          onEventClick={onClose} // Close modal when event is clicked
                        />
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Düşünüyorum...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Chat Input */}
          <div className="flex-shrink-0 p-6 border-t border-border bg-card">
            <ChatInput
              variant="default"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onSubmit={sendMessage}
              loading={isLoading}
              className="bg-background border-input focus-within:ring-2 focus-within:ring-ring focus-within:border-ring"
            >
              <ChatInputTextArea 
                placeholder="Etkinlik hakkında bir şey sor... (Enter ile gönder, Shift+Enter yeni satır)"
                disabled={isLoading}
                className="placeholder:text-muted-foreground text-foreground"
              />
              <ChatInputSubmit className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none" />
            </ChatInput>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI asistanı 20 etkinlik verisiyle çalışmaktadır. Beta sürümü.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
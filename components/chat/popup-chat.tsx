"use client";

import {
    ChatInput,
    ChatInputSubmit,
    ChatInputTextArea,
} from "@/components/ui/chat-input";
import { useState } from "react";
import { X } from "lucide-react";
import type { ChatMessage } from '@/lib/types';

interface PopupChatProps {
    isOpen: boolean;
    onClose: () => void;
}

function PopupChat({ isOpen, onClose }: PopupChatProps) {
    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const handleSubmit = async () => {
        if (!value.trim()) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: value.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentMessage = value;
        setValue("");
        setIsLoading(true);

        try {
            console.log('Sending message:', currentMessage);
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentMessage,
                    conversationHistory: messages.slice(-5)
                }),
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);

            setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.message || 'Sorry, something went wrong.',
                timestamp: new Date().toISOString(),
                event_recommendations: data.eventRecommendations || []
            }]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Connection error: ${error instanceof Error ? error.message : 'Please try again.'}`,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = () => {
        setIsLoading(false);
    };

    if (!isOpen) return null;

    const hasMessages = messages.length > 0;

    return (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className={`bg-white/95 backdrop-blur-md rounded-xl shadow-2xl transition-all duration-300 border border-gray-200/50 ${
                hasMessages ? 'w-full max-w-3xl h-[600px]' : 'w-full max-w-lg h-auto'
            } flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
                    <span className="text-base font-semibold text-gray-900">Event Assistant</span>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Messages - only show if there are messages */}
                {hasMessages && (
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                                <div className={`max-w-[75%] px-4 py-3 rounded-xl text-[15px] leading-relaxed ${
                                    message.role === 'user' 
                                        ? 'bg-gray-900 text-white' 
                                        : 'bg-gray-50 text-gray-800 border border-gray-200/50'
                                }`}>
                                    {message.content}
                                    
                                    {/* Event recommendations */}
                                    {message.event_recommendations && message.event_recommendations.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {message.event_recommendations.map((event) => (
                                                <div key={event.id} className="bg-white p-3 rounded-lg border border-gray-200/50">
                                                    <div className="font-medium text-gray-900">{event.name}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {new Date(event.date).toLocaleDateString('tr-TR', { 
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short'
                                                        })} • {event.venue?.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200/50">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div className="px-6 py-4 border-t border-gray-200/50">
                    <ChatInput
                        variant="default"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onSubmit={handleSubmit}
                        loading={isLoading}
                        onStop={handleStop}
                    >
                        <ChatInputTextArea placeholder="Ask about events, concerts, or activities..." />
                        <ChatInputSubmit />
                    </ChatInput>
                </div>
            </div>
        </div>
    );
}

export { PopupChat };
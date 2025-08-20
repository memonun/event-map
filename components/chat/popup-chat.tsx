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
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentMessage,
                    conversationHistory: messages.slice(-5)
                }),
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.message || 'Sorry, something went wrong.',
                timestamp: new Date().toISOString(),
                event_recommendations: data.eventRecommendations || []
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Connection error. Please try again.',
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
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-lg shadow-lg transition-all duration-200 ${
                hasMessages ? 'w-full max-w-2xl' : 'w-full max-w-md'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                    <span className="text-sm font-medium">Chat</span>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages - only show if there are messages */}
                {hasMessages && (
                    <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                    message.role === 'user' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-900'
                                }`}>
                                    {message.content}
                                    
                                    {/* Event recommendations */}
                                    {message.event_recommendations && message.event_recommendations.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {message.event_recommendations.map((event) => (
                                                <div key={event.id} className="bg-white/10 p-2 rounded text-xs">
                                                    <div className="font-medium">{event.name}</div>
                                                    <div className="opacity-80">
                                                        {new Date(event.date).toLocaleDateString()} • {event.venue?.name}
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
                                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                    <span className="text-gray-600">Typing...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div className="p-4 border-t">
                    <ChatInput
                        variant="default"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onSubmit={handleSubmit}
                        loading={isLoading}
                        onStop={handleStop}
                    >
                        <ChatInputTextArea placeholder="Type a message..." />
                        <ChatInputSubmit />
                    </ChatInput>
                </div>
            </div>
        </div>
    );
}

export { PopupChat };
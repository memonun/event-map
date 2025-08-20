"use client";

import {
    ChatInput,
    ChatInputSubmit,
    ChatInputTextArea,
} from "@/components/ui/chat-input";
import { useState } from "react";

function ChatInputDemo() {
    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = () => {
        if (value.trim()) {
            setIsLoading(true);
            console.log("Message sent:", value);
            
            // Simulate sending message
            setTimeout(() => {
                setValue(""); // Clear input after sending
                setIsLoading(false);
            }, 1000);
        }
    };

    const handleStop = () => {
        setIsLoading(false);
        console.log("Message sending stopped");
    };

    return (
        <div className="w-full max-w-[600px] mx-auto p-6 space-y-6">
            <h2 className="text-2xl font-bold">Enhanced Chat Input Demo</h2>
            
            {/* Default variant */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Default Variant</h3>
                <ChatInput
                    variant="default"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSubmit={handleSubmit}
                    loading={isLoading}
                    onStop={handleStop}
                >
                    <ChatInputTextArea placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)" />
                    <ChatInputSubmit />
                </ChatInput>
            </div>

            {/* Unstyled variant */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Unstyled Variant</h3>
                <ChatInput
                    variant="unstyled"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSubmit={handleSubmit}
                    loading={isLoading}
                    onStop={handleStop}
                >
                    <ChatInputTextArea 
                        placeholder="Unstyled input with custom border..."
                        className="border border-gray-300 rounded-lg"
                    />
                    <ChatInputSubmit />
                </ChatInput>
            </div>

            {/* Multi-row variant */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Multi-row Variant (3 rows)</h3>
                <ChatInput
                    variant="default"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSubmit={handleSubmit}
                    loading={isLoading}
                    onStop={handleStop}
                    rows={3}
                >
                    <ChatInputTextArea placeholder="Multi-row input - try typing a long message..." />
                    <ChatInputSubmit />
                </ChatInput>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <p><strong>Usage:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Press <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> to send message</li>
                    <li>Press <kbd className="bg-gray-200 px-1 rounded">Shift + Enter</kbd> for new line</li>
                    <li>Submit button is disabled when input is empty</li>
                    <li>Loading state shows stop button</li>
                    <li>Auto-resizing textarea based on content</li>
                </ul>
            </div>
        </div>
    );
}

export { ChatInputDemo };
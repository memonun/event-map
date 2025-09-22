import { ChatbotTest } from '@/components/debug/chatbot-test';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function ChatbotDebugPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                🤖 AI Chatbot Debug Console
              </h1>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Info Banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">
                ℹ️
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Debug Tools
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Use these tools to diagnose AI chatbot issues, inspect the embeddings database, 
                  and test vector search functionality.
                </p>
              </div>
            </div>
          </div>
          
          {/* Debug Component */}
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <ChatbotTest />
          </div>
          
          {/* Troubleshooting Guide */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              🔧 Troubleshooting Guide
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <span className="text-red-500 font-mono text-sm">❌</span>
                <div>
                  <strong className="text-foreground">Table access error:</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Check if unique_events_embeddings table exists in Supabase
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <span className="text-yellow-500 font-mono text-sm">⚠️</span>
                <div>
                  <strong className="text-foreground">Empty table:</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Run embeddings generation script to populate data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <span className="text-orange-500 font-mono text-sm">🔒</span>
                <div>
                  <strong className="text-foreground">Permission error:</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Grant SELECT permissions to anonymous/authenticated users
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <span className="text-purple-500 font-mono text-sm">🔍</span>
                <div>
                  <strong className="text-foreground">Vector search fails:</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ensure pgvector extension is enabled and indexes are created
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
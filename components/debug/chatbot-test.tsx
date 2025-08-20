'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmbeddingsService } from '@/lib/services/client/embeddings';

export function ChatbotTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEmbeddings = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Test fetching all available embeddings
      console.log('Fetching available embeddings...');
      const embeddings = await EmbeddingsService.getAllEmbeddings(5);
      
      if (embeddings.length === 0) {
        setTestResult('No embeddings found in database. Make sure you have run the SQL migration and populated the unique_events_embeddings table.');
        return;
      }

      console.log('Found embeddings:', embeddings.length);
      
      // Test vector search with the first embedding
      const firstEmbedding = embeddings[0];
      console.log('Testing vector search with embedding:', firstEmbedding.id);
      
      const similarEvents = await EmbeddingsService.searchSimilarEvents(
        firstEmbedding.embedding,
        { limit: 3, threshold: 0.1 } // Lower threshold for testing
      );

      console.log('Similar events found:', similarEvents.length);

      setTestResult(`✅ Test successful!
      
Embeddings found: ${embeddings.length}
Test embedding ID: ${firstEmbedding.id}
Test event ID: ${firstEmbedding.event_id}
Similar events: ${similarEvents.length}

Embedding content: "${firstEmbedding.content}"

${similarEvents.map((event, index) => 
  `${index + 1}. ${event.name} (${(event.similarity_score * 100).toFixed(1)}% similarity)`
).join('\n')}
      `);

    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`❌ Test failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testChatAPI = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'İstanbul\'da bu hafta sonu hangi konserler var?',
          conversationHistory: []
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      setTestResult(`✅ Chat API Test Successful!
      
Response: ${data.message}
      
Event Recommendations: ${data.eventRecommendations?.length || 0}
      `);

    } catch (error) {
      console.error('Chat API test failed:', error);
      setTestResult(`❌ Chat API test failed: ${(error as Error).message}
      
Make sure you have:
1. Set OPENAI_API_KEY in your environment
2. Run the SQL migration for vector functions
3. Populated the embeddings table`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chatbot & Embeddings Test</h2>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testEmbeddings} 
          disabled={loading}
          className="mr-4"
        >
          Test Vector Search
        </Button>
        
        <Button 
          onClick={testChatAPI} 
          disabled={loading}
          variant="outline"
        >
          Test Chat API
        </Button>
      </div>
      
      {loading && (
        <div className="text-blue-600">Running tests...</div>
      )}
      
      {testResult && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
}
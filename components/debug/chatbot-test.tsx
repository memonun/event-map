'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmbeddingsService } from '@/lib/services/client/embeddings';
import { createClient } from '@/lib/supabase/client';

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

  const inspectDatabase = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const supabase = createClient();
      
      // 1. Check if unique_events_embeddings table exists and get structure
      setTestResult('🔍 Inspecting database structure...\n');
      
      const { data: _tableInfo, error: tableError } = await supabase
        .from('unique_events_embeddings')
        .select('*')
        .limit(1);

      if (tableError) {
        setTestResult(`❌ Table access error: ${tableError.message}\n
Possible issues:
- Table doesn't exist
- Missing permissions
- Table name mismatch
        `);
        return;
      }

      // 2. Get table row count
      const { count, error: countError } = await supabase
        .from('unique_events_embeddings')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        setTestResult(prev => prev + `❌ Count error: ${countError.message}\n`);
        return;
      }

      // 3. Get first 20 rows with detailed analysis
      const { data: embeddings, error: dataError } = await supabase
        .from('unique_events_embeddings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (dataError) {
        setTestResult(prev => prev + `❌ Data fetch error: ${dataError.message}\n`);
        return;
      }

      // 4. Analyze the data structure
      let analysis = `✅ DATABASE INSPECTION COMPLETE\n\n`;
      analysis += `📊 TABLE SUMMARY:\n`;
      analysis += `- Total rows: ${count}\n`;
      analysis += `- Sample rows fetched: ${embeddings?.length || 0}\n\n`;

      if (embeddings && embeddings.length > 0) {
        const firstEmbedding = embeddings[0];
        analysis += `📝 TABLE STRUCTURE:\n`;
        analysis += `- Columns: ${Object.keys(firstEmbedding).join(', ')}\n`;
        
        if (firstEmbedding.embedding) {
          analysis += `- Embedding type: ${typeof firstEmbedding.embedding}\n`;
          analysis += `- Embedding constructor: ${firstEmbedding.embedding.constructor?.name}\n`;
          
          if (Array.isArray(firstEmbedding.embedding)) {
            analysis += `- Embedding dimensions: ${firstEmbedding.embedding.length}\n`;
          } else if (typeof firstEmbedding.embedding === 'string') {
            analysis += `- Embedding string length: ${firstEmbedding.embedding.length}\n`;
            analysis += `- First 100 chars: ${firstEmbedding.embedding.substring(0, 100)}...\n`;
          } else {
            analysis += `- Embedding structure: ${JSON.stringify(firstEmbedding.embedding).substring(0, 200)}...\n`;
          }
        }
        
        analysis += `\n📋 SAMPLE DATA (First 5 rows):\n`;
        embeddings.slice(0, 5).forEach((emb, index) => {
          analysis += `\n${index + 1}. ID: ${emb.id}\n`;
          analysis += `   Event ID: ${emb.event_id}\n`;
          analysis += `   Content: "${emb.content?.substring(0, 100)}${emb.content?.length > 100 ? '...' : ''}"\n`;
          
          // Handle different embedding formats safely
          if (emb.embedding) {
            if (Array.isArray(emb.embedding)) {
              analysis += `   Embedding: [${emb.embedding.slice(0, 3).map((n: number) => n.toFixed(4)).join(', ')}...] (${emb.embedding.length} dims)\n`;
            } else if (typeof emb.embedding === 'string') {
              analysis += `   Embedding: STRING format (${emb.embedding.length} chars)\n`;
            } else {
              analysis += `   Embedding: ${typeof emb.embedding} format\n`;
            }
          } else {
            analysis += `   Embedding: NULL or missing\n`;
          }
          
          analysis += `   Created: ${new Date(emb.created_at).toLocaleString()}\n`;
        });

        // 5. Test vector search with real data
        analysis += `\n🔬 VECTOR SEARCH TEST:\n`;
        try {
          const testEmbedding = embeddings[0];
          
          // Check if embedding format is compatible with search
          if (!testEmbedding.embedding) {
            analysis += `- ❌ Cannot test: No embedding data\n`;
          } else if (!Array.isArray(testEmbedding.embedding)) {
            analysis += `- ❌ Cannot test: Embedding is not array format (${typeof testEmbedding.embedding})\n`;
            analysis += `- Need to convert embeddings to JavaScript arrays for vector search\n`;
          } else {
            const similarEvents = await EmbeddingsService.searchSimilarEvents(
              testEmbedding.embedding,
              { limit: 3, threshold: 0.1 }
            );
            
            analysis += `- ✅ Search with first embedding successful\n`;
            analysis += `- Similar events found: ${similarEvents.length}\n`;
            
            if (similarEvents.length > 0) {
              analysis += `- Top match: ${similarEvents[0].name} (${(similarEvents[0].similarity_score * 100).toFixed(1)}%)\n`;
            }
          }
        } catch (searchError) {
          analysis += `- ❌ Vector search failed: ${(searchError as Error).message}\n`;
        }

      } else {
        analysis += `❌ No embeddings data found in table\n`;
        analysis += `\nPossible issues:\n`;
        analysis += `- Table exists but is empty\n`;
        analysis += `- Data not generated yet\n`;
        analysis += `- Migration not completed\n`;
      }

      setTestResult(analysis);

    } catch (error) {
      console.error('Database inspection failed:', error);
      setTestResult(`❌ Database inspection failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixEmbeddings = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      setTestResult('🔧 Starting embeddings fix process...\n');
      
      const response = await fetch('/api/admin/fix-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Fix API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      let result = `✅ EMBEDDINGS FIX COMPLETE\n\n`;
      result += `📊 SUMMARY:\n`;
      result += `- Total processed: ${data.total}\n`;
      result += `- Successfully fixed: ${data.fixed}\n`;
      result += `- Errors: ${data.errors}\n\n`;
      
      if (data.results && data.results.length > 0) {
        result += `📋 DETAILED RESULTS:\n`;
        data.results.forEach((item: { status: string; eventName?: string; contentLength?: number; embeddingDimensions?: number; reason?: string }, index: number) => {
          result += `\n${index + 1}. ${item.status === 'fixed' ? '✅' : '❌'} `;
          if (item.eventName) {
            result += `${item.eventName}\n`;
            result += `   Content: ${item.contentLength} chars\n`;
            result += `   Embedding: ${item.embeddingDimensions} dimensions\n`;
          } else {
            result += `Error: ${item.reason}\n`;
          }
        });
      }
      
      if (data.fixed > 0) {
        result += `\n🎉 Ready to test! The AI chatbot should now work with real event data.`;
      }
      
      setTestResult(result);

    } catch (error) {
      console.error('Fix embeddings failed:', error);
      setTestResult(`❌ Fix failed: ${(error as Error).message}
      
Make sure:
1. OPENAI_API_KEY is set correctly
2. Supabase permissions allow updates to embeddings table
3. Events table has proper venue relationships`);
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
    <div className="p-6">
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={inspectDatabase} 
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            🔍 Inspect Database
          </Button>
          
          <Button 
            onClick={fixEmbeddings} 
            disabled={loading}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            🔧 Fix Embeddings Data
          </Button>
          
          <Button 
            onClick={testEmbeddings} 
            disabled={loading}
            variant="outline"
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            ⚡ Test Vector Search
          </Button>
          
          <Button 
            onClick={testChatAPI} 
            disabled={loading}
            variant="outline" 
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            💬 Test Chat API
          </Button>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span className="text-muted-foreground">Running diagnostic tests...</span>
          </div>
        )}
        
        {/* Results */}
        {testResult && (
          <div className="border border-border rounded-lg bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                📋 Test Results
              </h3>
            </div>
            <div className="p-4">
              <pre className="text-sm whitespace-pre-wrap text-foreground font-mono bg-muted/30 p-4 rounded-md border border-border overflow-x-auto">
                {testResult}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
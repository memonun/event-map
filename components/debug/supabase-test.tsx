'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface TestResults {
  supabaseUrl: string;
  supabaseKey: string;
  uniqueEvents: {
    status: string;
    count: number;
    sample: Array<Record<string, unknown>>;
    error?: { code: string; message: string; details?: string };
  };
  canonicalVenues: {
    status: string;
    count: number;
    sample: Array<Record<string, unknown>>;
    error?: { code: string; message: string; details?: string };
  };
  geoQuery: {
    status: string;
    sample: Array<Record<string, unknown>>;
    error?: { code: string; message: string; details?: string };
  };
  eventsWithCoordinates: {
    count: number;
    error?: { code: string; message: string };
  };
  coordinateSamples: {
    status: string;
    sample: Array<Record<string, unknown>>;
    error?: { code: string; message: string };
  };
}

export function SupabaseTest() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    const supabase = createClient();
    
    try {
      // Test 1: Test unique_events table access
      console.log('Testing unique_events table access...');
      const { data: eventsData, error: eventsError, count: eventsCount } = await supabase
        .from('unique_events')
        .select('id, name, date, genre', { count: 'exact' })
        .limit(3);

      console.log('Events result:', { eventsData, eventsError, eventsCount });

      // Test 2: Test canonical_venues table access with coordinates
      console.log('Testing canonical_venues table access...');
      const { data: venuesData, error: venuesError, count: venuesCount } = await supabase
        .from('canonical_venues')
        .select('id, name, city, coordinates', { count: 'exact' })
        .not('coordinates', 'is', null)
        .limit(5);

      console.log('Venues result:', { venuesData, venuesError, venuesCount });

      // Test 3: Test PostGIS query (events with coordinates)
      console.log('Testing PostGIS query...');
      const { data: geoData, error: geoError } = await supabase
        .from('unique_events')
        .select(`
          id, name, date,
          canonical_venues!inner(
            id, name, coordinates
          )
        `)
        .not('canonical_venues.coordinates', 'is', null)
        .limit(3);

      console.log('PostGIS result:', { geoData, geoError });

      // Test 3b: Count events with coordinates (using proper join)
      console.log('Counting events with coordinates...');
      const { data: eventsWithCoords, error: coordsError, count: coordsCount } = await supabase
        .from('unique_events')
        .select('id, canonical_venue_id', { count: 'exact' })
        .not('canonical_venue_id', 'is', null);

      console.log('Events with coordinates:', { coordsCount, coordsError });

      // Test 4: Test venue coordinate format
      console.log('Testing venue coordinate format...');
      const { data: coordSample, error: coordSampleError } = await supabase
        .from('canonical_venues')
        .select('id, name, coordinates')
        .not('coordinates', 'is', null)
        .limit(3);

      console.log('Coordinate samples:', { coordSample, coordSampleError });

      setResults({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not configured',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY.substring(0, 20)}...` : 'not configured',
        uniqueEvents: {
          status: eventsError ? `ERROR: ${eventsError.message}` : 'SUCCESS',
          count: eventsCount || 0,
          sample: eventsData || [],
          error: eventsError ? { code: eventsError.code || 'UNKNOWN', message: eventsError.message } : undefined
        },
        canonicalVenues: {
          status: venuesError ? `ERROR: ${venuesError.message}` : 'SUCCESS',
          count: venuesCount || 0,
          sample: venuesData || [],
          error: venuesError ? { code: venuesError.code || 'UNKNOWN', message: venuesError.message } : undefined
        },
        geoQuery: {
          status: geoError ? `ERROR: ${geoError.message}` : 'SUCCESS',
          sample: geoData || [],
          error: geoError
        },
        eventsWithCoordinates: {
          count: coordsCount || 0,
          error: coordsError
        },
        coordinateSamples: {
          status: coordSampleError ? `ERROR: ${coordSampleError.message}` : 'SUCCESS',
          sample: coordSample || [],
          error: coordSampleError
        }
      });

    } catch (err: unknown) {
      console.error('Full test error:', err);
      setError(`Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <Button 
        onClick={testConnection} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {/* Connection Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Connection Info:</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Supabase URL:</strong> {results.supabaseUrl}</div>
              <div><strong>Anon Key:</strong> {results.supabaseKey}</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Database Test Results:</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <strong>unique_events table:</strong>
                <span className={results.uniqueEvents.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                  {' '}{results.uniqueEvents.status}
                </span>
                {results.uniqueEvents.status === 'SUCCESS' && (
                  <div className="ml-4 mt-1 text-gray-600">
                    Total records: {results.uniqueEvents.count}
                  </div>
                )}
              </div>
              
              <div>
                <strong>canonical_venues table:</strong>
                <span className={results.canonicalVenues.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                  {' '}{results.canonicalVenues.status}
                </span>
                {results.canonicalVenues.status === 'SUCCESS' && (
                  <div className="ml-4 mt-1 text-gray-600">
                    Total records: {results.canonicalVenues.count}
                  </div>
                )}
              </div>

              <div>
                <strong>PostGIS/Geography Query:</strong>
                <span className={results.geoQuery.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                  {' '}{results.geoQuery.status}
                </span>
              </div>

              <div>
                <strong>Events with Coordinates:</strong>
                <span className="text-blue-600">
                  {' '}{results.eventsWithCoordinates.count} events
                </span>
                {results.eventsWithCoordinates.error && (
                  <span className="text-red-600 ml-2">
                    (Error: {results.eventsWithCoordinates.error.message})
                  </span>
                )}
              </div>

              <div>
                <strong>Coordinate Samples:</strong>
                <span className={results.coordinateSamples.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                  {' '}{results.coordinateSamples.status}
                </span>
                {results.coordinateSamples.status === 'SUCCESS' && (
                  <span className="text-gray-600 ml-2">
                    ({results.coordinateSamples.sample.length} samples)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sample Data */}
          {(results.uniqueEvents.sample?.length > 0 || results.canonicalVenues.sample?.length > 0 || results.coordinateSamples.sample?.length > 0) && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h4 className="font-semibold text-green-800 mb-2">Sample Data Retrieved:</h4>
              {results.uniqueEvents.sample?.length > 0 && (
                <div className="mb-2">
                  <strong>Events:</strong>
                  <ul className="ml-4 mt-1 text-sm">
                    {results.uniqueEvents.sample.slice(0, 2).map((event: Record<string, unknown>, i: number) => (
                      <li key={i} className="text-gray-700">• {event.name} ({event.genre})</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.canonicalVenues.sample?.length > 0 && (
                <div className="mb-2">
                  <strong>Venues:</strong>
                  <ul className="ml-4 mt-1 text-sm">
                    {results.canonicalVenues.sample.slice(0, 2).map((venue: Record<string, unknown>, i: number) => (
                      <li key={i} className="text-gray-700">• {venue.name} ({venue.city})</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.coordinateSamples.sample?.length > 0 && (
                <div>
                  <strong>Coordinate Samples:</strong>
                  <ul className="ml-4 mt-1 text-sm">
                    {results.coordinateSamples.sample.slice(0, 2).map((venue: Record<string, unknown>, i: number) => (
                      <li key={i} className="text-gray-700">• {venue.name}: {JSON.stringify(venue.coordinates)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error Details */}
          {(results.uniqueEvents.error || results.canonicalVenues.error || results.geoQuery.error || results.coordinateSamples.error) && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-semibold text-red-800 mb-2">Detailed Errors:</h4>
              <div className="space-y-2 text-sm">
                {results.uniqueEvents.error && (
                  <div>
                    <strong>unique_events:</strong> 
                    <div className="ml-4 text-red-700">
                      Code: {results.uniqueEvents.error.code}<br/>
                      Message: {results.uniqueEvents.error.message}<br/>
                      Details: {results.uniqueEvents.error.details}
                    </div>
                  </div>
                )}
                {results.canonicalVenues.error && (
                  <div>
                    <strong>canonical_venues:</strong>
                    <div className="ml-4 text-red-700">
                      Code: {results.canonicalVenues.error.code}<br/>
                      Message: {results.canonicalVenues.error.message}<br/>
                      Details: {results.canonicalVenues.error.details}
                    </div>
                  </div>
                )}
                {results.geoQuery.error && (
                  <div>
                    <strong>PostGIS Query:</strong>
                    <div className="ml-4 text-red-700">
                      Code: {results.geoQuery.error.code}<br/>
                      Message: {results.geoQuery.error.message}<br/>
                      Details: {results.geoQuery.error.details}
                    </div>
                  </div>
                )}
                {results.coordinateSamples.error && (
                  <div>
                    <strong>Coordinate Samples:</strong>
                    <div className="ml-4 text-red-700">
                      Code: {results.coordinateSamples.error.code}<br/>
                      Message: {results.coordinateSamples.error.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Results */}
          <details className="bg-gray-50 border border-gray-200 rounded p-4">
            <summary className="font-semibold cursor-pointer">Raw Results (Click to expand)</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
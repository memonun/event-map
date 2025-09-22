'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EventMap } from './event-map';
import { ClientEventsService } from '@/lib/services/client';
import type { EventWithVenue, MapBounds, EventSearchParams } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

interface EventMapContainerProps {
  initialEvents?: EventWithVenue[];
  mapboxAccessToken: string;
  onEventSelect?: (event: EventWithVenue) => void;
  searchParams?: EventSearchParams;
  className?: string;
}

export function EventMapContainer({
  initialEvents = [],
  mapboxAccessToken,
  onEventSelect,
  searchParams = {},
  className = "w-full h-full"
}: EventMapContainerProps) {
  const [events, setEvents] = useState<EventWithVenue[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setMapBounds] = useState<MapBounds | null>(null);

  // Load events based on search parameters
  const loadEvents = useCallback(async (params: EventSearchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // For map view, prioritize events with coordinates
      console.log('Loading events for map with params:', { ...searchParams, ...params });
      
      const events = await ClientEventsService.getEventsForMap(500);
      console.log('Loaded events for map:', events.length, 'events');
      console.log('Sample events:', events.slice(0, 2));
      
      if (events.length === 0) {
        console.warn('No events loaded for map - checking if this is a data or query issue');
        // Try getting any events as fallback
        const fallbackResponse = await ClientEventsService.searchEvents({ limit: 50 });
        console.log('Fallback events loaded:', fallbackResponse.events.length);
        setEvents(fallbackResponse.events);
      } else {
        setEvents(events);
      }
    } catch (err) {
      console.error('Error loading events for map:', err);
      setError('Etkinlikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Load events when map bounds change (for performance optimization)
  const handleBoundsChange = useCallback(async (bounds: MapBounds) => {
    setMapBounds(bounds);
    
    // Only reload if we have significant bounds change
    // This prevents too frequent API calls during map interaction
    // TODO: Implement efficient bounds-based loading
  }, []);

  // Load events on component mount
  useEffect(() => {
    console.log('EventMapContainer mounted, initialEvents:', initialEvents.length);
    if (initialEvents.length === 0) {
      console.log('No initial events, loading from database...');
      loadEvents();
    }
  }, [loadEvents, initialEvents.length]);

  // Handle event selection
  const handleEventClick = useCallback((event: EventWithVenue) => {
    onEventSelect?.(event);
  }, [onEventSelect]);

  // Error state
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadEvents()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Etkinlikler yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Map component */}
      <EventMap
        events={events}
        mapboxAccessToken={mapboxAccessToken}
        onBoundsChange={handleBoundsChange}
        onEventClick={handleEventClick}
        className="w-full h-full"
      />

      {/* Event count indicator */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 z-10">
        <p className="text-sm font-medium text-gray-700">
          {events.length} etkinlik gösteriliyor
        </p>
      </div>
    </div>
  );
}
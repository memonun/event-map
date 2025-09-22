'use client';

import React, { useState, useCallback } from 'react';
import { EventCard } from './event-card';
import { ClientEventsService } from '@/lib/services/client';
import { Loader2, AlertCircle, Grid3X3, List, MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EventWithVenue, EventSearchParams } from '@/lib/types';

interface EventListProps {
  initialEvents?: EventWithVenue[];
  searchParams?: EventSearchParams;
  onEventSelect?: (event: EventWithVenue) => void;
  onLoadMore?: (events: EventWithVenue[]) => void;
  showDistance?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export function EventList({
  initialEvents = [],
  searchParams = {},
  onEventSelect,
  onLoadMore,
  showDistance = false,
  className = ""
}: EventListProps) {
  const [events, setEvents] = useState<EventWithVenue[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [offset, setOffset] = useState(initialEvents.length);

  // Load events
  const loadEvents = useCallback(async (params: EventSearchParams = {}, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setOffset(0);
    }
    
    setError(null);
    
    try {
      const response = await ClientEventsService.searchEvents({
        ...searchParams,
        ...params,
        offset: append ? offset : 0,
        limit: 20
      });
      
      if (append) {
        const newEvents = [...events, ...response.events];
        setEvents(newEvents);
        setOffset(prev => prev + response.events.length);
        onLoadMore?.(newEvents);
      } else {
        setEvents(response.events);
        setOffset(response.events.length);
      }
      
      setHasMore(response.has_more);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Etkinlikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams, events, offset, onLoadMore]);

  // Load initial events if none provided
  React.useEffect(() => {
    if (initialEvents.length === 0) {
      loadEvents();
    }
  }, [loadEvents, initialEvents.length]);

  // Load more events
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadEvents({}, true);
    }
  }, [loadEvents, loadingMore, hasMore]);

  // Handle event click
  const handleEventClick = useCallback((event: EventWithVenue) => {
    onEventSelect?.(event);
  }, [onEventSelect]);

  // Refresh events
  const refreshEvents = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  // Loading state
  if (loading && events.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Etkinlikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshEvents} variant="outline">
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Etkinlik bulunamadı
          </h3>
          <p className="text-gray-600 mb-4">
            Arama kriterlerinize uygun etkinlik bulunamadı.
          </p>
          <Button onClick={refreshEvents} variant="outline">
            Tüm etkinlikleri göster
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with view controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Etkinlikler
          </h2>
          <p className="text-gray-600 mt-1">
            {events.length} etkinlik gösteriliyor
            {hasMore && ' • Daha fazla yüklenebilir'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Events grid/list */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {events.map((event, index) => (
          <EventCard
            key={`${event.id}-${index}`}
            event={event}
            onEventClick={handleEventClick}
            showDistance={showDistance}
            compactView={viewMode === 'list'}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Yükleniyor...
              </>
            ) : (
              'Daha fazla göster'
            )}
          </Button>
        </div>
      )}

      {/* Loading overlay for load more */}
      {loadingMore && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Yeni etkinlikler yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
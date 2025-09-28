'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SmartClusterMap } from './map/smart-cluster-map';
import { FloatingSearch } from './map/floating-search';
import { FloatingUserMenu } from './map/floating-user-menu';
import { UniversalEventPanel } from './map/universal-event-panel';
import { PanelToggleButton } from './map/panel-toggle-button';
import { EventDetailModal } from './map/event-detail-modal';
import { FloatingChatbot } from './chat/floating-chatbot';
import { ClientEventsService } from '@/lib/services/client';
import { isAIEnabled } from '@/lib/utils/ai-config';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

interface AirbnbStyleMapPlatformProps {
  mapboxAccessToken: string;
}

export function AirbnbStyleMapPlatform({ mapboxAccessToken }: AirbnbStyleMapPlatformProps) {
  const [searchFilters, setSearchFilters] = useState<EventSearchParams>({});
  const [selectedVenue, setSelectedVenue] = useState<CanonicalVenue | null>(null);
  const [panelEvents, setPanelEvents] = useState<EventWithVenue[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithVenue | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [currentMapBounds, setCurrentMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [isFirstBoundsLoad, setIsFirstBoundsLoad] = useState(true);

  // Enable chatbot after hydration to prevent SSR mismatch
  useEffect(() => {
    setShowChatbot(isAIEnabled());
  }, []);

  // Load events for the panel based on current context
  const loadPanelEvents = useCallback(async (filters: EventSearchParams = searchFilters, forceSearch: boolean = false) => {
    setPanelLoading(true);
    try {
      // Determine whether to use bounds-based or search-based loading
      const hasSearchQuery = filters.query || filters.genre || filters.city;
      const shouldUseBoundsLoading = !hasSearchQuery && !selectedVenue && !forceSearch && currentMapBounds;

      console.log('📊 Loading panel events with params:', {
        hasSearchQuery,
        selectedVenue: !!selectedVenue,
        forceSearch,
        currentMapBounds: !!currentMapBounds,
        shouldUseBoundsLoading
      });

      if (shouldUseBoundsLoading) {
        // Use bounds-based loading for location-specific events
        console.log('🌍 Loading panel events using map bounds:', currentMapBounds);
        const events = await ClientEventsService.getEventsInBounds(currentMapBounds, 100);
        setPanelEvents(events);
        console.log('✅ Loaded panel events (bounds-based):', events.length);
      } else {
        // Use search-based loading for filtered results
        console.log('🔍 Loading panel events using search filters:', filters);
        const response = await ClientEventsService.searchEvents({
          ...filters,
          limit: 100, // Reasonable limit for panel display
          offset: 0
        });
        setPanelEvents(response.events);
        console.log('✅ Loaded panel events (search-based):', response.events.length);
      }
    } catch (error) {
      console.error('❌ Error loading panel events:', error);
      setPanelEvents([]);
    } finally {
      setPanelLoading(false);
    }
  }, [searchFilters, selectedVenue, currentMapBounds]);

  // Handle map bounds changes
  const handleBoundsChange = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    setCurrentMapBounds(bounds);
    console.log('🗺️ Map bounds changed:', bounds);

    // If panel is open and we're not showing venue-specific or search results, reload with new bounds
    const hasActiveFilters = searchFilters.query || searchFilters.genre || searchFilters.city;
    const shouldReloadPanelEvents = isPanelOpen && !selectedVenue && !hasActiveFilters;

    console.log('Panel update check:', {
      isPanelOpen,
      selectedVenue: !!selectedVenue,
      hasActiveFilters,
      shouldReloadPanelEvents,
      isFirstBoundsLoad
    });

    if (shouldReloadPanelEvents) {
      console.log('🔄 Reloading panel events for new bounds...');
      loadPanelEvents();
    }

    // Auto-open panel on first location-based load (with delay to ensure user sees the change)
    if (isFirstBoundsLoad && !isPanelOpen && !selectedVenue && !hasActiveFilters) {
      console.log('🚀 Auto-opening panel for first location-based load...');
      setTimeout(() => {
        setIsPanelOpen(true);
        loadPanelEvents();
      }, 1000); // 1 second delay to let user see map center on their location
      setIsFirstBoundsLoad(false);
    }
  }, [isPanelOpen, selectedVenue, searchFilters, loadPanelEvents, isFirstBoundsLoad]);

  // Handle search filter changes
  const handleFiltersChange = useCallback((filters: EventSearchParams) => {
    setSearchFilters(filters);
    console.log('Search filters updated:', filters);
    
    // If panel is open and showing general events, reload them with new filters
    if (isPanelOpen && !selectedVenue) {
      loadPanelEvents(filters);
    }
  }, [isPanelOpen, selectedVenue, loadPanelEvents]);

  // Handle search execution (auto-open panel)
  const handleSearchExecuted = useCallback((hasQuery: boolean) => {
    if (hasQuery) {
      // Clear venue selection and open panel with search results
      setSelectedVenue(null);
      setIsPanelOpen(true);
      loadPanelEvents(searchFilters);
      console.log('Auto-opening panel for search results');
    }
  }, [searchFilters, loadPanelEvents]);

  // Handle venue selection from map
  const handleVenueSelect = useCallback((venue: CanonicalVenue, events: EventWithVenue[]) => {
    setSelectedVenue(venue);
    setPanelEvents(events);
    setIsPanelOpen(true);
    console.log('Venue selected:', venue.name, 'Events:', events.length);
  }, []);

  // Handle panel toggle
  const handlePanelToggle = useCallback(() => {
    if (!isPanelOpen) {
      // Opening panel - load appropriate events
      if (selectedVenue) {
        // Keep venue-specific events
        setIsPanelOpen(true);
      } else {
        // Load general events
        setIsPanelOpen(true);
        loadPanelEvents();
      }
    } else {
      // Closing panel
      setIsPanelOpen(false);
    }
  }, [isPanelOpen, selectedVenue, loadPanelEvents]);

  // Handle panel close
  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedVenue(null);
    setPanelEvents([]);
  }, []);

  // Handle event click to open detail modal
  const handleEventClick = useCallback((event: EventWithVenue) => {
    console.log('Event clicked:', event.name);
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, []);

  // Handle event modal close
  const handleEventModalClose = useCallback(() => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen map background */}
      <SmartClusterMap
        mapboxAccessToken={mapboxAccessToken}
        searchParams={searchFilters}
        onVenueSelect={handleVenueSelect}
        onBoundsChange={handleBoundsChange}
        isRightPanelOpen={isPanelOpen}
        className="absolute inset-0"
      />

      {/* Floating UI Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top section - Search and branding */}
        <div className="flex flex-col items-center pt-6 px-4 pointer-events-auto">
          <FloatingSearch 
            onFiltersChange={handleFiltersChange}
            initialFilters={searchFilters}
            onSearchExecuted={handleSearchExecuted}
          />
        </div>

        {/* Top right - User menu */}
        <div className="absolute top-6 right-6 pointer-events-auto">
          <FloatingUserMenu />
        </div>
      </div>

      {/* Universal Event Panel */}
      <UniversalEventPanel
        events={panelEvents}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        onEventClick={handleEventClick}
        selectedVenue={selectedVenue}
        searchParams={searchFilters}
        loading={panelLoading}
      />

      {/* Panel Toggle Button */}
      <PanelToggleButton
        isOpen={isPanelOpen}
        onClick={handlePanelToggle}
        eventCount={panelEvents.length}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleEventModalClose}
      />

      {/* AI Chatbot */}
      {showChatbot && <FloatingChatbot />}
    </div>
  );
}
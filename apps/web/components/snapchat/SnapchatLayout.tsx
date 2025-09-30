'use client';

import React, { useState, useCallback, useRef } from 'react';
import { LeftPanel } from './LeftPanel';
import { TabbedRightPanel } from './TabbedRightPanel';
import { ProfilePanel } from './ProfilePanel';
import { ZoomBar } from '@/components/map/ZoomBar';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

interface SnapchatLayoutProps {
  mapboxAccessToken: string;
}

export function SnapchatLayout({ mapboxAccessToken }: SnapchatLayoutProps) {
  // Map reference for zoom controls
  const mapRef = useRef<any>(null);

  // Core application state
  const [searchFilters, setSearchFilters] = useState<EventSearchParams>({});
  const [selectedVenue, setSelectedVenue] = useState<CanonicalVenue | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<EventWithVenue[]>([]);

  // Panel state management
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'events' | 'venues' | 'people'>('events');

  // Location-based events state (for tabbed panel)
  const [locationEvents, setLocationEvents] = useState<EventWithVenue[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentMapBounds, setCurrentMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // Venues state for tabbed panel
  const [nearbyVenues] = useState<CanonicalVenue[]>([]);
  const [selectedVenueForEvents, setSelectedVenueForEvents] = useState<CanonicalVenue | null>(null);

  // Handle search filter changes
  const handleFiltersChange = useCallback((filters: EventSearchParams) => {
    setSearchFilters(filters);
    console.log('Search filters updated:', filters);
  }, []);

  // Handle venue selection from map
  const handleVenueSelect = useCallback((venue: CanonicalVenue, events: EventWithVenue[]) => {
    setSelectedVenue(venue);
    setSelectedEvents(events);

    // Automatically open right panel when venue with events is selected
    if (events.length > 0 && !isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }

    console.log('Venue selected:', venue.name, 'Events:', events.length);
  }, [isRightPanelOpen]);

  // Handle event click to show in right panel (no modal)
  const handleEventClick = useCallback((event: EventWithVenue) => {
    console.log('SnapchatLayout: handleEventClick called with:', event.name);
    console.log('SnapchatLayout: Event will be shown in right panel');

    // Automatically open right panel when individual event is clicked
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }

    // The TabbedRightPanel will handle showing the event details internally
    // No modal state needed anymore
  }, [isRightPanelOpen]);


  // Handle right panel toggle
  const handleRightPanelToggle = useCallback(() => {
    setIsRightPanelOpen(prev => !prev);
  }, []);

  // Handle profile panel open
  const handleProfileOpen = useCallback(() => {
    setShowProfile(true);
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }
  }, [isRightPanelOpen]);

  // Handle profile panel close
  const handleProfileClose = useCallback(() => {
    setShowProfile(false);
  }, []);

  // Handle home button click - return to nearby events
  const handleHomeClick = useCallback(() => {
    setSelectedVenue(null);
    setSelectedEvents([]);
    setActiveRightPanelTab('events');
    setShowProfile(false);
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }
  }, [isRightPanelOpen]);



  // Handle venue selection for events view
  const handleVenueSelectForEvents = useCallback((venue: CanonicalVenue) => {
    setSelectedVenueForEvents(venue);
  }, []);

  // Handle back to venues list from venue details
  const handleBackToVenuesList = useCallback(() => {
    setSelectedVenueForEvents(null);
  }, []);

  // Handle map bounds change for location-based events
  const handleMapBoundsChange = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    setCurrentMapBounds(bounds);
  }, []);

  // Handle location events update (from map component)
  const handleLocationEventsUpdate = useCallback((events: EventWithVenue[], loading: boolean = false) => {
    setLocationEvents(events);
    setEventsLoading(loading);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
      {/* Full Map View */}
      <div className="h-full w-full">
        <LeftPanel
          mapboxAccessToken={mapboxAccessToken}
          searchParams={searchFilters}
          onFiltersChange={handleFiltersChange}
          onVenueSelect={handleVenueSelect}
          onEventClick={handleEventClick}
          onRightPanelToggle={handleRightPanelToggle}
          onProfileOpen={handleProfileOpen}
          onHomeClick={handleHomeClick}
          isRightPanelOpen={isRightPanelOpen}
          onMapBoundsChange={handleMapBoundsChange}
          onLocationEventsUpdate={handleLocationEventsUpdate}
          mapRef={mapRef}
        />
      </div>

      {/* Right Panel Overlay - Desktop & Mobile */}
      {isRightPanelOpen && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Panel Container - Right side covering 45% */}
          <div className="absolute right-0 top-0 w-full md:w-[45%] h-full pointer-events-auto">
            <div className="relative h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-white/20 overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleRightPanelToggle}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Panel Content */}
              <div className="h-full overflow-hidden">
                {showProfile ? (
                  /* Profile Panel as Overlay */
                  <ProfilePanel onBack={handleProfileClose} />
                ) : (
                  /* Default Tabbed Interface: Events + Venues + People */
                  <TabbedRightPanel
                    activeTab={activeRightPanelTab}
                    onTabChange={setActiveRightPanelTab}
                    events={selectedEvents.length > 0 ? selectedEvents : locationEvents}
                    isEventsLoading={eventsLoading}
                    onEventClick={handleEventClick}
                    selectedVenue={selectedVenue}
                    searchParams={searchFilters}
                    nearbyVenues={nearbyVenues}
                    selectedVenueForEvents={selectedVenueForEvents}
                    onVenueSelectForEvents={handleVenueSelectForEvents}
                    onBackToVenuesList={handleBackToVenuesList}
                    currentMapBounds={currentMapBounds}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Bar - Positioned on left border of right panel */}
      <ZoomBar
        mapRef={mapRef}
        isRightPanelOpen={isRightPanelOpen}
      />

      {/* Event Details are now shown in the right panel */}
    </div>
  );
}
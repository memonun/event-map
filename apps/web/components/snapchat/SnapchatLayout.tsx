'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { EventDetailModal } from '../map/event-detail-modal';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

interface SnapchatLayoutProps {
  mapboxAccessToken: string;
}

export function SnapchatLayout({ mapboxAccessToken }: SnapchatLayoutProps) {
  const [searchFilters, setSearchFilters] = useState<EventSearchParams>({});
  const [selectedVenue, setSelectedVenue] = useState<CanonicalVenue | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<EventWithVenue[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithVenue | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

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

  // Handle event click to open detail modal
  const handleEventClick = useCallback((event: EventWithVenue) => {
    console.log('Event clicked:', event.name);

    // Automatically open right panel when individual event is clicked
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }

    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, [isRightPanelOpen]);

  // Handle event modal close
  const handleEventModalClose = useCallback(() => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  }, []);

  // Handle right panel toggle
  const handleRightPanelToggle = useCallback(() => {
    setIsRightPanelOpen(prev => !prev);
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
          isRightPanelOpen={isRightPanelOpen}
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
                <RightPanel
                  selectedVenue={selectedVenue}
                  selectedEvents={selectedEvents}
                  onEventClick={handleEventClick}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleEventModalClose}
      />
    </div>
  );
}
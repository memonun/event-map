'use client';

import React, { useState } from 'react';
import { ContainedMap } from './ContainedMap';
import { VerticalToolbar } from './VerticalToolbar';
import { FloatingActionButton } from './FloatingActionButton';
import { SnapchatSearch } from './SnapchatSearch';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

interface LeftPanelProps {
  mapboxAccessToken: string;
  searchParams: EventSearchParams;
  onFiltersChange: (filters: EventSearchParams) => void;
  onVenueSelect: (venue: CanonicalVenue, events: EventWithVenue[]) => void;
  onEventClick: (event: EventWithVenue) => void;
  onRightPanelToggle?: () => void;
  onProfileOpen?: () => void;
  onPeopleOpen?: () => void;
  onHomeClick?: () => void;
  isRightPanelOpen?: boolean;
  onMapBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onLocationEventsUpdate?: (events: EventWithVenue[], loading?: boolean) => void;
  mapRef?: React.RefObject<any>;
}

export function LeftPanel({
  mapboxAccessToken,
  searchParams,
  onFiltersChange,
  onVenueSelect,
  onEventClick,
  onRightPanelToggle,
  onProfileOpen,
  onPeopleOpen,
  onHomeClick,
  isRightPanelOpen = true,
  onMapBoundsChange,
  onLocationEventsUpdate,
  mapRef
}: LeftPanelProps) {
  const [activeToolbarItem, setActiveToolbarItem] = useState('home');

  const handleToolbarItemChange = (item: string) => {
    setActiveToolbarItem(item);

    // Handle navigation for specific toolbar items
    if (item === 'home' && onHomeClick) {
      onHomeClick();
    } else if (item === 'profile' && onProfileOpen) {
      onProfileOpen();
    } else if (item === 'people' && onPeopleOpen) {
      onPeopleOpen();
    }
    // Note: venues and events are now accessible through the tabbed right panel
  };

  return (
    <div className="relative h-full bg-white">
      {/* Search Bar at Top */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex gap-2">
          <div className="flex-1">
            <SnapchatSearch
              onFiltersChange={onFiltersChange}
              initialFilters={searchParams}
            />
          </div>

          {/* Photo Panel Toggle Button (Mobile/Desktop) */}
          {onRightPanelToggle && (
            <button
              onClick={onRightPanelToggle}
              className="flex-shrink-0 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-200"
              title={isRightPanelOpen ? 'Close photo panel' : 'Open photo panel'}
            >
              {isRightPanelOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Vertical Toolbar on Left */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <VerticalToolbar
          activeItem={activeToolbarItem}
          onItemChange={handleToolbarItemChange}
        />
      </div>

      {/* Map Container */}
      <div className="h-full">
        <ContainedMap
          mapboxAccessToken={mapboxAccessToken}
          searchParams={searchParams}
          onVenueSelect={onVenueSelect}
          onEventClick={onEventClick}
          isRightPanelOpen={isRightPanelOpen}
          onMapBoundsChange={onMapBoundsChange}
          onLocationEventsUpdate={onLocationEventsUpdate}
          mapRef={mapRef}
        />
      </div>

      {/* Floating Action Button at Bottom Left */}
      <div className="absolute bottom-6 left-6 z-20">
        <FloatingActionButton />
      </div>
    </div>
  );
}
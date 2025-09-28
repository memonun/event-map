'use client';

import React, { useState, useEffect } from 'react';
import { EventDetailPanel } from './EventDetailPanel';
import { EventListView } from './EventListView';
import { ProfilePanel } from './ProfilePanel';
import { VenuesListPanel } from './VenuesListPanel';
import { VenueDetailPanel } from './VenueDetailPanel';
import type { EventWithVenue, CanonicalVenue } from '@/lib/types';

interface RightPanelProps {
  selectedVenue: CanonicalVenue | null;
  selectedEvents: EventWithVenue[];
  onEventClick: (event: EventWithVenue) => void;
  showProfile?: boolean;
  onProfileClose?: () => void;
  showVenues?: boolean;
  onVenuesClose?: () => void;
  nearbyVenues?: CanonicalVenue[];
  selectedVenueForEvents?: CanonicalVenue | null;
  onVenueSelectForEvents?: (venue: CanonicalVenue) => void;
  onBackToVenuesList?: () => void;
}

export function RightPanel({
  selectedVenue,
  selectedEvents,
  onEventClick,
  showProfile,
  onProfileClose,
  showVenues,
  onVenuesClose,
  nearbyVenues = [],
  selectedVenueForEvents,
  onVenueSelectForEvents,
  onBackToVenuesList
}: RightPanelProps) {
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventWithVenue | null>(null);
  const [showListView, setShowListView] = useState(false);

  // Reset states when selectedEvents changes
  useEffect(() => {
    setSelectedEventForDetail(null);
    setShowListView(selectedEvents.length > 1);
  }, [selectedEvents]);

  // Handle event selection from list view
  const handleEventSelect = (event: EventWithVenue) => {
    setSelectedEventForDetail(event);
    setShowListView(false);
  };

  // Handle back to list from detail view
  const handleBackToList = () => {
    setSelectedEventForDetail(null);
    setShowListView(true);
  };

  // Handle profile back action
  const handleProfileBack = () => {
    if (onProfileClose) {
      onProfileClose();
    }
  };

  // Determine what to show
  const shouldShowProfile = showProfile;
  const shouldShowVenues = showVenues;
  const shouldShowListView = !showProfile && !showVenues && showListView && selectedEvents.length > 1 && !selectedEventForDetail;
  const shouldShowDetailView = !showProfile && !showVenues && (selectedEventForDetail || selectedEvents.length === 1) && !shouldShowListView;

  return (
    <div className="h-full w-full">
      {shouldShowProfile && (
        <ProfilePanel onBack={handleProfileBack} />
      )}

      {shouldShowVenues && (
        <div className="h-full">
          {!selectedVenueForEvents ? (
            <VenuesListPanel
              onBack={() => onVenuesClose && onVenuesClose()}
              nearbyVenues={nearbyVenues}
              onVenueSelect={(venue) => onVenueSelectForEvents && onVenueSelectForEvents(venue)}
            />
          ) : (
            <VenueDetailPanel
              venue={selectedVenueForEvents}
              onBack={() => onBackToVenuesList && onBackToVenuesList()}
              onEventClick={onEventClick}
            />
          )}
        </div>
      )}

      {shouldShowListView && (
        <EventListView
          selectedVenue={selectedVenue}
          selectedEvents={selectedEvents}
          onEventSelect={handleEventSelect}
        />
      )}

      {shouldShowDetailView && (
        <EventDetailPanel
          selectedVenue={selectedVenue}
          selectedEvents={selectedEventForDetail ? [selectedEventForDetail] : selectedEvents}
          onEventClick={onEventClick}
          onBackToList={selectedEvents.length > 1 ? handleBackToList : undefined}
        />
      )}
    </div>
  );
}


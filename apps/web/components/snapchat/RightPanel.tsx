'use client';

import React, { useState, useEffect } from 'react';
import { EventDetailPanel } from './EventDetailPanel';
import { EventListView } from './EventListView';
import type { EventWithVenue, CanonicalVenue } from '@/lib/types';

interface RightPanelProps {
  selectedVenue: CanonicalVenue | null;
  selectedEvents: EventWithVenue[];
  onEventClick: (event: EventWithVenue) => void;
}

export function RightPanel({ selectedVenue, selectedEvents, onEventClick }: RightPanelProps) {
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

  // Determine what to show
  const shouldShowListView = showListView && selectedEvents.length > 1 && !selectedEventForDetail;
  const shouldShowDetailView = (selectedEventForDetail || selectedEvents.length === 1) && !shouldShowListView;

  return (
    <div className="h-full w-full">
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


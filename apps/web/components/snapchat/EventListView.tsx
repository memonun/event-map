'use client';

import React from 'react';
import type { EventWithVenue, CanonicalVenue } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  ChevronRight,
  Users
} from 'lucide-react';

interface EventListViewProps {
  selectedVenue: CanonicalVenue | null;
  selectedEvents: EventWithVenue[];
  onEventSelect: (event: EventWithVenue) => void;
}

export function EventListView({ selectedVenue, selectedEvents, onEventSelect }: EventListViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getRandomPrice = () => {
    return Math.floor(Math.random() * 200) + 50;
  };

  if (selectedEvents.length === 0) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-6">
        <div className="text-center text-zinc-500">
          <Music className="w-16 h-16 mx-auto mb-6 opacity-40" />
          <h3 className="text-xl font-medium mb-3 text-zinc-300">No Events Found</h3>
          <p className="text-sm leading-relaxed">Click on an event marker to explore events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-800 p-6 z-10">
        <div className="flex items-center gap-3 text-zinc-400 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>{selectedVenue?.city || 'Multiple Locations'}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {selectedVenue?.name || 'Events in Area'}
        </h1>
        <p className="text-zinc-400 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'} available
        </p>
      </div>

      {/* Events List */}
      <div className="p-6 space-y-4">
        {selectedEvents.map((event, index) => (
          <button
            key={event.id}
            onClick={() => onEventSelect(event)}
            className="w-full text-left bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 group"
          >
            {/* Event Image and Info */}
            <div className="flex gap-4">
              {/* Event Image */}
              <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-zinc-800">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-yellow-400 transition-colors">
                    {event.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
                </div>

                {/* Artist */}
                {event.artist && event.artist.length > 0 && (
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-1">
                    {event.artist.join(', ')}
                  </p>
                )}

                {/* Date and Time */}
                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(event.date)}</span>
                  </div>
                </div>

                {/* Genre and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.genre && (
                      <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full">
                        {event.genre}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">From</div>
                    <div className="text-lg font-bold text-white">₺{getRandomPrice()}</div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-6 pt-0">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-400 text-sm">
            Tap any event to view detailed information, artist links, and purchase tickets
          </p>
        </div>
      </div>
    </div>
  );
}
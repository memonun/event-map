'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Calendar, Clock, Music, ExternalLink, Loader } from 'lucide-react';
import type { CanonicalVenue, EventWithVenue } from '@/lib/types';

interface VenueDetailPanelProps {
  venue: CanonicalVenue;
  onBack: () => void;
  onEventClick: (event: EventWithVenue) => void;
}

export function VenueDetailPanel({ venue, onBack, onEventClick }: VenueDetailPanelProps) {
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'info'>('upcoming');

  useEffect(() => {
    fetchVenueEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue.id]);

  const fetchVenueEvents = async () => {
    try {
      const response = await fetch(`/api/venues/${venue.id}/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching venue events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full bg-black text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-800 p-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{venue.name}</h1>
            {venue.city && (
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <MapPin className="w-4 h-4" />
                <span>{venue.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[88px] bg-black/95 backdrop-blur-md border-b border-zinc-800 px-6 py-3 z-10">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-yellow-400 text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'info'
                ? 'bg-yellow-400 text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Venue Info
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'upcoming' ? (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-4" />
                  <p className="text-zinc-400">Loading events...</p>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium text-white mb-2">No upcoming events</h3>
                <p className="text-zinc-400">This venue doesn&apos;t have any upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {events.length} Upcoming Events
                </h2>
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      console.log('VenueDetailPanel: Event clicked', event.name);
                      onEventClick(event);
                    }}
                    className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.date)}</span>
                          </div>
                        </div>

                        {event.artist && event.artist.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-yellow-400 mb-2">
                            <Music className="w-4 h-4" />
                            <span>{event.artist.join(', ')}</span>
                          </div>
                        )}

                        {event.genre && (
                          <div className="inline-block bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full text-xs">
                            {event.genre}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <ExternalLink className="w-5 h-5 text-zinc-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Venue Information</h2>

            <div className="space-y-4">
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-medium mb-3">Details</h3>
                <div className="space-y-2">
                  {venue.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">{venue.city}</span>
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">{venue.capacity.toLocaleString()} capacity</span>
                    </div>
                  )}
                </div>
              </div>

              {venue.coordinates && (
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <h3 className="text-white font-medium mb-3">Location</h3>
                  <div className="text-zinc-300 text-sm">
                    <p>Latitude: {venue.coordinates.lat || venue.coordinates.latitude}</p>
                    <p>Longitude: {venue.coordinates.lng || venue.coordinates.longitude}</p>
                  </div>
                </div>
              )}

              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-white font-medium mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{events.length}</div>
                    <div className="text-xs text-zinc-400">Upcoming Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {venue.capacity ? Math.round(venue.capacity / 1000) + 'K' : '-'}
                    </div>
                    <div className="text-xs text-zinc-400">Capacity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
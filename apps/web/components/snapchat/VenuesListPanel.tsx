'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Navigation, Loader } from 'lucide-react';
import type { CanonicalVenue } from '@/lib/types';

interface VenuesListPanelProps {
  onBack: () => void;
  nearbyVenues: CanonicalVenue[];
  onVenueSelect: (venue: CanonicalVenue) => void;
}

interface VenueWithEventCount extends CanonicalVenue {
  event_count: number;
  distance?: number;
}

export function VenuesListPanel({ onBack, onVenueSelect }: VenuesListPanelProps) {
  const [venues, setVenues] = useState<VenueWithEventCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchNearbyVenues();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNearbyVenues = async () => {
    try {
      // Use Beşiktaş, Istanbul coordinates as default location
      const besiktasCoords = {
        lat: 41.0422,
        lng: 29.0061
      };
      setUserLocation(besiktasCoords);
      await fetchVenuesWithLocation(besiktasCoords);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setLoading(false);
    }
  };

  const fetchVenuesWithLocation = async (coords: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`/api/venues/nearby?lat=${coords.lat}&lng=${coords.lng}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues || []);
      }
    } catch (error) {
      console.error('Error fetching nearby venues:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
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
          <div>
            <h1 className="text-xl font-bold text-white">Events Near You</h1>
            <p className="text-sm text-zinc-400">
              {userLocation ? 'Near Beşiktaş, Istanbul' : 'Popular venues in Turkey'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-4" />
              <p className="text-zinc-400">Finding venues near you...</p>
            </div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-medium text-white mb-2">No venues found</h3>
            <p className="text-zinc-400">We couldn&apos;t find any venues in your area.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {venues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => onVenueSelect(venue)}
                className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{venue.name}</h3>

                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                      {venue.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{venue.city}</span>
                        </div>
                      )}

                      {venue.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{venue.capacity.toLocaleString()} capacity</span>
                        </div>
                      )}

                      {venue.distance && (
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          <span>{formatDistance(venue.distance)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {venue.event_count || 0} events
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
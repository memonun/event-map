'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Map as MapboxMap, 
  Marker, 
  NavigationControl, 
  GeolocateControl
} from 'react-map-gl/mapbox';
import type { MapRef, ViewState } from 'react-map-gl/mapbox';
import { ClientEventsService } from '@/lib/services/client';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

// Import Mapbox GL CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface SmartClusterMapProps {
  mapboxAccessToken: string;
  searchParams?: EventSearchParams;
  onVenueSelect?: (venue: CanonicalVenue, events: EventWithVenue[]) => void;
  className?: string;
}

interface CityCluster {
  city: string;
  lat: number;
  lng: number;
  eventCount: number;
  venues: VenueCluster[];
}

interface VenueCluster {
  venue: CanonicalVenue;
  events: EventWithVenue[];
  eventCount: number;
}

const TURKEY_CENTER = {
  latitude: 39.0,
  longitude: 35.0,
  zoom: 6
};

export function SmartClusterMap({ 
  mapboxAccessToken, 
  searchParams = {}, 
  onVenueSelect,
  className = "w-full h-full"
}: SmartClusterMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(TURKEY_CENTER);
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(false);

  // Load events from database with filters applied
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading events for smart cluster map with filters:', searchParams);
      
      // Use searchEvents to respect filters, but get more results for better map display
      const eventsResponse = await ClientEventsService.searchEvents({
        ...searchParams,
        limit: 1000, // Get plenty of events for map clustering
        offset: 0
      });
      
      console.log('Loaded filtered events:', eventsResponse.events.length);
      setEvents(eventsResponse.events);
    } catch (error) {
      console.error('Error loading events:', error);
      // Don't use fallback that ignores filters - better to show no events than wrong events
      setEvents([]);
      // TODO: Show error toast to user
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Load events on mount and when search parameters change
  // loadEvents already depends on searchParams, so it will reload when they change
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Process events into clusters based on zoom level
  const { cityClusters, venueMarkers } = useMemo(() => {
    const zoom = viewState.zoom;
    
    // City-level clustering (zoom 5-9)
    if (zoom <= 9) {
      const cityMap = new Map<string, CityCluster>();
      
      events.forEach(event => {
        if (!event.venue.coordinates) return;
        
        const city = event.venue.city;
        if (!city) return;
        
        if (!cityMap.has(city)) {
          cityMap.set(city, {
            city,
            lat: event.venue.coordinates.lat,
            lng: event.venue.coordinates.lng,
            eventCount: 0,
            venues: []
          });
        }
        
        const cityCluster = cityMap.get(city)!;
        cityCluster.eventCount++;
        
        // Find or create venue in city cluster
        let venueCluster = cityCluster.venues.find(v => v.venue.id === event.venue.id);
        if (!venueCluster) {
          venueCluster = {
            venue: event.venue,
            events: [],
            eventCount: 0
          };
          cityCluster.venues.push(venueCluster);
        }
        venueCluster.events.push(event);
        venueCluster.eventCount++;
      });

      return {
        cityClusters: Array.from(cityMap.values()),
        venueMarkers: []
      };
    }

    // Major venues only (zoom 10-11)
    else if (zoom <= 11) {
      const venueMap = new Map<string, VenueCluster>();
      
      events.forEach(event => {
        if (!event.venue.coordinates) return;
        
        const venueId = event.venue.id;
        if (!venueMap.has(venueId)) {
          venueMap.set(venueId, {
            venue: event.venue,
            events: [],
            eventCount: 0
          });
        }
        
        const venueCluster = venueMap.get(venueId)!;
        venueCluster.events.push(event);
        venueCluster.eventCount++;
      });

      // Filter to venues with 2+ events (lower threshold for better visibility)
      const majorVenues = Array.from(venueMap.values()).filter(v => v.eventCount >= 2);
      
      return {
        cityClusters: [],
        venueMarkers: majorVenues
      };
    }

    // All venues (zoom 12+)
    else {
      const venueMap = new Map<string, VenueCluster>();
      
      events.forEach(event => {
        if (!event.venue.coordinates) return;
        
        const venueId = event.venue.id;
        if (!venueMap.has(venueId)) {
          venueMap.set(venueId, {
            venue: event.venue,
            events: [],
            eventCount: 0
          });
        }
        
        const venueCluster = venueMap.get(venueId)!;
        venueCluster.events.push(event);
        venueCluster.eventCount++;
      });

      return {
        cityClusters: [],
        venueMarkers: Array.from(venueMap.values())
      };
    }
  }, [events, viewState.zoom]);

  // Handle city click (zoom to city)
  const handleCityClick = useCallback((cityCluster: CityCluster) => {
    setViewState({
      latitude: cityCluster.lat,
      longitude: cityCluster.lng,
      zoom: 12
    });
  }, []);

  // Handle venue click
  const handleVenueClick = useCallback((venueCluster: VenueCluster) => {
    onVenueSelect?.(venueCluster.venue, venueCluster.events);
  }, [onVenueSelect]);

  // Handle map move
  const handleMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  return (
    <div className={className}>
      <MapboxMap
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
        maxZoom={18}
        minZoom={5}
      >
        {/* Navigation controls */}
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation={false}
        />

        {/* City Clusters */}
        {cityClusters.map((cityCluster) => (
          <Marker
            key={`city-${cityCluster.city}`}
            latitude={cityCluster.lat}
            longitude={cityCluster.lng}
          >
            <div
              className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
              onClick={() => handleCityClick(cityCluster)}
            >
              <div className="bg-blue-600 text-white rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold min-w-16 h-16 px-3">
                <div className="text-center">
                  <div className="text-lg leading-tight">{cityCluster.eventCount}</div>
                  <div className="text-xs leading-tight opacity-90">{cityCluster.city}</div>
                </div>
              </div>
            </div>
          </Marker>
        ))}

        {/* Venue Markers */}
        {venueMarkers.map((venueCluster) => {
          // Activity-based color and size - LARGER sizes for better visibility
          const getMarkerStyle = (eventCount: number) => {
            if (eventCount >= 10) {
              return {
                bgColor: 'bg-red-700', // Dark red for highest activity
                size: 'w-16 h-16',
                textSize: 'text-lg font-bold',
                borderWidth: 'border-4'
              };
            } else if (eventCount >= 5) {
              return {
                bgColor: 'bg-red-500', // Red for high activity
                size: 'w-14 h-14',
                textSize: 'text-base font-bold',
                borderWidth: 'border-3'
              };
            } else if (eventCount >= 2) {
              return {
                bgColor: 'bg-orange-500', // Orange for medium activity
                size: 'w-12 h-12',
                textSize: 'text-sm font-semibold',
                borderWidth: 'border-3'
              };
            } else {
              return {
                bgColor: 'bg-gray-500', // Darker gray for better visibility
                size: 'w-10 h-10',
                textSize: 'text-sm font-semibold',
                borderWidth: 'border-2'
              };
            }
          };
          
          const style = getMarkerStyle(venueCluster.eventCount);
          
          return (
            <Marker
              key={`venue-${venueCluster.venue.id}`}
              latitude={venueCluster.venue.coordinates!.lat}
              longitude={venueCluster.venue.coordinates!.lng}
            >
              <div
                className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
                onClick={() => handleVenueClick(venueCluster)}
              >
                <div className={`
                  ${style.bgColor} 
                  text-white rounded-full ${style.borderWidth} border-white shadow-lg 
                  flex items-center justify-center font-bold
                  ${style.size}
                `}>
                  <span className={style.textSize}>
                    {venueCluster.eventCount}
                  </span>
                </div>
              </div>
            </Marker>
          );
        })}
      </MapboxMap>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Etkinlikler yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
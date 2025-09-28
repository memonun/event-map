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
import { SimpleMarkerPin, getSimpleMarkerConfig } from './simple-marker-pin';
import { useMarkerCollision, convertToMarkers } from '@/lib/hooks/use-marker-collision';

// Import Mapbox GL CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface UserLocation {
  lat: number;
  lng: number;
}

interface SmartClusterMapProps {
  mapboxAccessToken: string;
  searchParams?: EventSearchParams;
  onVenueSelect?: (venue: CanonicalVenue, events: EventWithVenue[]) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onLocationEventsUpdate?: (events: EventWithVenue[], loading?: boolean) => void;
  userLocation?: UserLocation | null;
  isRightPanelOpen?: boolean;
  className?: string;
  mapRef?: React.RefObject<MapRef>;
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
  searchParams: _searchParams = {},
  onVenueSelect,
  onBoundsChange,
  onLocationEventsUpdate,
  userLocation,
  isRightPanelOpen = false,
  className = "w-full h-full",
  mapRef: externalMapRef
}: SmartClusterMapProps) {
  const internalMapRef = useRef<MapRef>(null);
  const mapRef = externalMapRef || internalMapRef;

  // Initialize viewState based on user location or fallback to Turkey center
  const [viewState, setViewState] = useState(() => {
    if (userLocation) {
      return {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 12
      };
    }
    return TURKEY_CENTER;
  });

  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(false);

  // Update viewState when userLocation changes
  useEffect(() => {
    if (userLocation) {
      setViewState({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 12
      });
    }
  }, [userLocation]);

  // Calculate visible map bounds considering right panel
  const getVisibleBounds = useCallback(() => {
    if (!mapRef.current) return null;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();

    const baseBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    // If right panel is open, adjust eastern boundary to show only 55% of map width
    if (isRightPanelOpen) {
      const longitudeRange = baseBounds.east - baseBounds.west;
      return {
        ...baseBounds,
        east: baseBounds.west + (longitudeRange * 0.55)
      };
    }

    return baseBounds;
  }, [isRightPanelOpen]);

  // Load events based on visible map bounds
  const loadEventsInBounds = useCallback(async () => {
    const bounds = getVisibleBounds();
    if (!bounds) return;

    setLoading(true);
    // Notify parent that events are loading
    if (onLocationEventsUpdate) {
      onLocationEventsUpdate([], true);
    }

    try {
      console.log('Loading events in bounds:', bounds);

      const events = await ClientEventsService.getEventsInBounds(bounds, 1000);
      console.log('Loaded events in bounds:', events.length);
      setEvents(events);

      // Notify parent with loaded events
      if (onLocationEventsUpdate) {
        onLocationEventsUpdate(events, false);
      }
    } catch (error) {
      console.error('Error loading events in bounds:', error);
      setEvents([]);

      // Notify parent with empty array on error
      if (onLocationEventsUpdate) {
        onLocationEventsUpdate([], false);
      }
    } finally {
      setLoading(false);
    }
  }, [getVisibleBounds, onLocationEventsUpdate]);

  // Load events when map bounds change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEventsInBounds();

      // Emit bounds change for external listeners (e.g., events feed)
      if (onBoundsChange) {
        const bounds = getVisibleBounds();
        if (bounds) {
          console.log('🚀 SmartClusterMap: Emitting bounds change to parent:', bounds);
          onBoundsChange(bounds);
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [loadEventsInBounds, getVisibleBounds, onBoundsChange, viewState, isRightPanelOpen]);

  // Process events into clusters based on zoom level
  const { cityClusters, venueMarkers, markerData } = useMemo(() => {
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
        venueMarkers: [],
        markerData: []
      };
    }

    // Venue-level clustering (zoom 10+)
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

      const venues = Array.from(venueMap.values());
      
      return {
        cityClusters: [],
        venueMarkers: venues,
        markerData: convertToMarkers(venues)
      };
    }
  }, [events, viewState.zoom]);

  // Use collision detection for venue markers
  const positionedMarkers = useMarkerCollision(markerData, viewState.zoom);

  // Handle city click (zoom to city and show venues)
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

        {/* Simple Venue Markers */}
        {positionedMarkers.map((marker) => {
          const markerConfig = getSimpleMarkerConfig(marker.eventCount);
          
          // Find the corresponding venue cluster for click handling
          const venueCluster = venueMarkers.find(v => v.venue.id === marker.id);
          
          return (
            <Marker
              key={`marker-${marker.id}`}
              latitude={marker.lat}
              longitude={marker.lng}
            >
              <SimpleMarkerPin
                eventCount={marker.eventCount}
                priority={markerConfig.priority}
                onClick={() => venueCluster && handleVenueClick(venueCluster)}
                className="z-10"
              />
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
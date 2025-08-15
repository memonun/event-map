'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl,
  MapRef,
  ViewStateChangeEvent
} from 'react-map-gl';
import { useSuperCluster } from 'use-supercluster';
import { MapPin, Calendar, MapIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { EventWithVenue, MapBounds } from '@/lib/types';

interface EventMapProps {
  events: EventWithVenue[];
  initialViewState?: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  onBoundsChange?: (bounds: MapBounds) => void;
  onEventClick?: (event: EventWithVenue) => void;
  className?: string;
  style?: React.CSSProperties;
  mapboxAccessToken: string;
}

interface ClusterPoint {
  type: 'Feature';
  properties: {
    cluster: boolean;
    event?: EventWithVenue;
    point_count?: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const ISTANBUL_CENTER = {
  latitude: 41.0082,
  longitude: 28.9784,
  zoom: 10
};

export function EventMap({
  events,
  initialViewState = ISTANBUL_CENTER,
  onBoundsChange,
  onEventClick,
  className = "w-full h-full",
  style,
  mapboxAccessToken
}: EventMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(initialViewState);
  const [selectedEvent, setSelectedEvent] = useState<EventWithVenue | null>(null);

  // Convert events to GeoJSON points for clustering
  const points = useMemo<ClusterPoint[]>(() => {
    return events
      .filter(event => event.venue.coordinates)
      .map(event => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          event
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            event.venue.coordinates!.lng,
            event.venue.coordinates!.lat
          ]
        }
      }));
  }, [events]);

  // Get map bounds for clustering
  const bounds = useMemo(() => {
    if (!mapRef.current) return [-180, -85, 180, 85];
    
    const map = mapRef.current.getMap();
    const mapBounds = map.getBounds();
    
    return [
      mapBounds.getWest(),
      mapBounds.getSouth(),
      mapBounds.getEast(),
      mapBounds.getNorth()
    ] as [number, number, number, number];
  }, [viewState]);

  // Set up clustering
  const { clusters, supercluster } = useSuperCluster({
    points,
    bounds,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 16 }
  });

  // Handle cluster click to zoom in
  const handleClusterClick = useCallback((clusterId: number, longitude: number, latitude: number) => {
    if (!supercluster) return;
    
    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(clusterId),
      16
    );
    
    setViewState(prev => ({
      ...prev,
      latitude,
      longitude,
      zoom: expansionZoom
    }));
  }, [supercluster]);

  // Handle individual event click
  const handleEventClick = useCallback((event: EventWithVenue) => {
    setSelectedEvent(event);
    onEventClick?.(event);
  }, [onEventClick]);

  // Handle map move to update bounds
  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
    
    if (onBoundsChange && mapRef.current) {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();
      
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    }
  }, [onBoundsChange]);

  // Format price display
  const formatPrice = (prices: any[] = []) => {
    if (!prices.length) return 'Fiyat bilgisi yok';
    
    const minPrice = Math.min(...prices.map((p: any) => p.price));
    const maxPrice = Math.max(...prices.map((p: any) => p.price));
    
    if (minPrice === maxPrice) {
      return `${minPrice}₺`;
    }
    
    return `${minPrice}₺ - ${maxPrice}₺`;
  };

  return (
    <div className={className} style={style}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        maxZoom={16}
        minZoom={3}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserHeading={true}
        />

        {/* Render clusters and individual events */}
        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount, event } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="cluster-marker"
                  style={{
                    width: `${10 + (pointCount as number / points.length) * 40}px`,
                    height: `${10 + (pointCount as number / points.length) * 40}px`,
                  }}
                  onClick={() => handleClusterClick(cluster.id as number, longitude, latitude)}
                >
                  <div className="cluster-marker-inner">
                    {pointCount}
                  </div>
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={`event-${event!.id}`}
              latitude={latitude}
              longitude={longitude}
            >
              <div
                className="event-marker"
                onClick={() => handleEventClick(event!)}
              >
                <MapPin className="w-6 h-6 text-blue-600 fill-blue-100" />
              </div>
            </Marker>
          );
        })}

        {/* Event popup */}
        {selectedEvent && selectedEvent.venue.coordinates && (
          <Popup
            latitude={selectedEvent.venue.coordinates.lat}
            longitude={selectedEvent.venue.coordinates.lng}
            onClose={() => setSelectedEvent(null)}
            closeButton={true}
            closeOnClick={false}
            className="event-popup"
          >
            <div className="p-4 max-w-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                {selectedEvent.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  <span>{selectedEvent.venue.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(selectedEvent.date), 'dd.MM.yyyy HH:mm')}</span>
                </div>
                
                {selectedEvent.venue.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Kapasite: {selectedEvent.venue.capacity}</span>
                  </div>
                )}
                
                {selectedEvent.genre && (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                    <span>{selectedEvent.genre}</span>
                  </div>
                )}
                
                {selectedEvent.artist && selectedEvent.artist.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Sanatçılar:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEvent.artist.slice(0, 3).map((artist, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {artist}
                        </span>
                      ))}
                      {selectedEvent.artist.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{selectedEvent.artist.length - 3} daha
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedEvent.providers && selectedEvent.providers.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Satış platformları:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEvent.providers.map((platform, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <style jsx>{`
        .cluster-marker {
          background: #51bbd6;
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        
        .cluster-marker:hover {
          transform: scale(1.1);
        }
        
        .cluster-marker-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        .event-marker {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .event-marker:hover {
          transform: scale(1.2);
        }
        
        .mapboxgl-popup-content {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
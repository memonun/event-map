'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SmartClusterMap } from '@/components/map/smart-cluster-map';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

interface UserLocation {
  lat: number;
  lng: number;
}

interface ContainedMapProps {
  mapboxAccessToken: string;
  searchParams: EventSearchParams;
  onVenueSelect: (venue: CanonicalVenue, events: EventWithVenue[]) => void;
  onEventClick?: (event: EventWithVenue) => void;
  isRightPanelOpen?: boolean;
  onMapBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onLocationEventsUpdate?: (events: EventWithVenue[], loading?: boolean) => void;
  mapRef?: React.RefObject<any>;
}

export function ContainedMap({
  mapboxAccessToken,
  searchParams,
  onVenueSelect,
  onEventClick: _onEventClick,
  isRightPanelOpen = true,
  onMapBoundsChange,
  onLocationEventsUpdate,
  mapRef
}: ContainedMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's current location
  const getUserLocation = useCallback(async () => {
    // Turkish major cities as fallback options
    const fallbackLocations = {
      istanbul: { lat: 41.0082, lng: 28.9784 },
      ankara: { lat: 39.9334, lng: 32.8597 },
      izmir: { lat: 38.4192, lng: 27.1287 }
    };
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      // Fallback to Istanbul
      setUserLocation(fallbackLocations.istanbul);
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          }
        );
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setUserLocation(location);
      console.log('User location obtained:', location);
    } catch (error) {
      console.error('Error getting user location:', error);

      // Handle different error types
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
        }
      } else {
        setLocationError('Unable to get location');
      }

      // Fallback to Istanbul when location fails
      setUserLocation(fallbackLocations.istanbul);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return (
    <div ref={mapContainerRef} className="w-full h-full relative">
      {/* Map Container */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <SmartClusterMap
          mapboxAccessToken={mapboxAccessToken}
          searchParams={searchParams}
          onVenueSelect={onVenueSelect}
          onBoundsChange={onMapBoundsChange}
          onLocationEventsUpdate={onLocationEventsUpdate}
          userLocation={userLocation}
          isRightPanelOpen={isRightPanelOpen}
          className="w-full h-full"
          mapRef={mapRef}
        />
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex flex-col gap-2">
          {/* Zoom Controls */}
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-white/20">
            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 font-bold text-lg">
              +
            </button>
            <div className="h-px bg-gray-200"></div>
            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 font-bold text-lg">
              −
            </button>
          </div>

          {/* Locate Me Button */}
          <button
            onClick={getUserLocation}
            disabled={locationLoading}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-white/20 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title={locationError || 'Get my location'}
          >
            {locationLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md text-white text-sm px-3 py-2 rounded-lg shadow-md">
          {locationError}
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-10">
        <div className="bg-black/20 backdrop-blur-md rounded px-2 py-1 text-xs text-white/80">
          © Mapbox
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useRef } from 'react';
import { SmartClusterMap } from '@/components/map/smart-cluster-map';
import type { EventWithVenue, EventSearchParams, CanonicalVenue } from '@/lib/types';

interface ContainedMapProps {
  mapboxAccessToken: string;
  searchParams: EventSearchParams;
  onVenueSelect: (venue: CanonicalVenue, events: EventWithVenue[]) => void;
  onEventClick: (event: EventWithVenue) => void;
  isRightPanelOpen?: boolean;
}

export function ContainedMap({
  mapboxAccessToken,
  searchParams,
  onVenueSelect,
  onEventClick,
  isRightPanelOpen = true
}: ContainedMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Note: Map no longer needs to resize as it always fills full container

  return (
    <div ref={mapContainerRef} className="w-full h-full relative">
      {/* Map Container */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <SmartClusterMap
          mapboxAccessToken={mapboxAccessToken}
          searchParams={searchParams}
          onVenueSelect={onVenueSelect}
          className="w-full h-full"
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
          <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-white/20 flex items-center justify-center text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-10">
        <div className="bg-black/20 backdrop-blur-md rounded px-2 py-1 text-xs text-white/80">
          © Mapbox
        </div>
      </div>
    </div>
  );
}
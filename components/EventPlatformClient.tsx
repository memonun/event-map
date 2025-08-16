'use client';

import React, { useState, useCallback } from 'react';
import { EventMapContainer } from "@/components/map";
import { EventList, EventFilters } from "@/components/events";
import { SupabaseTest } from "@/components/debug/supabase-test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapIcon, List } from "lucide-react";
import type { EventWithVenue, EventSearchParams } from '@/lib/types';

interface EventPlatformClientProps {
  mapboxAccessToken?: string;
  initialEvents?: EventWithVenue[];
}

export function EventPlatformClient({ 
  mapboxAccessToken,
  initialEvents = []
}: EventPlatformClientProps) {
  const [, setSelectedEvent] = useState<EventWithVenue | null>(null);
  const [searchFilters, setSearchFilters] = useState<EventSearchParams>({});

  // Handle event selection from map or list
  const handleEventSelect = useCallback((event: EventWithVenue) => {
    setSelectedEvent(event);
    console.log('Event selected:', event);
    // TODO: Implement event detail modal or navigation
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters: EventSearchParams) => {
    setSearchFilters(filters);
    console.log('Filters changed:', filters);
  }, []);

  return (
    <div className="h-full">
      <Tabs defaultValue="map" className="h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="border-b bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <TabsList className="grid w-full max-w-lg grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="map" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <MapIcon className="w-4 h-4" />
                Harita Görünümü
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <List className="w-4 h-4" />
                Liste Görünümü
              </TabsTrigger>
              <TabsTrigger 
                value="debug" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                🔧 Debug
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Map View */}
        <TabsContent value="map" className="flex-1 m-0">
          <div className="h-[calc(100vh-8rem)]">
            {mapboxAccessToken ? (
              <EventMapContainer
                mapboxAccessToken={mapboxAccessToken}
                onEventSelect={handleEventSelect}
                searchParams={searchFilters}
                initialEvents={initialEvents}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                  <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Harita Görünümü
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Harita görünümünü kullanmak için Mapbox access token&apos;ınızı 
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm mx-1">
                      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                    </code>
                    environment variable&apos;ına ekleyin.
                  </p>
                  <a
                    href="https://docs.mapbox.com/help/getting-started/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Mapbox token nasıl alınır?
                  </a>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="flex-1 m-0">
          <div className="max-w-7xl mx-auto p-4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Türkiye&apos;deki Tüm Etkinlikler
              </h1>
              <p className="text-gray-600">
                5 büyük bilet platformundan toplanan 5,240+ etkinlik
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8">
              <EventFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={searchFilters}
              />
            </div>

            {/* Event List */}
            <EventList
              searchParams={searchFilters}
              onEventSelect={handleEventSelect}
              initialEvents={initialEvents}
            />
          </div>
        </TabsContent>

        {/* Debug View */}
        <TabsContent value="debug" className="flex-1 m-0">
          <div className="max-w-7xl mx-auto p-4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Database Connection Test
              </h1>
              <p className="text-gray-600">
                Test your Supabase connection and database setup
              </p>
            </div>
            <SupabaseTest />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
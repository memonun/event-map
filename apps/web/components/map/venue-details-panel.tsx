'use client';

import React from 'react';
import { X, MapPin, Users, Calendar, Clock, Star, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { EventWithVenue, CanonicalVenue } from '@/lib/types';

interface VenueDetailsPanelProps {
  venue: CanonicalVenue | null;
  events: EventWithVenue[];
  isOpen: boolean;
  onClose: () => void;
}

export function VenueDetailsPanel({ venue, events, isOpen, onClose }: VenueDetailsPanelProps) {
  if (!venue) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[480px] bg-white shadow-2xl z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {venue.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{venue.city}</span>
                  {venue.capacity && (
                    <>
                      <Users className="w-4 h-4 ml-2" />
                      <span className="text-sm">{venue.capacity} kişi</span>
                    </>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Event Count & Sort */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">
                {events.length} etkinlik bulundu
              </span>
              <Button variant="ghost" size="sm" className="text-sm text-gray-600">
                <ArrowUpDown className="w-4 h-4 mr-1" />
                Tarihe göre sırala
              </Button>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto">
            {events.length > 0 ? (
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300 hover:shadow-md"
                  >
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 min-w-0 line-clamp-2">
                        {event.name}
                      </h3>
                      {event.genre && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium whitespace-nowrap">
                          {event.genre}
                        </span>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(event.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(event.date), 'HH:mm')}
                      </div>

                      {/* Artists */}
                      {event.artist && event.artist.length > 0 && (
                        <div className="flex items-start text-gray-600 text-sm">
                          <Star className="w-4 h-4 mr-2 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {event.artist.slice(0, 3).map((artist, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                              >
                                {artist}
                              </span>
                            ))}
                            {event.artist.length > 3 && (
                              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                +{event.artist.length - 3} daha
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Providers */}
                      {event.providers && event.providers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {event.providers.map((provider, index) => (
                            <span
                              key={index}
                              className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium capitalize"
                            >
                              {provider}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-2 border-t border-gray-300">
                      <Button 
                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                      >
                        Bilet Al
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Calendar className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">Etkinlik bulunamadı</h3>
                <p className="text-sm text-center px-4">
                  Bu mekan için yaklaşan etkinlik bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
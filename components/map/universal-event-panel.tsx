'use client';

import React from 'react';
import { X, MapPin, Users, Calendar, Star, ArrowUpDown, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { EventWithVenue, CanonicalVenue, EventSearchParams } from '@/lib/types';

interface UniversalEventPanelProps {
  events: EventWithVenue[];
  isOpen: boolean;
  onClose: () => void;
  onEventClick: (event: EventWithVenue) => void;
  selectedVenue?: CanonicalVenue | null;
  searchParams?: EventSearchParams;
  loading?: boolean;
}

export function UniversalEventPanel({ 
  events, 
  isOpen, 
  onClose, 
  onEventClick,
  selectedVenue,
  searchParams,
  loading = false
}: UniversalEventPanelProps) {
  
  // Determine panel title and subtitle based on context
  const getPanelHeader = () => {
    if (selectedVenue) {
      return {
        title: selectedVenue.name,
        subtitle: selectedVenue.city,
        eventCount: events.length
      };
    }
    
    // General event listing
    const hasFilters = searchParams?.query || searchParams?.genre || searchParams?.city;
    const hasSearch = searchParams?.query;
    
    let title = 'Tüm Etkinlikler';
    let subtitle = 'Harita görünümündeki etkinlikler';
    
    if (hasSearch) {
      title = 'Arama Sonuçları';
      subtitle = `"${searchParams.query}" için bulunan etkinlikler`;
    } else if (hasFilters) {
      title = 'Filtrelenmiş Etkinlikler';
      subtitle = 'Seçilen filtreler ile bulunan etkinlikler';
    }
    
    return {
      title,
      subtitle,
      eventCount: events.length
    };
  };

  const { title, subtitle, eventCount } = getPanelHeader();

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
        fixed top-0 left-0 h-full w-full sm:w-96 lg:w-[480px] bg-white shadow-2xl z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  {selectedVenue ? (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{subtitle}</span>
                      {selectedVenue.capacity && (
                        <>
                          <Users className="w-4 h-4 ml-2" />
                          <span className="text-sm">{selectedVenue.capacity} kişi</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4" />
                      <span className="text-sm">{subtitle}</span>
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
                {loading ? 'Yükleniyor...' : `${eventCount} etkinlik bulundu`}
              </span>
              <Button variant="ghost" size="sm" className="text-sm text-gray-600">
                <ArrowUpDown className="w-4 h-4 mr-1" />
                Tarihe göre sırala
              </Button>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-gray-600">Etkinlikler yükleniyor...</span>
              </div>
            ) : events.length > 0 ? (
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
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
                      
                      {/* Time is not shown in list view - only available in detail modal */}

                      {/* Venue (only show if not in venue-specific mode) */}
                      {!selectedVenue && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{event.venue.name}</span>
                        </div>
                      )}

                      {/* Artists - Show for all events, handle null gracefully */}
                      {(!event.genre || event.genre === 'Konser' || event.artist) && (
                        <div className="flex items-start text-gray-600 text-sm">
                          <Star className="w-4 h-4 mr-2 mt-0.5" />
                          {event.artist && event.artist.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {event.artist.slice(0, 2).map((artist, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                                >
                                  {artist}
                                </span>
                              ))}
                              {event.artist.length > 2 && (
                                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                  +{event.artist.length - 2} daha
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic text-xs">
                              {event.genre === 'Stand-up' || event.genre === 'Tiyatro' 
                                ? 'Sanatçı bilgisi için detaylara bakın' 
                                : 'Sanatçı bilgisi yok'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Providers */}
                      {event.providers && event.providers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.providers.slice(0, 3).map((provider, index) => (
                            <span
                              key={index}
                              className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            >
                              {provider}
                            </span>
                          ))}
                          {event.providers.length > 3 && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              +{event.providers.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-2 border-t border-gray-300">
                      <Button 
                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering onEventClick
                          onEventClick(event);
                        }}
                      >
                        Detayları Gör
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
                  {selectedVenue 
                    ? 'Bu mekan için yaklaşan etkinlik bulunmuyor.'
                    : searchParams?.query 
                      ? `"${searchParams.query}" araması için sonuç bulunamadı. Farklı anahtar kelimeler veya sanatçı isimleri deneyin.`
                      : 'Bu filtreler için etkinlik bulunamadı. Filtreleri değiştirmeyi deneyin.'
                  }
                </p>
                {searchParams?.query && (
                  <div className="mt-4 text-xs text-gray-400 text-center px-4">
                    <p>💡 Arama ipucu: Etkinlik adı, sanatçı adı veya mekan adı ile arama yapabilirsiniz.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
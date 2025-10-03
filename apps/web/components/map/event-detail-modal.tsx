'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Users, Calendar, Clock, Star, ExternalLink, Ticket, Info } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { EventImage } from '@/components/ui/event-image';
import { ClientEventsService } from '@/lib/services/client';
import type { EventWithVenue, EventWithTicketUrls } from '@/lib/types';

interface EventDetailModalProps {
  event: EventWithVenue | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const [eventWithTickets, setEventWithTickets] = useState<EventWithTicketUrls | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Define loadTicketUrls before useEffect
  const loadTicketUrls = useCallback(async () => {
    if (!event) return;
    
    setTicketsLoading(true);
    try {
      console.log('Loading ticket URLs for event:', event.id);
      const eventWithUrls = await ClientEventsService.getEventWithTicketUrls(event.id);
      
      if (eventWithUrls) {
        setEventWithTickets(eventWithUrls);
        console.log('Loaded ticket URLs:', eventWithUrls.ticket_urls);
      } else {
        // Fallback if service fails
        setEventWithTickets({
          ...event,
          ticket_urls: []
        });
      }
    } catch (error) {
      console.error('Error loading ticket URLs:', error);
      setEventWithTickets({
        ...event,
        ticket_urls: []
      });
    } finally {
      setTicketsLoading(false);
    }
  }, [event]);

  // Load ticket URLs when modal opens
  useEffect(() => {
    if (isOpen && event) {
      loadTicketUrls();
    } else {
      setEventWithTickets(null);
    }
  }, [isOpen, event, loadTicketUrls]);

  if (!event || !isOpen) return null;

  // Platform colors for ticket buttons
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'bubilet': return 'bg-blue-500 hover:bg-blue-600';
      case 'biletix': return 'bg-purple-500 hover:bg-purple-600';
      case 'passo': return 'bg-green-500 hover:bg-green-600';
      case 'bugece': return 'bg-orange-500 hover:bg-orange-600';
      case 'biletinial': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero Image Section - Takes up 65% of modal height */}
          <div className="relative w-full h-[65%] flex-shrink-0 overflow-hidden">
            <EventImage
              src={event.image_url}
              alt={event.name}
              fill
              className="object-cover object-[center_30%]"
              fallbackClassName="w-full h-full"
              genre={event.genre}
              priority
            />

            {event.image_url && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            )}

            {/* Content overlay - positioned at bottom within gradient */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  {/* Artist/Event name overlay */}
                  <h1 className={`text-4xl font-bold mb-3 leading-tight drop-shadow-2xl ${
                    event.image_url ? 'text-white' : 'text-gray-900'
                  }`}>
                    {event.name}
                  </h1>

                  {/* Venue text overlay */}
                  <div className={`flex items-center gap-2 text-lg ${
                    event.image_url ? 'text-white/90' : 'text-gray-700'
                  }`}>
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium drop-shadow-lg">{event.venue.name}, {event.venue.city}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={`rounded-full p-2 ${
                    event.image_url
                      ? 'hover:bg-white/20 text-white border-white/20 backdrop-blur-sm'
                      : 'hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content Section - Takes remaining 35% */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Price & Meta Info Section */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  {/* Only show title here if no image */}
                  {!event.image_url && (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                        {event.name}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-700 mb-4">
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">{event.venue.name}, {event.venue.city}</span>
                      </div>
                    </>
                  )}

                  {/* Event Meta Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(event.date), 'dd MMMM yyyy, EEEE', { locale: tr })}</span>
                    </div>

                    {/* Show actual time if available from provider tables */}
                    {eventWithTickets?.actual_time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{format(new Date(eventWithTickets.actual_time), 'HH:mm')}</span>
                      </div>
                    )}

                    {event.venue.capacity && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.venue.capacity} kişi kapasiteli</span>
                      </div>
                    )}

                    {/* Genre */}
                    {event.genre && (
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          {event.genre}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close button for no-image layout */}
                {!event.image_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>

            {/* Additional Content Sections */}
            <div className="p-6 space-y-8">
              
              {/* Artists Section - Show for all relevant events */}
              {(!event.genre || event.genre === 'Konser' || event.genre === 'Stand-up' || event.genre === 'Tiyatro' || event.artist) && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    {event.genre === 'Stand-up' || event.genre === 'Tiyatro' ? 'Oyuncular / Sanatçılar' : 'Sanatçılar'}
                  </h2>
                  {event.artist && event.artist.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {event.artist.map((artist, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      {event.genre === 'Stand-up' || event.genre === 'Tiyatro' 
                        ? 'Oyuncu ve sanatçı bilgileri etkinlik açıklamasında yer alıyor olabilir.' 
                        : 'Sanatçı bilgisi bulunmuyor.'}
                    </p>
                  )}
                </section>
              )}

              {/* Description Section */}
              {event.description && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Etkinlik Hakkında
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                </section>
              )}

              {/* Venue Details Section */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Mekan Bilgileri
                </h2>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{event.venue.name}</h3>
                  <p className="text-gray-600 mt-1">{event.venue.city}</p>
                  {event.venue.capacity && (
                    <p className="text-gray-600 text-sm mt-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      {event.venue.capacity} kişi kapasiteli
                    </p>
                  )}
                </div>
              </section>

              {/* Ticket Platforms Section */}
              {event.providers && event.providers.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Ticket className="w-5 h-5 mr-2" />
                    Bilet Satış Platformları
                  </h2>
                  
                  {ticketsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-3" />
                      <span className="text-gray-600">Bilet linkleri yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {event.providers.map((provider, index) => {
                        // Check if we have actual ticket URL for this provider
                        const ticketUrl = eventWithTickets?.ticket_urls?.find(
                          ticket => ticket.platform.toLowerCase() === provider.toLowerCase()
                        );
                        
                        return (
                          <Button
                            key={index}
                            className={`${getPlatformColor(provider)} text-white flex items-center justify-center py-3`}
                            onClick={() => {
                              if (ticketUrl?.url) {
                                window.open(ticketUrl.url, '_blank');
                              } else {
                                console.log(`No ticket URL available for ${provider}`);
                                // TODO: Show toast notification
                              }
                            }}
                            disabled={!ticketUrl?.url}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            {!ticketUrl?.url && ' (Yakında)'}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

            </div>

            {/* Footer - Inside scrollable section */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 mt-auto">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Son güncelleme: {format(new Date(event.updated_at || event.created_at), 'dd.MM.yyyy')}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Kapat
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => {
                      // TODO: Implement sharing functionality
                      console.log('Share event:', event.name);
                    }}
                  >
                    Paylaş
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
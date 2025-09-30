'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, MapPin, Users, Filter, Clock, ArrowUpDown, Star, ArrowLeft, Info, Ticket, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClientEventsService } from '@/lib/services/client';
import { ClientPricesService } from '@/lib/services/client/prices';
import { EventPriceBadge } from '@/components/ui/event-price-badge';
import { EventActionButtons } from '@/components/events/event-action-buttons';
import { VenuesListPanel } from './VenuesListPanel';
import { VenueDetailPanel } from './VenueDetailPanel';
import { PeoplePanel } from '@/components/social/PeoplePanel';
import { FriendsService, type FriendAtEvent } from '@/lib/services/client/friends';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { EventWithVenue, EventSearchParams, CanonicalVenue, EventWithTicketUrls } from '@/lib/types';

/**
 * Tab configuration interface for modular tab management
 */
interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  activeColor: string;
  inactiveColor: string;
}

/**
 * Props interface for the tabbed right panel component
 */
interface TabbedRightPanelProps {
  // Event-related props
  events: EventWithVenue[];
  isEventsLoading?: boolean;
  onEventClick: (event: EventWithVenue) => void;
  selectedVenue?: CanonicalVenue | null;
  searchParams?: EventSearchParams;

  // Venue-related props
  nearbyVenues?: CanonicalVenue[];
  selectedVenueForEvents?: CanonicalVenue | null;
  onVenueSelectForEvents?: (venue: CanonicalVenue) => void;
  onBackToVenuesList?: () => void;

  // Tab control props
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;

  // Panel control props
  currentMapBounds?: { north: number; south: number; east: number; west: number } | null;
}

/**
 * Tab types enum for type safety
 */
enum TabType {
  EVENTS = 'events',
  VENUES = 'venues',
  PEOPLE = 'people'
}

/**
 * Tab configuration with Instagram-style design
 */
const TAB_CONFIGS: Record<TabType, TabConfig> = {
  [TabType.EVENTS]: {
    id: TabType.EVENTS,
    label: 'Events',
    icon: Calendar,
    activeColor: 'text-red-500 border-red-500',
    inactiveColor: 'text-gray-500 border-transparent'
  },
  [TabType.VENUES]: {
    id: TabType.VENUES,
    label: 'Venues',
    icon: MapPin,
    activeColor: 'text-blue-500 border-blue-500',
    inactiveColor: 'text-gray-500 border-transparent'
  },
  [TabType.PEOPLE]: {
    id: TabType.PEOPLE,
    label: 'People',
    icon: Users,
    activeColor: 'text-purple-500 border-purple-500',
    inactiveColor: 'text-gray-500 border-transparent'
  }
};

/**
 * Integrated Events Content Component
 * Displays events in a format that fits within the tabbed panel
 */
interface IntegratedEventsContentProps {
  events: EventWithVenue[];
  onEventClick: (event: EventWithVenue) => void;
  selectedVenue?: CanonicalVenue | null;
  searchParams?: EventSearchParams;
  loading?: boolean;
}

function IntegratedEventsContent({
  events,
  onEventClick,
  selectedVenue,
  searchParams,
  loading = false
}: IntegratedEventsContentProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'price-low' | 'price-high'>('date');
  const [sortedEvents, setSortedEvents] = useState<EventWithVenue[]>(events);
  const [eventPrices, setEventPrices] = useState<Record<string, number | null>>({});

  // Update timestamp when events change (not when loading)
  useEffect(() => {
    if (!loading && events.length > 0) {
      setLastUpdated(new Date());
    }
  }, [events, loading]);

  // Fetch prices for sorting when events change
  useEffect(() => {
    const fetchPrices = async () => {
      if (events.length === 0) return;

      const prices: Record<string, number | null> = {};

      // Fetch prices for each event in parallel
      const pricePromises = events.map(async (event) => {
        try {
          const minPrice = await ClientPricesService.getEventMinPrice(event.id);
          prices[event.id] = minPrice;
        } catch (error) {
          console.error(`Error fetching price for event ${event.id}:`, error);
          prices[event.id] = null;
        }
      });

      await Promise.all(pricePromises);
      setEventPrices(prices);
    };

    fetchPrices();
  }, [events]);

  // Sort events when sort option or prices change
  useEffect(() => {
    const sorted = [...events].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();

        case 'price-low':
          const priceA = eventPrices[a.id] || Infinity;
          const priceB = eventPrices[b.id] || Infinity;
          return priceA - priceB;

        case 'price-high':
          const priceHighA = eventPrices[a.id] || -1;
          const priceHighB = eventPrices[b.id] || -1;
          return priceHighB - priceHighA;

        default:
          return 0;
      }
    });

    setSortedEvents(sorted);
  }, [events, sortBy, eventPrices]);

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

    let title = 'Yakınınızdaki Etkinlikler';
    let subtitle = 'Görünür harita alanındaki etkinlikler';

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
    <div className="h-full flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-800">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white truncate">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-zinc-400">
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

        {/* Event Count & Sort */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">
                {loading ? 'Yükleniyor...' : `${eventCount} etkinlik bulundu`}
              </span>
              {loading && (
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {lastUpdated && !loading && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                <span>Son güncelleme: {format(lastUpdated, 'HH:mm:ss')}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ArrowUpDown className="w-4 h-4 mr-1" />
                {sortBy === 'date' ? 'Tarihe göre' : sortBy === 'price-low' ? 'Fiyata göre (düşük)' : 'Fiyata göre (yüksek)'}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
              <DropdownMenuItem
                onClick={() => setSortBy('date')}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Tarihe göre sırala
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('price-low')}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Fiyata göre (düşük → yüksek)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('price-high')}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Fiyata göre (yüksek → düşük)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-zinc-400">Etkinlikler yükleniyor...</span>
          </div>
        ) : sortedEvents.length > 0 ? (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-all duration-200 border border-zinc-800 hover:border-zinc-700 hover:shadow-md"
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-base leading-tight flex-1 min-w-0 line-clamp-2">
                    {event.name}
                  </h3>
                  {event.genre && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-medium whitespace-nowrap">
                      {event.genre}
                    </span>
                  )}
                </div>

                {/* Event Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center text-zinc-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(event.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
                  </div>

                  {/* Venue (only show if not in venue-specific mode) */}
                  {!selectedVenue && (
                    <div className="flex items-center text-zinc-400 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{event.venue.name}</span>
                    </div>
                  )}

                  {/* Artists - Show for all events, handle null gracefully */}
                  {(!event.genre || event.genre === 'Konser' || event.artist) && (
                    <div className="flex items-start text-zinc-400 text-sm">
                      <Star className="w-4 h-4 mr-2 mt-0.5" />
                      {event.artist && event.artist.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {event.artist.slice(0, 2).map((artist, index) => (
                            <span
                              key={index}
                              className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs"
                            >
                              {artist}
                            </span>
                          ))}
                          {event.artist.length > 2 && (
                            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs">
                              +{event.artist.length - 2} daha
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic text-xs">
                          {event.genre === 'Stand-up' || event.genre === 'Tiyatro'
                            ? 'Sanatçı bilgisi için detaylara bakın'
                            : 'Sanatçı bilgisi yok'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Providers and Price */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Providers */}
                    {event.providers && event.providers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.providers.slice(0, 2).map((provider, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          >
                            {provider}
                          </span>
                        ))}
                        {event.providers.length > 2 && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            +{event.providers.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price Badge */}
                    <EventPriceBadge
                      eventId={event.id}
                      size="sm"
                      className="ml-auto"
                    />
                  </div>
                </div>

                {/* Event Action Buttons */}
                <div className="mt-3 pt-2 border-t border-zinc-700">
                  <EventActionButtons
                    eventId={event.id}
                    size="sm"
                    orientation="horizontal"
                    className="mb-3"
                  />

                  {/* View Details Button */}
                  <button
                    type="button"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-3 rounded text-sm transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('TabbedRightPanel: Detayları Gör button clicked for:', event.name);
                      onEventClick(event);
                    }}
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Calendar className="w-16 h-16 mb-4 text-zinc-600" />
            <h3 className="text-lg font-medium mb-2 text-white">Etkinlik bulunamadı</h3>
            <p className="text-sm text-center px-4 text-zinc-400">
              {selectedVenue
                ? 'Bu mekan için yaklaşan etkinlik bulunmuyor.'
                : searchParams?.query
                  ? `"${searchParams.query}" araması için sonuç bulunamadı. Farklı anahtar kelimeler veya sanatçı isimleri deneyin.`
                  : 'Bu filtreler için etkinlik bulunamadı. Filtreleri değiştirmeyi deneyin.'
              }
            </p>
            {searchParams?.query && (
              <div className="mt-4 text-xs text-zinc-500 text-center px-4">
                <p>💡 Arama ipucu: Etkinlik adı, sanatçı adı veya mekan adı ile arama yapabilirsiniz.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Integrated Event Detail Component
 * Shows event details within the right panel
 */
interface IntegratedEventDetailProps {
  event: EventWithVenue;
  onBack: () => void;
}

function IntegratedEventDetail({ event, onBack }: IntegratedEventDetailProps) {
  const [eventWithTickets, setEventWithTickets] = useState<EventWithTicketUrls | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [eventPrices, setEventPrices] = useState<any[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [friendsAttending, setFriendsAttending] = useState<FriendAtEvent[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    loadTicketUrls();
    loadEventPrices();
    loadFriendsAttending();
  }, [event.id]);

  const loadTicketUrls = async () => {
    setTicketsLoading(true);
    try {
      const eventWithUrls = await ClientEventsService.getEventWithTicketUrls(event.id);
      if (eventWithUrls) {
        setEventWithTickets(eventWithUrls);
      } else {
        setEventWithTickets({ ...event, ticket_urls: [] });
      }
    } catch (error) {
      console.error('Error loading ticket URLs:', error);
      setEventWithTickets({ ...event, ticket_urls: [] });
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadEventPrices = async () => {
    setPricesLoading(true);
    try {
      const prices = await ClientPricesService.getEventPrices(event.id);
      setEventPrices(prices);
      console.log('Loaded real price data for event:', event.id, prices);
    } catch (error) {
      console.error('Error loading event prices:', error);
      setEventPrices([]);
    } finally {
      setPricesLoading(false);
    }
  };

  const loadFriendsAttending = async () => {
    setFriendsLoading(true);
    try {
      const friends = await FriendsService.getFriendsAtEvent(event.id);
      setFriendsAttending(friends);
      console.log('Loaded friends attending event:', event.id, friends);
    } catch (error) {
      console.error('Error loading friends attending event:', error);
      setFriendsAttending([]);
    } finally {
      setFriendsLoading(false);
    }
  };

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate real pricing data from database
  const getRealPriceData = () => {
    if (eventPrices.length === 0) {
      return {
        hasRealPrices: false,
        minPrice: null,
        maxPrice: null,
        priceRange: 'Fiyat bilgisi yükleniyor...',
        platforms: []
      };
    }

    const allMinPrices = eventPrices.map(p => p.minPrice).filter(p => p > 0);
    const allMaxPrices = eventPrices.map(p => p.maxPrice).filter(p => p > 0);

    if (allMinPrices.length === 0) {
      return {
        hasRealPrices: false,
        minPrice: null,
        maxPrice: null,
        priceRange: 'Fiyat bilgisi bulunamadı',
        platforms: eventPrices
      };
    }

    const minPrice = Math.min(...allMinPrices);
    const maxPrice = Math.max(...allMaxPrices);

    return {
      hasRealPrices: true,
      minPrice,
      maxPrice,
      priceRange: minPrice === maxPrice
        ? ClientPricesService.formatPrice(minPrice)
        : ClientPricesService.formatPriceRange(minPrice, maxPrice),
      platforms: eventPrices
    };
  };

  const priceData = getRealPriceData();

  // Enhanced data like the original design
  const eventDetails = {
    organizer: event.venue.name,
    ageRestriction: "18+",
    refundRules: [
      "Full refund available up to 48 hours before event",
      "50% refund available up to 24 hours before event",
      "No refunds for weather-related cancellations",
      "Processing fee of ₺5 applies to all refunds"
    ],
    doorsOpen: "20:00",
    accessibility: ["Wheelchair accessible", "Hearing loop available", "Service animals welcome"],
    // Use real price data instead of mock
    priceData
  };

  return (
    <div className="h-full bg-black text-white overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
      {/* Header Section - Event Banner */}
      <div className="relative h-72 bg-gradient-to-b from-zinc-800 to-black">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Star className="w-20 h-20 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Event Header Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 text-zinc-300 text-sm mb-3">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(event.date)}</span>
            <span className="text-zinc-500">•</span>
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTime(event.date)}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white leading-tight">
            {event.name}
          </h1>
          <p className="text-zinc-300 text-lg">{event.venue.name} • {event.venue.city}</p>
          {event.genre && (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium">
              {event.genre}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-8">
        {/* Price and CTA Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-zinc-400 text-sm">
                {pricesLoading ? 'Loading...' : 'From'}
              </span>
              <div className="text-3xl font-bold text-white">
                {pricesLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Yükleniyor...</span>
                  </div>
                ) : (
                  eventDetails.priceData.priceRange
                )}
              </div>
              {!pricesLoading && eventDetails.priceData.platforms.length > 0 && (
                <div className="text-sm text-zinc-400 mt-1">
                  {eventDetails.priceData.platforms.length} platform{eventDetails.priceData.platforms.length > 1 ? 'da' : 'da'} mevcut
                </div>
              )}
            </div>
          </div>

          {/* Event Action Buttons */}
          <div className="mb-6">
            <EventActionButtons
              eventId={event.id}
              size="md"
              orientation="horizontal"
              className="justify-center"
            />
          </div>

          {/* Ticket Buttons */}
          {event.providers && event.providers.length > 0 ? (
            ticketsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-3" />
                <span className="text-zinc-400">Loading tickets...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {event.providers.slice(0, 1).map((provider, index) => {
                  const ticketUrl = eventWithTickets?.ticket_urls?.find(
                    ticket => ticket.platform.toLowerCase() === provider.toLowerCase()
                  );

                  return (
                    <button
                      key={index}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-[1.02] text-lg"
                      onClick={() => {
                        if (ticketUrl?.url) {
                          window.open(ticketUrl.url, '_blank');
                        }
                      }}
                      disabled={!ticketUrl?.url}
                    >
                      Get Tickets - {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      {!ticketUrl?.url && ' (Coming Soon)'}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <button
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-[1.02] text-lg"
              disabled
            >
              Tickets Coming Soon
            </button>
          )}

          {/* All Platforms */}
          {event.providers && event.providers.length > 1 && (
            <div className="mt-4">
              <h4 className="text-zinc-400 text-sm mb-2">More platforms:</h4>
              <div className="flex flex-wrap gap-2">
                {event.providers.slice(1).map((provider, index) => {
                  const ticketUrl = eventWithTickets?.ticket_urls?.find(
                    ticket => ticket.platform.toLowerCase() === provider.toLowerCase()
                  );

                  return (
                    <button
                      key={index}
                      className={`${getPlatformColor(provider)} text-white px-4 py-2 rounded-full text-sm font-medium transition-colors`}
                      onClick={() => {
                        if (ticketUrl?.url) {
                          window.open(ticketUrl.url, '_blank');
                        }
                      }}
                      disabled={!ticketUrl?.url}
                    >
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Artists Section */}
        {(!event.genre || event.genre === 'Konser' || event.genre === 'Stand-up' || event.genre === 'Tiyatro' || event.artist) && (
          <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
              <Users className="w-5 h-5" />
              {event.genre === 'Stand-up' || event.genre === 'Tiyatro' ? 'Sanatçılar & Oyuncular' : 'Sanatçılar'}
            </h2>
            {event.artist && event.artist.length > 0 ? (
              <div className="space-y-4">
                {event.artist.map((artist, index) => (
                  <div key={index} className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{artist}</h3>
                        <p className="text-zinc-400 text-sm mb-2">Featured Artist</p>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                          Performing at {event.venue.name} on {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
                <p className="text-zinc-400 text-sm">
                  {event.genre === 'Stand-up' || event.genre === 'Tiyatro'
                    ? 'Sanatçı ve oyuncu bilgileri etkinlik açıklamasında yer alıyor olabilir.'
                    : 'Sanatçı bilgisi bulunmuyor.'}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Friends Attending Section */}
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <Users className="w-5 h-5" />
            Friends Attending
            {friendsAttending.length > 0 && (
              <span className="text-sm font-normal text-zinc-400">({friendsAttending.length})</span>
            )}
          </h2>

          {friendsLoading ? (
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-3" />
                <span className="text-zinc-400">Loading friends...</span>
              </div>
            </div>
          ) : friendsAttending.length > 0 ? (
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {friendsAttending.map((friend) => (
                  <div key={friend.id} className="flex flex-col items-center text-center">
                    <Avatar className="w-16 h-16 mb-2">
                      <AvatarImage src={friend.avatar_url || '/default-avatar.png'} alt={friend.display_name || friend.username} />
                      <AvatarFallback>
                        {(friend.display_name || friend.username)?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {friend.display_name || friend.username}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          friend.status === 'going' ? 'bg-green-400' :
                          friend.status === 'interested' ? 'bg-yellow-400' :
                          friend.status === 'maybe' ? 'bg-orange-400' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-xs text-zinc-400 capitalize">
                          {friend.status}
                        </span>
                      </div>
                      {friend.is_online && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs text-green-400">Online</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {friendsAttending.length > 6 && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <p className="text-center text-sm text-zinc-400">
                    Showing first 6 friends attending this event
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-400 text-sm text-center py-4">
                None of your friends are attending this event yet.
              </p>
            </div>
          )}
        </section>

        {/* Event Details */}
        {event.description && (
          <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
              <Info className="w-5 h-5" />
              Event Details
            </h2>
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </section>
        )}

        {/* Venue Section */}
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <MapPin className="w-5 h-5" />
            Venue
          </h2>
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-lg font-bold text-white mb-4">{event.venue.name}</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-zinc-300">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span>Doors open at <span className="text-white font-medium">{eventDetails.doorsOpen}</span></span>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-500" />
                <span>{event.venue.city}</span>
              </div>

              {event.venue.capacity && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span>{event.venue.capacity.toLocaleString()} capacity</span>
                </div>
              )}

              <div className="pt-3">
                <h4 className="text-zinc-400 font-medium mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Accessibility
                </h4>
                <div className="flex flex-wrap gap-2">
                  {eventDetails.accessibility.map((feature, index) => (
                    <span key={index} className="inline-flex items-center gap-2 text-xs bg-blue-600/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-600/30">
                      <Info className="w-3 h-3" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Instagram-style tabbed right panel component
 * Provides Events and Venues functionality in a unified interface
 */
export function TabbedRightPanel({
  events,
  isEventsLoading = false,
  onEventClick,
  selectedVenue,
  searchParams,
  nearbyVenues = [],
  selectedVenueForEvents,
  onVenueSelectForEvents,
  onBackToVenuesList,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
}: TabbedRightPanelProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>(TabType.EVENTS);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventWithVenue | null>(null);

  // Use external tab state if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;

  // Handle tab change with proper state management
  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);

    // Reset all detail views when switching tabs
    setSelectedEventForDetail(null);
    if (tabId === TabType.EVENTS && onBackToVenuesList) {
      onBackToVenuesList();
    }
  }, [setActiveTab, onBackToVenuesList]);

  // Handle event click to show details in panel instead of modal
  const handleEventClick = useCallback((event: EventWithVenue) => {
    console.log('TabbedRightPanel: Event clicked for detail view:', event.name);
    setSelectedEventForDetail(event);
  }, []);

  // Handle back from event detail to events list
  const handleBackFromEventDetail = useCallback(() => {
    setSelectedEventForDetail(null);
  }, []);

  // Handle venue selection from venues list
  const handleVenueSelect = useCallback((venue: CanonicalVenue) => {
    if (onVenueSelectForEvents) {
      onVenueSelectForEvents(venue);
    }
  }, [onVenueSelectForEvents]);

  // Handle back to venues list
  const handleBackToVenuesList = useCallback(() => {
    if (onBackToVenuesList) {
      onBackToVenuesList();
    }
  }, [onBackToVenuesList]);

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case TabType.EVENTS:
        // Show event detail if an event is selected, otherwise show events list
        if (selectedEventForDetail) {
          return (
            <IntegratedEventDetail
              event={selectedEventForDetail}
              onBack={handleBackFromEventDetail}
            />
          );
        } else {
          return (
            <IntegratedEventsContent
              events={events}
              onEventClick={handleEventClick}
              selectedVenue={selectedVenue}
              searchParams={searchParams}
              loading={isEventsLoading}
            />
          );
        }

      case TabType.VENUES:
        // Show venue detail if a venue is selected, otherwise show venues list
        if (selectedVenueForEvents) {
          return (
            <VenueDetailPanel
              venue={selectedVenueForEvents}
              onBack={handleBackToVenuesList}
              onEventClick={onEventClick}
            />
          );
        } else {
          return (
            <VenuesListPanel
              onBack={() => {}} // No back action needed in tabbed context
              nearbyVenues={nearbyVenues}
              onVenueSelect={handleVenueSelect}
            />
          );
        }

      case TabType.PEOPLE:
        // Show People panel with social feed
        return <PeoplePanel className="h-full" />;

      default:
        return null;
    }
  };

  // Render individual tab button
  const renderTabButton = (tabConfig: TabConfig) => {
    const Icon = tabConfig.icon;
    const isActive = activeTab === tabConfig.id;

    return (
      <button
        key={tabConfig.id}
        onClick={() => handleTabChange(tabConfig.id as TabType)}
        className={`
          flex-1 flex flex-col items-center justify-center py-3 px-4
          border-t-2 transition-all duration-200
          ${isActive ? tabConfig.activeColor : tabConfig.inactiveColor}
          hover:bg-gray-50 active:bg-gray-100
        `}
      >
        <Icon className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{tabConfig.label}</span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Instagram-style Bottom Tab Bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex">
          {Object.values(TAB_CONFIGS).map(renderTabButton)}
        </div>
      </div>
    </div>
  );
}
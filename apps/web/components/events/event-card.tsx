import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, MapPin, Users, Music, ExternalLink, Ticket } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventImage } from '@/components/ui/event-image';
import { EventPriceBadge } from '@/components/ui/event-price-badge';
import type { EventWithVenue } from '@/lib/types';

interface EventCardProps {
  event: EventWithVenue;
  onEventClick?: (event: EventWithVenue) => void;
  showDistance?: boolean;
  distance?: number;
  compactView?: boolean;
}

export function EventCard({ 
  event, 
  onEventClick, 
  showDistance = false, 
  distance,
  compactView = false 
}: EventCardProps) {
  const handleClick = () => {
    onEventClick?.(event);
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (compactView) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            {/* Event Image */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              <EventImage
                src={event.image_url}
                alt={event.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                fallbackClassName="w-16 h-16 rounded-lg"
                genre={event.genre}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">
                {event.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(event.date), 'dd MMM yyyy, HH:mm', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{event.venue.name}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {event.genre && (
                  <Badge variant="secondary" className="text-xs">
                    {event.genre}
                  </Badge>
                )}
                {showDistance && distance && (
                  <Badge variant="outline" className="text-xs">
                    {formatDistance(distance)}
                  </Badge>
                )}
                <EventPriceBadge
                  eventId={event.id}
                  size="sm"
                />
              </div>
            </div>
            
            {event.providers && event.providers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.providers.slice(0, 2).map((platform, index) => (
                  <Badge key={index} variant="default" className="text-xs capitalize">
                    {platform}
                  </Badge>
                ))}
                {event.providers.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{event.providers.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={handleClick}>
      {/* Event Image - Taller banner with better positioning for artist faces */}
      <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
        <EventImage
          src={event.image_url}
          alt={event.name}
          fill
          className="object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-200"
          fallbackClassName="w-full h-64 rounded-t-lg"
          genre={event.genre}
        />
        {event.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        )}
      </div>

      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-xl group-hover:text-blue-600 transition-colors leading-tight">
            {event.name}
          </h3>
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="font-medium">
            {format(new Date(event.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
          </span>
          <span className="text-lg font-bold text-blue-600">
            {format(new Date(event.date), 'HH:mm')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5 text-red-500" />
          <div>
            <span className="font-medium">{event.venue.name}</span>
            {event.venue.city && (
              <span className="text-sm text-gray-500 block">{event.venue.city}</span>
            )}
          </div>
        </div>

        {event.venue.capacity && (
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5 text-green-500" />
            <span>Kapasite: {event.venue.capacity.toLocaleString()}</span>
          </div>
        )}

        {showDistance && distance && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span>Uzaklık: {formatDistance(distance)}</span>
          </div>
        )}

        {event.artist && event.artist.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Music className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Sanatçılar:</span>
            </div>
            <div className="flex flex-wrap gap-2 ml-7">
              {event.artist.slice(0, 4).map((artist, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {artist}
                </Badge>
              ))}
              {event.artist.length > 4 && (
                <Badge variant="secondary" className="text-sm">
                  +{event.artist.length - 4} daha
                </Badge>
              )}
            </div>
          </div>
        )}

        {event.genre && (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {event.genre}
            </Badge>
          </div>
        )}

        {event.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t bg-gray-50/50">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Platformlar:
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {event.providers && event.providers.length > 0 ? (
                <>
                  {event.providers.slice(0, 2).map((platform, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="text-xs bg-green-600 hover:bg-green-700 capitalize"
                    >
                      {platform}
                    </Badge>
                  ))}
                  {event.providers.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.providers.length - 2}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-500">Bilet bilgisi yok</span>
              )}
            </div>
          </div>

          <EventPriceBadge
            eventId={event.id}
            size="md"
          />
        </div>
      </CardFooter>
    </Card>
  );
}
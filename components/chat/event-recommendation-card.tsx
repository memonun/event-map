'use client';

import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, Ticket, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventImage } from '@/components/ui/event-image';
import type { VectorSearchResult } from '@/lib/types';

interface EventRecommendationCardProps {
  event: VectorSearchResult;
  onEventClick?: () => void;
  showSimilarityScore?: boolean;
}

export function EventRecommendationCard({ 
  event, 
  onEventClick,
  showSimilarityScore = true 
}: EventRecommendationCardProps) {
  
  const handleCardClick = () => {
    onEventClick?.();
    // You could also trigger event detail modal here
    // or navigate to event details page
  };

  const formatSimilarityScore = (score: number) => {
    return `${(score * 100).toFixed(0)}% eşleşme`;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'bubilet': return 'bg-blue-500';
      case 'biletix': return 'bg-purple-500';
      case 'passo': return 'bg-green-500';
      case 'bugece': return 'bg-orange-500';
      case 'biletinial': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Event Image */}
      <div className="relative h-32 sm:h-40">
        <EventImage
          src={event.image_url}
          alt={event.name}
          fill
          className="object-cover"
          fallbackClassName="h-32 sm:h-40 rounded-t-xl"
          genre={event.genre}
        />
        
        {/* Similarity score badge */}
        {showSimilarityScore && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1" />
              {formatSimilarityScore(event.similarity_score)}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Event Title */}
        <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
          {event.name}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium">
              {format(new Date(event.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>
              {format(new Date(event.date), 'HH:mm')}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate">
              {event.venue.name}, {event.venue.city}
            </span>
          </div>

          {/* Capacity */}
          {event.venue.capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>{event.venue.capacity.toLocaleString()} kişi kapasiteli</span>
            </div>
          )}
        </div>

        {/* Genre & Artists */}
        <div className="space-y-2">
          {event.genre && (
            <Badge variant="secondary" className="text-xs">
              {event.genre}
            </Badge>
          )}
          
          {event.artist && event.artist.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.artist.slice(0, 3).map((artist, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {artist}
                </Badge>
              ))}
              {event.artist.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{event.artist.length - 3} daha
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Platforms */}
        {event.providers && event.providers.length > 0 && (
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {event.providers.slice(0, 3).map((platform, index) => (
                <Badge 
                  key={index}
                  className={`text-white text-xs ${getPlatformColor(platform)}`}
                >
                  {platform}
                </Badge>
              ))}
              {event.providers.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{event.providers.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Matching content preview */}
        {event.matching_content && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-1">Eşleşen içerik:</p>
            <p className="text-xs text-blue-600 line-clamp-2 italic">
              &ldquo;{event.matching_content}&rdquo;
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCardClick}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Detaylar
          </Button>
          
          {event.providers && event.providers.length === 1 && (
            <Button
              variant="outline"
              onClick={() => {
                // Handle direct ticket purchase
                // This could open the ticket URL directly
                console.log('Direct ticket purchase for:', event.name);
              }}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Bilet Al
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
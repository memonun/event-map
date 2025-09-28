'use client';

import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock } from "lucide-react";
import { ArtistBubble } from "@/components/profile/artist-bubble";
import { EventPriceBadge } from "@/components/ui/event-price-badge";
import Image from 'next/image';

interface ProfileEvent {
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  venue_city: string;
  user_status: string;
  artists: string[];
  genre: string;
  image_url: string | null;
  interaction_date: string;
}

interface ProfileEventCardProps {
  event: ProfileEvent;
  showStatus?: boolean;
}

export function ProfileEventCard({ event, showStatus = true }: ProfileEventCardProps) {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'bg-green-100 text-green-800 border-green-200';
      case 'interested': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'attended': return 'bg-green-100 text-green-800 border-green-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      case 'wish_went': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'going': return 'Going';
      case 'interested': return 'Interested';
      case 'maybe': return 'Maybe';
      case 'attended': return 'Attended';
      case 'missed': return 'Missed';
      case 'wish_went': return 'Wish I Went';
      default: return status;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-gray-200 hover:border-gray-300">
      <CardContent className="p-0">
        {/* Event Image */}
        <div className="relative aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.event_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white/70" />
            </div>
          )}
          
          {/* Status Badge */}
          {showStatus && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(event.user_status)} font-medium`}
              >
                {getStatusLabel(event.user_status)}
              </Badge>
            </div>
          )}

          {/* Genre Badge */}
          {event.genre && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-primary/80 text-primary-foreground border-transparent">
                {event.genre}
              </Badge>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          {/* Event Title */}
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {event.event_name}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(eventDate, 'MMM d, yyyy')}
            </span>
            <Clock className="w-4 h-4 ml-2" />
            <span>
              {format(eventDate, 'HH:mm')}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">
              {event.venue_name}, {event.venue_city}
            </span>
          </div>

          {/* Artists */}
          {event.artists && event.artists.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {event.artists.slice(0, 3).map((artist, index) => (
                <ArtistBubble 
                  key={index}
                  artistName={artist}
                  size="sm"
                />
              ))}
              {event.artists.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{event.artists.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {isUpcoming ? 'Added' : 'Interacted'} {format(new Date(event.interaction_date), 'MMM d')}
              </span>
              {isUpcoming && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Upcoming
                </Badge>
              )}
            </div>

            <EventPriceBadge
              eventId={event.event_id}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import React from 'react';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import type { EventWithVenue } from '@/lib/types';

interface PhotoData {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  event?: EventWithVenue;
  friends: Array<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: 'attended' | 'going' | 'interested' | 'maybe';
    event_id: string;
    is_online?: boolean;
    last_seen?: string;
  }>;
}

interface PhotoViewProps {
  photo: PhotoData;
  onEventClick?: (event: EventWithVenue) => void;
}

export function PhotoView({ photo, onEventClick }: PhotoViewProps) {
  const handleEventClick = () => {
    if (photo.event && onEventClick) {
      onEventClick(photo.event);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1200&fit=crop';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
        {/* Top Section - Event Info */}
        {photo.event && (
          <div className="flex items-start justify-between">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 max-w-[70%]">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  {new Date(photo.event.date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-1 text-white">
                {photo.event.name}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-200">
                  {photo.event.venue?.name || 'Event Venue'}
                </span>
              </div>

              {photo.event.artist && photo.event.artist.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-200">
                    {photo.event.artist.slice(0, 2).join(', ')}
                    {photo.event.artist.length > 2 && ' +' + (photo.event.artist.length - 2)}
                  </span>
                </div>
              )}
            </div>

            {/* View Event Button */}
            <button
              onClick={handleEventClick}
              className="bg-green-500 hover:bg-green-600 transition-colors rounded-full p-3 shadow-lg"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Bottom Section - General Info */}
        <div className="space-y-4">
          {/* Photo Info */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-xl font-bold text-white mb-1">
              {photo.title}
            </h2>
            <p className="text-gray-200 text-sm">
              {photo.subtitle}
            </p>
          </div>

          {/* User Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm font-medium">
                {photo.friends.length} {photo.friends.length === 1 ? 'friend' : 'friends'} here
              </span>
              {photo.friends.filter(f => f.is_online).length > 0 && (
                <span className="text-green-400 text-xs">
                  • {photo.friends.filter(f => f.is_online).length} online
                </span>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="flex gap-2">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
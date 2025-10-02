'use client';

import React, { useState } from 'react';
import type { EventWithVenue, CanonicalVenue } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  Plus,
  ExternalLink,
  Info,
  Accessibility,
  Users,
  Shield,
  RefreshCcw,
  Building2,
  Music,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';

interface EventDetailPanelProps {
  selectedVenue: CanonicalVenue | null;
  selectedEvents: EventWithVenue[];
  onEventClick: (event: EventWithVenue) => void;
  onBackToList?: () => void;
}

interface ArtistInfo {
  name: string;
  description: string;
  followers?: string;
  instagram?: string;
  linktree?: string;
  spotify?: string;
}

interface EventDetails {
  organizer: string;
  ageRestriction: string;
  refundRules: string[];
  doorsOpen: string;
  accessibility: string[];
  ticketPrice: number;
}

export function EventDetailPanel({ selectedVenue, selectedEvents, onEventClick, onBackToList }: EventDetailPanelProps) {
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());
  const currentEvent = selectedEvents[0];

  if (!currentEvent || !selectedVenue) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-6">
        <div className="text-center text-zinc-500">
          <Music className="w-16 h-16 mx-auto mb-6 opacity-40" />
          <h3 className="text-xl font-medium mb-3 text-zinc-300">No Event Selected</h3>
          <p className="text-sm leading-relaxed">Tap an event marker on the map to view details</p>
        </div>
      </div>
    );
  }

  // Enhanced mock data with Spotify-style information
  const artists: ArtistInfo[] = [
    {
      name: currentEvent.artist?.[0] || "Featured Artist",
      description: "Electronic music producer and live performer known for atmospheric soundscapes",
      followers: "24.2K followers",
      instagram: "https://instagram.com/artist",
      linktree: "https://linktr.ee/artist",
      spotify: "https://open.spotify.com/artist/123"
    }
  ];

  const eventDetails: EventDetails = {
    organizer: "Zorlu PSM",
    ageRestriction: "18+",
    refundRules: [
      "Full refund available up to 48 hours before event",
      "50% refund available up to 24 hours before event",
      "No refunds for weather-related cancellations",
      "Processing fee of ₺5 applies to all refunds"
    ],
    doorsOpen: "20:00",
    accessibility: ["Wheelchair accessible", "Hearing loop available", "Service animals welcome"],
    ticketPrice: Math.floor(Math.random() * 200) + 50
  };

  const toggleSaveEvent = (eventId: string) => {
    setSavedEvents(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(eventId)) {
        newSaved.delete(eventId);
      } else {
        newSaved.add(eventId);
      }
      return newSaved;
    });
  };

  const toggleFollowArtist = (artistName: string) => {
    setFollowedArtists(prev => {
      const newFollowed = new Set(prev);
      if (newFollowed.has(artistName)) {
        newFollowed.delete(artistName);
      } else {
        newFollowed.add(artistName);
      }
      return newFollowed;
    });
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

  return (
    <div className="h-full bg-black text-white overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
      {/* Header Section - Event Banner */}
      <div className="relative h-72 bg-gradient-to-b from-zinc-800 to-black">
        {currentEvent.image_url ? (
          <img
            src={currentEvent.image_url}
            alt={currentEvent.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Music className="w-20 h-20 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Back Button */}
        {onBackToList && (
          <button
            onClick={onBackToList}
            className="absolute top-6 left-6 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Event Header Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 text-zinc-300 text-sm mb-3">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(currentEvent.date)}</span>
            <span className="text-zinc-500">•</span>
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTime(currentEvent.date)}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white leading-tight">
            {currentEvent.name}
          </h1>
          <p className="text-zinc-300 text-lg">{selectedVenue.name} • {selectedVenue.city}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-8">
        {/* Price and CTA Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-zinc-400 text-sm">From</span>
              <div className="text-3xl font-bold text-white">₺{eventDetails.ticketPrice}</div>
            </div>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={() => onEventClick(currentEvent)}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-[1.02] text-lg"
          >
            Get Tickets
          </button>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => toggleSaveEvent(currentEvent.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full border transition-all duration-200 ${
                savedEvents.has(currentEvent.id)
                  ? 'bg-green-600/20 border-green-600/50 text-green-400'
                  : 'border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${savedEvents.has(currentEvent.id) ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">Save</span>
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Calendar</span>
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-200">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </section>

        {/* Artists Section */}
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <Users className="w-5 h-5" />
            Artists
          </h2>
          {artists.map((artist, index) => (
            <div key={index} className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
                  <p className="text-zinc-400 text-sm mb-2">{artist.followers}</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{artist.description}</p>
                </div>
                <button
                  onClick={() => toggleFollowArtist(artist.name)}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 border ${
                    followedArtists.has(artist.name)
                      ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                      : 'border-white text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {followedArtists.has(artist.name) ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="flex gap-3">
                {artist.spotify && (
                  <a href={artist.spotify} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full transition-colors text-white font-medium">
                    <Music className="w-4 h-4" />
                    Spotify
                  </a>
                )}
                {artist.instagram && (
                  <a href={artist.instagram} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-full transition-colors text-white font-medium">
                    <ExternalLink className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {artist.linktree && (
                  <a href={artist.linktree} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-sm bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-full transition-colors text-white font-medium">
                    <ExternalLink className="w-4 h-4" />
                    Links
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Event Details */}
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <Info className="w-5 h-5" />
            Event Details
          </h2>
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-400 font-medium">Organizer</span>
              <span className="text-white font-medium">{eventDetails.organizer}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-400 font-medium">Age Restriction</span>
              <span className="flex items-center gap-2 text-white font-medium">
                <Shield className="w-4 h-4 text-yellow-400" />
                {eventDetails.ageRestriction}
              </span>
            </div>

            <div className="pt-2">
              <h4 className="text-zinc-400 font-medium mb-3">Refund Policy</h4>
              <ul className="space-y-2">
                {eventDetails.refundRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3 text-zinc-300 text-sm">
                    <RefreshCcw className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-500" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Venue Section */}
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <Building2 className="w-5 h-5" />
            Venue
          </h2>
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-lg font-bold text-white mb-4">{selectedVenue.name}</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-zinc-300">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span>Doors open at <span className="text-white font-medium">{eventDetails.doorsOpen}</span></span>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-500" />
                <span>{selectedVenue.city}</span>
              </div>

              <div className="pt-3">
                <h4 className="text-zinc-400 font-medium mb-3 flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  Accessibility
                </h4>
                <div className="flex flex-wrap gap-2">
                  {eventDetails.accessibility.map((feature, index) => (
                    <span key={index} className="inline-flex items-center gap-2 text-xs bg-blue-600/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-600/30">
                      <Accessibility className="w-3 h-3" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Events at Venue */}
        {selectedEvents.length > 1 && (
          <section>
            <h2 className="text-xl font-bold mb-5">More at {selectedVenue.name}</h2>
            <div className="space-y-3">
              {selectedEvents.slice(1, 3).map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left bg-zinc-900/30 hover:bg-zinc-900/60 rounded-xl p-4 transition-all duration-200 border border-zinc-800 hover:border-zinc-700"
                >
                  <h4 className="font-bold text-white mb-2">{event.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.date)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Music, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import Image from 'next/image';

interface Event {
  id: string;
  name: string;
  date: string;
  genre: string | null;
  image_url: string | null;
  artist: {
    id: string;
    artists_name: string;
    normalized_name: string;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    coordinates: { lat: number; lng: number } | null;
  };
}

interface CalendarData {
  events: Event[];
  total: number;
  by_month: Record<string, Event[]>;
  by_artist: Record<string, Event[]>;
  followed_artists: Array<{
    id: string;
    artists_name: string;
    normalized_name: string;
  }>;
}

interface ArtistCalendarProps {
  userId: string;
}

export function ArtistCalendar({ userId }: ArtistCalendarProps) {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistCalendar();
  }, [userId]);

  const fetchArtistCalendar = async () => {
    try {
      const response = await fetch('/api/profile/artists/calendar');
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Error fetching artist calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
        <span className="ml-3 text-gray-500">Loading calendar...</span>
      </div>
    );
  }

  if (!calendarData || calendarData.total === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
        <p className="text-gray-500 mb-4">
          Your followed artists don&apos;t have any upcoming events scheduled yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{calendarData.total}</p>
              <p className="text-sm text-gray-600">Upcoming Events</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Music className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {calendarData.followed_artists.length}
              </p>
              <p className="text-sm text-gray-600">Active Artists</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(calendarData.by_month).length}
              </p>
              <p className="text-sm text-gray-600">Active Months</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Calendar */}
      <div className="space-y-6">
        {Object.entries(calendarData.by_month).map(([month, events]) => (
          <Card key={month}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {month}
                <Badge variant="outline" className="ml-auto">
                  {events.length} events
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Event Image/Icon */}
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-center flex-shrink-0">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-primary-foreground" />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {event.name}
                      </h4>
                      <p className="text-sm text-primary font-medium">
                        {event.artist.artists_name}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {event.venue.name}, {event.venue.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(event.date), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>
                      {event.genre && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {event.genre}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline">
                        View Event
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
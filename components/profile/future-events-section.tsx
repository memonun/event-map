'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileEventCard } from "@/components/profile/profile-event-card";

interface UpcomingEvent {
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

interface FutureEventsSectionProps {
  userId: string;
}

export function FutureEventsSection({ userId }: FutureEventsSectionProps) {
  const router = useRouter();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<{
    going: UpcomingEvent[];
    interested: UpcomingEvent[];
    maybe: UpcomingEvent[];
  }>({ going: [], interested: [], maybe: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'going' | 'interested' | 'maybe'>('all');

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('/api/profile/events/upcoming');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
          setGroupedEvents(data.groupedEvents || { going: [], interested: [], maybe: [] });
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'bg-green-100 text-green-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'maybe': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'going': return 'Going';
      case 'interested': return 'Interested';
      case 'maybe': return 'Maybe';
      default: return status;
    }
  };

  const getFilteredEvents = () => {
    if (filter === 'all') return events;
    return groupedEvents[filter] || [];
  };

  const filteredEvents = getFilteredEvents();

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Future Events</h2>
            <p className="text-sm text-gray-500">
              Events you&apos;re planning to attend
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="going">Going ({groupedEvents.going.length})</SelectItem>
              <SelectItem value="interested">Interested ({groupedEvents.interested.length})</SelectItem>
              <SelectItem value="maybe">Maybe ({groupedEvents.maybe.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            <span className="ml-3 text-gray-500">Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? "You haven&apos;t added any events to your watchlist yet." 
                : `No events marked as "${getStatusLabel(filter).toLowerCase()}".`
              }
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Summary */}
            {filter === 'all' && (
              <div className="flex gap-2 mb-6">
                <Badge variant="secondary" className={getStatusColor('going')}>
                  Going: {groupedEvents.going.length}
                </Badge>
                <Badge variant="secondary" className={getStatusColor('interested')}>
                  Interested: {groupedEvents.interested.length}
                </Badge>
                <Badge variant="secondary" className={getStatusColor('maybe')}>
                  Maybe: {groupedEvents.maybe.length}
                </Badge>
              </div>
            )}

            {/* Events Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <ProfileEventCard
                  key={event.event_id}
                  event={event}
                  showStatus={filter === 'all'}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
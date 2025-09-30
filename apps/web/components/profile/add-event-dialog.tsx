'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Music,
  Loader2,
  Check,
  Heart,
  Clock,
  Star
} from 'lucide-react';
import type { EventWithVenue } from '@/lib/types';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'attended', label: 'Attended', icon: Check, color: 'bg-green-500' },
  { value: 'missed', label: 'Missed', icon: Clock, color: 'bg-red-500' },
  { value: 'wish_went', label: 'Wish I Went', icon: Heart, color: 'bg-purple-500' },
  { value: 'going', label: 'Going', icon: Star, color: 'bg-blue-500' },
] as const;

export function AddEventDialog({ open, onOpenChange, onEventAdded }: AddEventDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [addingEventIds, setAddingEventIds] = useState<Set<string>>(new Set());

  // Debounced search function
  const performSearch = useCallback(async (query: string, genre: string, city: string) => {
    if (!query.trim() && !genre && !city) {
      setEvents([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      if (genre) params.append('genre', genre);
      if (city) params.append('city', city);
      params.append('limit', '50');

      const response = await fetch(`/api/events/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
      } else {
        console.error('Search failed:', data.error);
        setEvents([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      performSearch(searchQuery, selectedGenre, selectedCity);
    }, 300);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery, selectedGenre, selectedCity, performSearch]);

  // Handle adding event to profile
  const handleAddEvent = async (event: EventWithVenue, status: string) => {
    setAddingEventIds(prev => new Set(prev).add(event.id));

    try {
      const response = await fetch('/api/profile/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Event added to profile:', data.message);
        onEventAdded?.();
        // Remove the event from search results
        setEvents(prev => prev.filter(e => e.id !== event.id));
      } else {
        console.error('Failed to add event:', data.error);
        alert(`Failed to add event: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    } finally {
      setAddingEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  };

  // Format event date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format event time
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Add Event to Profile
          </DialogTitle>
          <DialogDescription>
            Search for events to add to your profile with different status options.
          </DialogDescription>
        </DialogHeader>

        {/* Search Filters */}
        <div className="flex flex-col gap-4 p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events by name or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4">
            <Select value={selectedGenre || undefined} onValueChange={(value) => setSelectedGenre(value || '')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
                <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="indie">Indie</SelectItem>
                <SelectItem value="folk">Folk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCity || undefined} onValueChange={(value) => setSelectedCity(value || '')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="İstanbul">Istanbul</SelectItem>
                <SelectItem value="Ankara">Ankara</SelectItem>
                <SelectItem value="İzmir">Izmir</SelectItem>
                <SelectItem value="Antalya">Antalya</SelectItem>
                <SelectItem value="Bursa">Bursa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Searching events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || selectedGenre || selectedCity
                ? 'No events found. Try adjusting your search criteria.'
                : 'Start typing to search for events...'}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 truncate">
                          {event.name}
                        </h3>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatEventDate(event.date)}</span>
                            <span className="ml-2">{formatEventTime(event.date)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue?.name}</span>
                            {event.venue?.city && (
                              <span className="text-gray-400">• {event.venue.city}</span>
                            )}
                          </div>

                          {event.venue?.capacity && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{event.venue.capacity.toLocaleString()} capacity</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {event.genre && (
                            <Badge variant="secondary" className="text-xs">
                              <Music className="w-3 h-3 mr-1" />
                              {event.genre}
                            </Badge>
                          )}

                          {event.artist && event.artist.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {event.artist.slice(0, 2).join(', ')}
                              {event.artist.length > 2 && ` +${event.artist.length - 2} more`}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {STATUS_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isAdding = addingEventIds.has(event.id);

                          return (
                            <Button
                              key={option.value}
                              size="sm"
                              variant="outline"
                              disabled={isAdding}
                              onClick={() => handleAddEvent(event, option.value)}
                              className="text-xs whitespace-nowrap"
                            >
                              {isAdding ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Icon className="w-3 h-3 mr-1" />
                              )}
                              {option.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
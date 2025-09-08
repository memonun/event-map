'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Heart, Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VenueCard } from "@/components/profile/venue-card";
import { AddVenueDialog } from "@/components/profile/add-venue-dialog";

interface Venue {
  id: string;
  name: string;
  city: string | null;
  capacity: number | null;
  coordinates: { lat: number; lng: number } | null;
  upcoming_events: number;
  total_events: number;
}

interface UserProfile {
  id: string;
  preferences: {
    favorite_venues: string[];
    followed_artists: string[];
    genres: string[];
  };
}

interface YourVenuesSectionProps {
  userId: string;
  profile: UserProfile | null;
}

export function YourVenuesSection({ userId, profile: _profile }: YourVenuesSectionProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchFavoriteVenues();
  }, [userId]);

  const fetchFavoriteVenues = async () => {
    try {
      const response = await fetch('/api/profile/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues || []);
      }
    } catch (error) {
      console.error('Error fetching favorite venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVenue = async (venueId: string) => {
    try {
      const response = await fetch('/api/profile/venues', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venueId }),
      });

      if (response.ok) {
        setVenues(prev => prev.filter(v => v.id !== venueId));
      }
    } catch (error) {
      console.error('Error removing venue:', error);
    }
  };

  const handleAddVenue = async (venueId: string) => {
    try {
      const response = await fetch('/api/profile/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venueId }),
      });

      if (response.ok) {
        // Refresh the venues list
        fetchFavoriteVenues();
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error adding venue:', error);
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUpcomingEvents = venues.reduce((sum, venue) => sum + venue.upcoming_events, 0);
  const totalEvents = venues.reduce((sum, venue) => sum + venue.total_events, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{venues.length}</p>
              <p className="text-sm text-gray-600">Favorite Venues</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUpcomingEvents}</p>
              <p className="text-sm text-gray-600">Upcoming Events</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              <p className="text-sm text-gray-600">Total Events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Your Favorite Venues
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Venue
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your favorite venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Venues List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              <span className="ml-3 text-gray-500">Loading venues...</span>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No venues match your search' : 'No favorite venues yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start adding venues you love to keep track of their events'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowAddDialog(true)} variant="outline">
                  Add Your First Venue
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onRemove={() => handleRemoveVenue(venue.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Venue Dialog */}
      <AddVenueDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddVenue={handleAddVenue}
      />
    </div>
  );
}
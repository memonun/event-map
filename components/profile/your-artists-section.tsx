'use client';

import { useState, useEffect } from 'react';
import { Music, Plus, Heart, Calendar, Users, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtistCard } from "@/components/profile/artist-card";
import { ArtistCalendar } from "@/components/profile/artist-calendar";
import { AddArtistDialog } from "@/components/profile/add-artist-dialog";

interface Artist {
  id: string;
  artists_name: string;
  normalized_name: string;
  spotify_link: string | null;
  genre: string[] | null;
  upcoming_events: Array<{
    id: string;
    name: string;
    date: string;
    venue: {
      name: string;
      city: string;
    };
  }>;
  upcoming_count: number;
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

interface YourArtistsSectionProps {
  userId: string;
  profile: UserProfile | null;
}

export function YourArtistsSection({ userId, profile: _profile }: YourArtistsSectionProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('artists');

  useEffect(() => {
    fetchFollowedArtists();
  }, [userId]);

  const fetchFollowedArtists = async () => {
    try {
      const response = await fetch('/api/profile/artists');
      if (response.ok) {
        const data = await response.json();
        setArtists(data.artists || []);
      }
    } catch (error) {
      console.error('Error fetching followed artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowArtist = async (artistName: string) => {
    try {
      const response = await fetch('/api/profile/artists', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artistName }),
      });

      if (response.ok) {
        setArtists(prev => prev.filter(a => a.artists_name !== artistName));
      }
    } catch (error) {
      console.error('Error unfollowing artist:', error);
    }
  };

  const handleFollowArtist = async (artistName: string) => {
    try {
      const response = await fetch('/api/profile/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artistName }),
      });

      if (response.ok) {
        // Refresh the artists list
        fetchFollowedArtists();
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error following artist:', error);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.artists_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUpcomingEvents = artists.reduce((sum, artist) => sum + artist.upcoming_count, 0);
  const totalEvents = artists.reduce((sum, artist) => sum + artist.total_events, 0);
  const uniqueGenres = [...new Set(artists.flatMap(a => a.genre || []))].length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{artists.length}</p>
              <p className="text-sm text-gray-600">Followed Artists</p>
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

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{uniqueGenres}</p>
              <p className="text-sm text-gray-600">Genres</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Your Artists
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Follow Artist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="artists">Artists List</TabsTrigger>
              <TabsTrigger value="calendar">Artist Calendar</TabsTrigger>
            </TabsList>

            {/* Artists List Tab */}
            <TabsContent value="artists" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your followed artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Artists Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                  <span className="ml-3 text-gray-500">Loading artists...</span>
                </div>
              ) : filteredArtists.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No artists match your search' : 'No followed artists yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Start following artists to stay updated on their events'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddDialog(true)} variant="outline">
                      Follow Your First Artist
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredArtists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onUnfollow={() => handleUnfollowArtist(artist.artists_name)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Artist Calendar Tab */}
            <TabsContent value="calendar">
              <ArtistCalendar userId={userId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Artist Dialog */}
      <AddArtistDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onFollowArtist={handleFollowArtist}
      />
    </div>
  );
}
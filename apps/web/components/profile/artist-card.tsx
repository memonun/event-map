'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Calendar, ExternalLink, Heart, MoreHorizontal, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface ArtistCardProps {
  artist: Artist;
  onUnfollow: () => void;
}

export function ArtistCard({ artist, onUnfollow }: ArtistCardProps) {
  const [unfollowing, setUnfollowing] = useState(false);
  const router = useRouter();

  const handleUnfollow = async () => {
    if (unfollowing) return;
    
    setUnfollowing(true);
    try {
      await onUnfollow();
    } finally {
      setUnfollowing(false);
    }
  };

  const handleViewArtist = () => {
    // Navigate to artist page - using normalized name as slug
    router.push(`/artists/${artist.normalized_name}`);
  };

  const handleSpotifyClick = () => {
    if (artist.spotify_link) {
      window.open(artist.spotify_link, '_blank');
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-border/60">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer"
              onClick={handleViewArtist}
            >
              {artist.artists_name}
            </h3>
            {artist.genre && artist.genre.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {artist.genre.slice(0, 2).map((genre, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {artist.genre.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{artist.genre.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewArtist}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Artist Page
              </DropdownMenuItem>
              {artist.spotify_link && (
                <DropdownMenuItem onClick={handleSpotifyClick}>
                  <Music className="w-4 h-4 mr-2" />
                  Open in Spotify
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleUnfollow}
                disabled={unfollowing}
                className="text-red-600 focus:text-red-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                Unfollow Artist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Event Stats */}
        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            {artist.upcoming_count} upcoming
          </Badge>
          <Badge variant="outline">
            {artist.total_events} total events
          </Badge>
        </div>

        {/* Upcoming Events Preview */}
        {artist.upcoming_events.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-foreground mb-2">Next Events:</p>
            <div className="space-y-1">
              {artist.upcoming_events.slice(0, 2).map((event) => (
                <div key={event.id} className="text-xs text-muted-foreground">
                  <span className="font-medium">{event.name}</span>
                  <br />
                  <span>{event.venue.name}, {event.venue.city}</span>
                  <span className="text-muted-foreground/70 ml-2">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewArtist}
          >
            <Users className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
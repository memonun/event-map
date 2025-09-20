'use client';

import { useState, useEffect } from 'react';
import { Search, Music, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Artist {
  id: string;
  artists_name: string;
  normalized_name: string;
  genre: string[] | null;
  spotify_link: string | null;
}

interface AddArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollowArtist: (artistName: string) => void;
}

export function AddArtistDialog({ open, onOpenChange, onFollowArtist }: AddArtistDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      searchArtists(searchQuery);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchArtists = async (query: string) => {
    setLoading(true);
    try {
      console.log('Searching artists for:', query);

      const response = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Artist search results:', data);

      setSearchResults(data.artists || []);
    } catch (error) {
      console.error('Error searching artists:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowArtist = async (artistName: string) => {
    setFollowing(artistName);
    try {
      await onFollowArtist(artistName);
    } finally {
      setFollowing(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Follow New Artist
          </DialogTitle>
          <DialogDescription>
            Search for artists to follow and stay updated on their upcoming events and releases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search artists by name or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                <span className="ml-3 text-gray-500">Searching artists...</span>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Start typing to search for artists</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Music className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No artists found matching &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              searchResults.map((artist) => (
                <div 
                  key={artist.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {artist.artists_name}
                      </h4>
                      {artist.spotify_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(artist.spotify_link!, '_blank')}
                          className="p-1 h-auto text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {artist.genre && artist.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {artist.genre.slice(0, 3).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {artist.genre.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{artist.genre.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleFollowArtist(artist.artists_name)}
                    disabled={following === artist.artists_name}
                  >
                    {following === artist.artists_name ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-white rounded-full" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
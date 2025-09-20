'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Plus } from "lucide-react";
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

interface Venue {
  id: string;
  name: string;
  city: string | null;
  capacity: number | null;
}

interface AddVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVenue: (venueId: string) => void;
}

export function AddVenueDialog({ open, onOpenChange, onAddVenue }: AddVenueDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      searchVenues(searchQuery);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchVenues = async (query: string) => {
    setLoading(true);
    try {
      console.log('Searching venues for:', query);

      const response = await fetch(`/api/venues/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Venue search results:', data);

      setSearchResults(data.venues || []);
    } catch (error) {
      console.error('Error searching venues:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (venueId: string) => {
    setAdding(venueId);
    try {
      await onAddVenue(venueId);
    } finally {
      setAdding(null);
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
            Add Venue to Favorites
          </DialogTitle>
          <DialogDescription>
            Search for venues to add to your favorites list. Track their upcoming events and stay updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search venues by name or city..."
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
                <span className="ml-3 text-gray-500">Searching venues...</span>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Start typing to search for venues</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No venues found matching &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              searchResults.map((venue) => (
                <div 
                  key={venue.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {venue.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      {venue.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{venue.city}</span>
                        </div>
                      )}
                      {venue.capacity && (
                        <Badge variant="outline" className="text-xs">
                          {venue.capacity.toLocaleString()} capacity
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleAddVenue(venue.id)}
                    disabled={adding === venue.id}
                  >
                    {adding === venue.id ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-white rounded-full" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
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
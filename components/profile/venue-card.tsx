'use client';

import { useState } from 'react';
import { MapPin, Calendar, Users, Heart, ExternalLink, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Venue {
  id: string;
  name: string;
  city: string | null;
  capacity: number | null;
  coordinates: { lat: number; lng: number } | null;
  upcoming_events: number;
  total_events: number;
}

interface VenueCardProps {
  venue: Venue;
  onRemove: () => void;
}

export function VenueCard({ venue, onRemove }: VenueCardProps) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (removing) return;
    
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
    }
  };

  const formatCapacity = (capacity: number | null) => {
    if (!capacity) return 'Unknown';
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}k`;
    }
    return capacity.toString();
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-gray-200 hover:border-gray-300">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {venue.name}
            </h3>
            {venue.city && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-600">{venue.city}</span>
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
              <DropdownMenuItem>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleRemove}
                disabled={removing}
                className="text-red-600 focus:text-red-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                Remove from Favorites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Capacity */}
        {venue.capacity && (
          <div className="flex items-center gap-1 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatCapacity(venue.capacity)} capacity
            </span>
          </div>
        )}

        {/* Event Stats */}
        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            {venue.upcoming_events} upcoming
          </Badge>
          <Badge variant="outline" className="text-gray-700">
            {venue.total_events} total events
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            View Events
          </Button>
          {venue.coordinates && (
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
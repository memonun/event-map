import { useMemo } from 'react';
import type { CanonicalVenue } from '@/lib/types';

export interface MarkerData {
  id: string;
  venue: CanonicalVenue;
  eventCount: number;
  priority: number; // 1-4, higher = more important
  lat: number;
  lng: number;
}

export interface PositionedMarker extends MarkerData {
  offsetX: number; // Marker displacement in pixels
  offsetY: number; // Marker displacement in pixels
  isDisplaced: boolean;
}

// Simple distance calculation between two lat/lng points (approximate)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const latDiff = lat1 - lat2;
  const lngDiff = lng1 - lng2;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

// Get marker radius in map coordinate units (rough approximation)
function getMarkerRadiusInMapUnits(eventCount: number, zoom: number): number {
  const baseRadius = eventCount >= 10 ? 24 : 
                    eventCount >= 5 ? 20 : 
                    eventCount >= 2 ? 16 : 12;
  
  // Convert pixels to approximate map units based on zoom
  // This is a rough approximation - at zoom 10, 1 degree ≈ 11100m, 1px ≈ 150m
  const pixelsPerDegree = Math.pow(2, zoom) * 256 / 360;
  return (baseRadius * 2) / pixelsPerDegree; // Double radius for collision padding
}

// Simple collision resolution - move markers in cardinal directions
function resolveCollisions(markers: MarkerData[], zoom: number): PositionedMarker[] {
  const positioned: PositionedMarker[] = markers.map(marker => ({
    ...marker,
    offsetX: 0,
    offsetY: -30, // Default position above anchor
    isDisplaced: false
  }));

  // Sort by priority (highest first) - they get first choice of position
  const sortedIndices = positioned
    .map((_, index) => index)
    .sort((a, b) => positioned[b].priority - positioned[a].priority);

  // Track occupied positions to avoid double displacement
  const occupiedPositions = new Set<string>();

  for (let i = 0; i < sortedIndices.length; i++) {
    const currentIndex = sortedIndices[i];
    const current = positioned[currentIndex];
    const currentRadius = getMarkerRadiusInMapUnits(current.eventCount, zoom);

    // Check for collisions with higher priority markers (already positioned)
    let hasCollision = false;
    
    for (let j = 0; j < i; j++) {
      const otherIndex = sortedIndices[j];
      const other = positioned[otherIndex];
      const otherRadius = getMarkerRadiusInMapUnits(other.eventCount, zoom);
      
      const distance = getDistance(current.lat, current.lng, other.lat, other.lng);
      const minDistance = currentRadius + otherRadius;
      
      if (distance < minDistance) {
        hasCollision = true;
        break;
      }
    }

    if (hasCollision) {
      // Find best displacement direction
      const directions = [
        { x: 0, y: -60, key: 'N' },    // North
        { x: 40, y: -40, key: 'NE' },  // Northeast  
        { x: 60, y: 0, key: 'E' },     // East
        { x: 40, y: 40, key: 'SE' },   // Southeast
        { x: 0, y: 60, key: 'S' },     // South
        { x: -40, y: 40, key: 'SW' },  // Southwest
        { x: -60, y: 0, key: 'W' },    // West
        { x: -40, y: -40, key: 'NW' }  // Northwest
      ];

      let bestDirection = directions[0];
      let minCollisions = Infinity;

      // Try each direction and count collisions
      for (const direction of directions) {
        if (occupiedPositions.has(`${current.id}-${direction.key}`)) {
          continue; // Skip if this position is already taken
        }

        let collisionCount = 0;
        
        // Check collisions with all other markers if we moved here
        for (let k = 0; k < positioned.length; k++) {
          if (k === currentIndex) continue;
          
          const other = positioned[k];
          const distance = getDistance(current.lat, current.lng, other.lat, other.lng);
          const minDistance = (currentRadius + getMarkerRadiusInMapUnits(other.eventCount, zoom)) * 0.8;
          
          if (distance < minDistance) {
            collisionCount++;
          }
        }

        if (collisionCount < minCollisions) {
          minCollisions = collisionCount;
          bestDirection = direction;
        }
      }

      // Apply the best direction
      positioned[currentIndex] = {
        ...current,
        offsetX: bestDirection.x,
        offsetY: bestDirection.y,
        isDisplaced: true
      };

      // Mark this position as occupied
      occupiedPositions.add(`${current.id}-${bestDirection.key}`);
    }
  }

  return positioned;
}

export function useMarkerCollision(
  markers: MarkerData[],
  zoom: number
): PositionedMarker[] {
  
  return useMemo(() => {
    if (markers.length === 0) return [];
    
    // Only apply collision detection when there are multiple markers close together
    if (markers.length === 1) {
      return [{
        ...markers[0],
        offsetX: 0,
        offsetY: -30,
        isDisplaced: false
      }];
    }

    return resolveCollisions(markers, zoom);
  }, [markers, zoom]);
}

// Helper function to convert venue data to markers
export function convertToMarkers(
  venueEvents: Array<{
    venue: CanonicalVenue;
    eventCount: number;
  }>
): MarkerData[] {
  return venueEvents
    .filter(ve => ve.venue.coordinates)
    .map(ve => ({
      id: ve.venue.id,
      venue: ve.venue,
      eventCount: ve.eventCount,
      priority: ve.eventCount >= 10 ? 4 : 
               ve.eventCount >= 5 ? 3 : 
               ve.eventCount >= 2 ? 2 : 1,
      lat: ve.venue.coordinates!.lat,
      lng: ve.venue.coordinates!.lng
    }));
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { MapRef } from 'react-map-gl/mapbox';

interface ZoomBarProps {
  mapRef: React.RefObject<MapRef>;
  isRightPanelOpen: boolean;
  className?: string;
}

export function ZoomBar({ mapRef, isRightPanelOpen, className = '' }: ZoomBarProps) {
  const [currentZoom, setCurrentZoom] = useState(10);
  const [isVisible] = useState(true);

  // Zoom constraints
  const MIN_ZOOM = 5;
  const MAX_ZOOM = 18;
  const ZOOM_STEP = 0.5;

  // Update zoom level when map changes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    const handleZoomChange = () => {
      const zoom = map.getZoom();
      setCurrentZoom(Math.round(zoom * 10) / 10); // Round to 1 decimal
    };

    // Initial zoom
    handleZoomChange();

    // Listen for zoom changes
    map.on('zoom', handleZoomChange);

    return () => {
      map.off('zoom', handleZoomChange);
    };
  }, [mapRef]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const newZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);

    map.easeTo({
      zoom: newZoom,
      duration: 300
    });
  }, [mapRef, currentZoom, MAX_ZOOM]);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const newZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);

    map.easeTo({
      zoom: newZoom,
      duration: 300
    });
  }, [mapRef, currentZoom, MIN_ZOOM]);

  // Handle slider change
  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const newZoom = parseFloat(event.target.value);

    map.easeTo({
      zoom: newZoom,
      duration: 150
    });
  }, [mapRef]);

  // Handle track click for direct position setting
  const handleTrackClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const trackElement = event.currentTarget;
    const rect = trackElement.getBoundingClientRect();
    const trackHeight = rect.height;
    const clickY = event.clientY - rect.top;

    // Calculate zoom level based on click position (inverted because track is bottom-to-top)
    const percentage = Math.max(0, Math.min(1, (trackHeight - clickY) / trackHeight));
    const newZoom = MIN_ZOOM + (percentage * (MAX_ZOOM - MIN_ZOOM));

    const map = mapRef.current.getMap();
    map.easeTo({
      zoom: newZoom,
      duration: 200
    });
  }, [mapRef, MIN_ZOOM, MAX_ZOOM]);

  // Calculate slider position percentage
  const sliderPercentage = ((currentZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;

  if (!isVisible || !isRightPanelOpen) {
    return null;
  }

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${
        isRightPanelOpen ? 'translate-x-0' : 'translate-x-20'
      } ${className}`}
      style={{
        // Position on the left border of the right panel (outside edge)
        right: isRightPanelOpen ? 'calc(45% + 12px)' : 'calc(45% + 32px)',
      }}
    >
      {/* Zoom Bar Container */}
      <div className="bg-black/30 backdrop-blur-md rounded-full border border-white/20 shadow-2xl p-1.5 flex flex-col items-center gap-1.5">

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={currentZoom >= MAX_ZOOM}
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-white/30 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Zoom in"
        >
          <Plus className="w-4 h-4 stroke-2" />
        </button>

        {/* Vertical Slider Track */}
        <div
          className="relative w-4 h-24 flex items-center justify-center group cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* Track Background */}
          <div className="absolute w-0.5 h-full bg-white/40 rounded-full group-hover:bg-white/60 group-active:bg-white/80 transition-colors duration-200" />

          {/* Track Fill */}
          <div
            className="absolute w-0.5 bg-white rounded-full bottom-0 transition-all duration-200 group-hover:bg-white/90 group-active:bg-white"
            style={{ height: `${sliderPercentage}%` }}
          />

          {/* Slider Input */}
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={currentZoom}
            onChange={handleSliderChange}
            className="absolute w-24 h-4 -rotate-90 opacity-0 cursor-pointer"
            style={{ transformOrigin: 'center' }}
            title={`Zoom: ${currentZoom.toFixed(1)}x`}
          />

          {/* Slider Handle */}
          <div
            className="absolute w-3 h-3 bg-white rounded-full shadow-md border border-gray-300 transition-all duration-200 pointer-events-none group-hover:scale-110 group-hover:shadow-lg group-active:scale-125"
            style={{
              bottom: `calc(${sliderPercentage}% - 6px)`,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        </div>

        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={currentZoom <= MIN_ZOOM}
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-white/30 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Zoom out"
        >
          <Minus className="w-4 h-4 stroke-2" />
        </button>

        {/* Zoom Level Indicator */}
        <div className="mt-0.5 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-full">
          <span className="text-white text-xs font-medium">
            {currentZoom.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
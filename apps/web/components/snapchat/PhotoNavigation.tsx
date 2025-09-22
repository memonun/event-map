'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoNavigationProps {
  currentIndex: number;
  totalPhotos: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function PhotoNavigation({
  currentIndex,
  totalPhotos,
  onPrevious,
  onNext
}: PhotoNavigationProps) {
  if (totalPhotos <= 1) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Navigation Arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={onPrevious}
          className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={onNext}
          className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {Array.from({ length: totalPhotos }, (_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/40 w-6'
            }`}
          />
        ))}
      </div>

      {/* Photo Counter */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1}/{totalPhotos}
          </span>
        </div>
      </div>

      {/* Swipe Hint (Mobile) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto md:hidden">
        <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-white/80 text-xs font-medium">
            Swipe to navigate
          </span>
        </div>
      </div>

      {/* Touch Areas for Mobile Swipe */}
      <div className="absolute inset-0 flex pointer-events-auto md:pointer-events-none">
        {/* Left touch area */}
        <div
          className="w-1/3 h-full"
          onClick={onPrevious}
          aria-label="Previous photo (tap left side)"
        />

        {/* Center area - no action */}
        <div className="w-1/3 h-full pointer-events-none" />

        {/* Right touch area */}
        <div
          className="w-1/3 h-full"
          onClick={onNext}
          aria-label="Next photo (tap right side)"
        />
      </div>
    </div>
  );
}
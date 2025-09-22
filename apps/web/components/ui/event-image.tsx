'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';

interface EventImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  genre?: string | null;
}

const genreFallbackColors = {
  'Konser': 'from-purple-100 to-pink-100',
  'Stand-up': 'from-yellow-100 to-orange-100',
  'Tiyatro': 'from-red-100 to-rose-100',
  'Spor': 'from-green-100 to-emerald-100',
  'Sergi': 'from-blue-100 to-indigo-100',
  'default': 'from-gray-100 to-slate-100'
};

export function EventImage({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '',
  width,
  height,
  fill = false,
  priority = false,
  genre 
}: EventImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackGradient = genreFallbackColors[genre as keyof typeof genreFallbackColors] || genreFallbackColors.default;

  if (!src || imageError) {
    return (
      <div className={`bg-gradient-to-br ${fallbackGradient} flex items-center justify-center ${fallbackClassName}`}>
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
          {genre && (
            <span className="text-xs text-gray-500 font-medium">{genre}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${fallbackClassName}`}>
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}
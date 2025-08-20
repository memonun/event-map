'use client';

import React from 'react';

export interface SimpleMarkerPinProps {
  eventCount: number;
  priority: 'highest' | 'high' | 'medium' | 'low';
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  className?: string;
}

interface PinConfig {
  size: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  fontSize: string;
}

const PIN_CONFIGS: Record<string, PinConfig> = {
  highest: {
    size: 48,
    backgroundColor: '#dc2626', // red-600
    borderColor: '#991b1b', // red-800
    textColor: '#ffffff',
    fontSize: '16px'
  },
  high: {
    size: 40,
    backgroundColor: '#ea580c', // orange-600
    borderColor: '#c2410c', // orange-700
    textColor: '#ffffff',
    fontSize: '14px'
  },
  medium: {
    size: 32,
    backgroundColor: '#2563eb', // blue-600
    borderColor: '#1d4ed8', // blue-700
    textColor: '#ffffff',
    fontSize: '12px'
  },
  low: {
    size: 24,
    backgroundColor: '#059669', // emerald-600
    borderColor: '#047857', // emerald-700
    textColor: '#ffffff',
    fontSize: '10px'
  }
};

const SimpleMarkerPinComponent = React.memo(function SimpleMarkerPin({
  eventCount,
  priority,
  onClick,
  onHover,
  className = ''
}: SimpleMarkerPinProps) {
  const config = PIN_CONFIGS[priority];
  const { size, backgroundColor, borderColor, textColor, fontSize } = config;

  return (
    <div 
      className={`
        relative cursor-pointer select-none flex items-center justify-center
        rounded-full border-2 font-bold
        transition-all duration-200 ease-in-out
        hover:scale-110 hover:shadow-lg
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderColor,
        color: textColor,
        fontSize,
        transform: `translate(-${size/2}px, -${size/2}px)`, // Center on anchor point
        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.2)`
      }}
    >
      {eventCount}
    </div>
  );
});

export const SimpleMarkerPin = SimpleMarkerPinComponent;

// Helper function to determine pin configuration based on event count
export function getSimpleMarkerConfig(eventCount: number): {
  priority: SimpleMarkerPinProps['priority'];
} {
  if (eventCount >= 10) {
    return { priority: 'highest' };
  } else if (eventCount >= 5) {
    return { priority: 'high' };
  } else if (eventCount >= 2) {
    return { priority: 'medium' };
  } else {
    return { priority: 'low' };
  }
}
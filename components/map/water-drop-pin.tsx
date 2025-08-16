'use client';

import React, { useMemo } from 'react';

export interface WaterDropPinProps {
  eventCount: number;
  priority: 'highest' | 'high' | 'medium' | 'low';
  offsetX?: number; // Bubble displacement from anchor (in pixels)
  offsetY?: number; // Bubble displacement from anchor (in pixels)
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  className?: string;
  isDisplaced?: boolean;
}

interface PinConfig {
  bubbleRadius: number;
  color: string;
  shadowColor: string;
  textColor: string;
  fontSize: string;
}

const PIN_CONFIGS: Record<string, PinConfig> = {
  highest: {
    bubbleRadius: 24,
    color: '#dc2626', // red-600
    shadowColor: '#991b1b', // red-800
    textColor: '#ffffff',
    fontSize: '14px'
  },
  high: {
    bubbleRadius: 20,
    color: '#ea580c', // orange-600
    shadowColor: '#c2410c', // orange-700
    textColor: '#ffffff',
    fontSize: '12px'
  },
  medium: {
    bubbleRadius: 16,
    color: '#2563eb', // blue-600
    shadowColor: '#1d4ed8', // blue-700
    textColor: '#ffffff',
    fontSize: '11px'
  },
  low: {
    bubbleRadius: 12,
    color: '#059669', // emerald-600
    shadowColor: '#047857', // emerald-700
    textColor: '#ffffff',
    fontSize: '10px'
  }
};

const WaterDropPinComponent = React.memo(function WaterDropPin({
  eventCount,
  priority,
  offsetX = 0,
  offsetY = -30, // Default position above anchor
  onClick,
  onHover,
  className = '',
  isDisplaced = false
}: WaterDropPinProps) {
  // Use CSS custom properties for smooth animations
  const [currentOffsetX, setCurrentOffsetX] = React.useState(offsetX);
  const [currentOffsetY, setCurrentOffsetY] = React.useState(offsetY);

  // Smooth transition when offset changes
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentOffsetX(offsetX);
      setCurrentOffsetY(offsetY);
    }, 50); // Small delay for staggered animation effect

    return () => clearTimeout(timeout);
  }, [offsetX, offsetY]);
  const config = PIN_CONFIGS[priority];
  const { bubbleRadius, color, shadowColor, textColor, fontSize } = config;

  // Calculate SVG dimensions to contain the entire drop
  const svgWidth = Math.max(bubbleRadius * 2 + 20, Math.abs(currentOffsetX) * 2 + bubbleRadius * 2 + 20);
  const svgHeight = Math.max(bubbleRadius * 2 + 40, Math.abs(currentOffsetY) + bubbleRadius + 20);
  
  // Center the anchor point in the SVG
  const anchorX = svgWidth / 2;
  const anchorY = svgHeight - 10;
  
  // Bubble center position (using current animated values)
  const bubbleX = anchorX + currentOffsetX;
  const bubbleY = anchorY + currentOffsetY;

  // Calculate water drop path
  const waterDropPath = useMemo(() => {
    // If no displacement, create classic teardrop shape
    if (Math.abs(currentOffsetX) < 5 && Math.abs(currentOffsetY + 30) < 5) {
      return `
        M ${anchorX} ${anchorY}
        Q ${anchorX - bubbleRadius * 0.6} ${bubbleY + bubbleRadius * 0.3} ${bubbleX - bubbleRadius} ${bubbleY}
        A ${bubbleRadius} ${bubbleRadius} 0 1 1 ${bubbleX + bubbleRadius} ${bubbleY}
        Q ${anchorX + bubbleRadius * 0.6} ${bubbleY + bubbleRadius * 0.3} ${anchorX} ${anchorY}
        Z
      `;
    }

    // For displaced bubbles, create elastic tail
    const distance = Math.sqrt(currentOffsetX * currentOffsetX + currentOffsetY * currentOffsetY);
    const tailWidth = Math.max(4, bubbleRadius * 0.3 * (1 - distance / 100));
    
    // Calculate tail connection points on bubble
    const angle = Math.atan2(currentOffsetY, currentOffsetX);
    const bubbleEdgeX1 = bubbleX - Math.cos(angle + Math.PI/2) * tailWidth;
    const bubbleEdgeY1 = bubbleY - Math.sin(angle + Math.PI/2) * tailWidth;
    const bubbleEdgeX2 = bubbleX - Math.cos(angle - Math.PI/2) * tailWidth;
    const bubbleEdgeY2 = bubbleY - Math.sin(angle - Math.PI/2) * tailWidth;

    // Control points for smooth curve
    const controlDistance = distance * 0.6;
    const controlX1 = anchorX + Math.cos(angle) * controlDistance * 0.3;
    const controlY1 = anchorY + Math.sin(angle) * controlDistance * 0.3;
    const controlX2 = anchorX + Math.cos(angle) * controlDistance * 0.3;
    const controlY2 = anchorY + Math.sin(angle) * controlDistance * 0.3;

    return `
      M ${anchorX} ${anchorY}
      Q ${controlX1} ${controlY1} ${bubbleEdgeX1} ${bubbleEdgeY1}
      A ${bubbleRadius} ${bubbleRadius} 0 0 1 ${bubbleEdgeX2} ${bubbleEdgeY2}
      Q ${controlX2} ${controlY2} ${anchorX} ${anchorY}
      Z
    `;
  }, [anchorX, anchorY, bubbleX, bubbleY, bubbleRadius, currentOffsetX, currentOffsetY]);

  return (
    <div 
      className={`
        relative cursor-pointer select-none
        hover:scale-105
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      style={{
        width: svgWidth,
        height: svgHeight,
        transform: `translate(-${svgWidth/2}px, -${svgHeight}px)`, // Center on anchor point
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring animation
        '--offset-x': `${currentOffsetX}px`,
        '--offset-y': `${currentOffsetY}px`
      } as React.CSSProperties}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="absolute inset-0"
      >
        <defs>
          {/* Gradient for 3D effect */}
          <radialGradient id={`bubble-gradient-${priority}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="70%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="1" />
          </radialGradient>

          {/* Drop shadow filter */}
          <filter id={`drop-shadow-${priority}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor={shadowColor} floodOpacity="0.4"/>
          </filter>

          {/* Blur filter for displacement indication */}
          {isDisplaced && (
            <filter id={`displaced-glow-${priority}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2"/>
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"/>
            </filter>
          )}
        </defs>

        {/* Anchor point indicator (small dot) */}
        <circle
          cx={anchorX}
          cy={anchorY}
          r="2"
          fill={shadowColor}
          opacity="0.6"
        />

        {/* Main water drop shape */}
        <path
          d={waterDropPath}
          fill={`url(#bubble-gradient-${priority})`}
          stroke={isDisplaced ? '#ffffff' : 'none'}
          strokeWidth={isDisplaced ? '1' : '0'}
          strokeOpacity="0.7"
          filter={`url(#drop-shadow-${priority})`}
          style={{
            transition: 'd 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring animation for path morphing
            transformOrigin: `${anchorX}px ${anchorY}px`
          }}
        />

        {/* Highlight for glossy effect */}
        <ellipse
          cx={bubbleX - bubbleRadius * 0.3}
          cy={bubbleY - bubbleRadius * 0.3}
          rx={bubbleRadius * 0.3}
          ry={bubbleRadius * 0.2}
          fill="#ffffff"
          opacity="0.4"
        />

        {/* Event count text */}
        <text
          x={bubbleX}
          y={bubbleY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize={fontSize}
          fontWeight="bold"
          style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}
        >
          {eventCount}
        </text>

        {/* Displacement indicator line (if significantly displaced) */}
        {isDisplaced && Math.sqrt(currentOffsetX * currentOffsetX + currentOffsetY * currentOffsetY) > 20 && (
          <line
            x1={anchorX}
            y1={anchorY}
            x2={bubbleX}
            y2={bubbleY}
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Optional displacement indicator badge */}
      {isDisplaced && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white shadow-sm"
          style={{
            right: svgWidth - bubbleX - bubbleRadius - 5,
            top: bubbleY - bubbleRadius - 5
          }}
        />
      )}
    </div>
  );
});

export const WaterDropPin = WaterDropPinComponent;

// Helper function to determine pin configuration based on event count
export function getWaterDropConfig(eventCount: number): {
  priority: WaterDropPinProps['priority'];
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
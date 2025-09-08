'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from 'date-fns';

interface EventActivity {
  event_id: string;
  status: string;
  event_name: string;
  event_date: string;
  created_at: string;
}

interface StackedEventIconsProps {
  events: EventActivity[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function StackedEventIcons({ 
  events, 
  maxVisible = 4,
  size = 'sm',
  showTooltip = true 
}: StackedEventIconsProps) {
  if (!events || events.length === 0) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': 
        return {
          container: 'h-6',
          icon: 'w-6 h-6',
          text: 'text-xs',
          spacing: '-ml-2'
        };
      case 'md':
        return {
          container: 'h-8',
          icon: 'w-8 h-8',
          text: 'text-sm',
          spacing: '-ml-3'
        };
      case 'lg':
        return {
          container: 'h-10',
          icon: 'w-10 h-10',
          text: 'text-sm',
          spacing: '-ml-4'
        };
      default:
        return {
          container: 'h-6',
          icon: 'w-6 h-6',
          text: 'text-xs',
          spacing: '-ml-2'
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'ring-green-500 bg-green-100';
      case 'interested': return 'ring-blue-500 bg-blue-100';
      case 'maybe': return 'ring-yellow-500 bg-yellow-100';
      case 'attended': return 'ring-green-600 bg-green-200';
      case 'missed': return 'ring-red-500 bg-red-100';
      default: return 'ring-gray-400 bg-gray-100';
    }
  };

  const sizeClasses = getSizeClasses();
  const visibleEvents = events.slice(0, maxVisible);
  const remainingCount = Math.max(0, events.length - maxVisible);

  const generateEventIcon = (eventName: string) => {
    // Generate a simple color based on event name hash
    let hash = 0;
    for (let i = 0; i < eventName.length; i++) {
      const char = eventName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-orange-500 to-orange-600'
    ];
    
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {visibleEvents.map((event, index) => {
          const statusColors = getStatusColor(event.status);
          const gradientColors = generateEventIcon(event.event_name);
          
          return (
            <div
              key={event.event_id}
              className={`
                relative ${index > 0 ? sizeClasses.spacing : ''}
                ${showTooltip ? 'group' : ''}
              `}
              style={{ zIndex: visibleEvents.length - index }}
            >
              <Avatar className={`
                ${sizeClasses.icon} ring-2 ${statusColors} border-2 border-white
                transition-transform hover:scale-110
              `}>
                <AvatarImage src="" /> {/* Events don't have images, so this will fall back */}
                <AvatarFallback className={`bg-gradient-to-br ${gradientColors} text-white`}>
                  <Calendar className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </AvatarFallback>
              </Avatar>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  <div className="font-medium">{event.event_name}</div>
                  <div className="text-gray-300">
                    {format(new Date(event.event_date), 'MMM d')} · {event.status}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Remaining count badge */}
        {remainingCount > 0 && (
          <Badge 
            variant="secondary" 
            className={`
              ${sizeClasses.spacing} ${sizeClasses.text} 
              bg-gray-200 text-gray-600 px-2 py-1 font-medium
              border-2 border-white ring-2 ring-gray-300
            `}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Simplified version for just showing event count
export function EventCountBadge({ 
  count, 
  size = 'sm',
  color = 'blue'
}: { 
  count: number; 
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'gray';
}) {
  if (count === 0) return null;

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700 ring-blue-200';
      case 'green': return 'bg-green-100 text-green-700 ring-green-200';
      case 'purple': return 'bg-purple-100 text-purple-700 ring-purple-200';
      case 'gray': return 'bg-gray-100 text-gray-700 ring-gray-200';
      default: return 'bg-blue-100 text-blue-700 ring-blue-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1 w-6 h-6';
      case 'md': return 'text-sm px-2 py-1 w-8 h-8';
      case 'lg': return 'text-sm px-3 py-2 w-10 h-10';
      default: return 'text-xs px-2 py-1 w-6 h-6';
    }
  };

  return (
    <div className={`
      inline-flex items-center justify-center rounded-full font-semibold ring-2 ring-white
      ${getSizeClasses()} ${getColorClasses()}
    `}>
      {count > 99 ? '99+' : count}
    </div>
  );
}
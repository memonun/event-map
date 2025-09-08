'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Star, 
  HelpCircle, 
  X, 
  Heart,
  Users,
  ChevronDown,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventInteractionService, type EventStatus } from '@/lib/services/client';
import { cn } from '@/lib/utils';

interface RSVPButtonProps {
  eventId: string;
  eventDate: string;
  variant?: 'default' | 'compact' | 'large';
  showStats?: boolean;
  className?: string;
  onStatusChange?: (status: EventStatus | null) => void;
}

interface StatusOption {
  value: EventStatus | 'remove';
  label: string;
  icon: React.ReactNode;
  color: string;
}

export function RSVPButton({ 
  eventId, 
  eventDate,
  variant = 'default',
  showStats = false,
  className,
  onStatusChange
}: RSVPButtonProps) {
  const [status, setStatus] = useState<EventStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<{
    going_count: number;
    interested_count: number;
    total_engagement: number;
  } | null>(null);
  const router = useRouter();

  const isPastEvent = new Date(eventDate) < new Date();

  // Future event status options
  const futureOptions: StatusOption[] = [
    { 
      value: 'going', 
      label: 'Going', 
      icon: <Check className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600 text-white'
    },
    { 
      value: 'interested', 
      label: 'Interested', 
      icon: <Star className="w-4 h-4" />,
      color: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    { 
      value: 'maybe', 
      label: 'Maybe', 
      icon: <HelpCircle className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    { 
      value: 'not_going', 
      label: 'Not Going', 
      icon: <X className="w-4 h-4" />,
      color: 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  ];

  // Past event status options
  const pastOptions: StatusOption[] = [
    { 
      value: 'attended', 
      label: 'Attended', 
      icon: <Check className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600 text-white'
    },
    { 
      value: 'missed', 
      label: 'Missed', 
      icon: <X className="w-4 h-4" />,
      color: 'bg-gray-500 hover:bg-gray-600 text-white'
    },
    { 
      value: 'wish_went', 
      label: 'Wish I Went', 
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-red-500 hover:bg-red-600 text-white'
    }
  ];

  const options = isPastEvent ? pastOptions : futureOptions;
  const currentOption = options.find(opt => opt.value === status);

  // Load current status and stats
  useEffect(() => {
    loadStatus();
    if (showStats) {
      loadStats();
    }
  }, [eventId]);

  const loadStatus = async () => {
    const authenticated = await EventInteractionService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const userStatus = await EventInteractionService.getUserEventStatus(eventId);
      setStatus(userStatus);
    }
  };

  const loadStats = async () => {
    const eventStats = await EventInteractionService.getEventSocialStats(eventId);
    if (eventStats) {
      setStats({
        going_count: eventStats.going_count,
        interested_count: eventStats.interested_count,
        total_engagement: eventStats.going_count + eventStats.interested_count
      });
    }
  };

  const handleStatusChange = async (newStatus: EventStatus | 'remove') => {
    if (!isAuthenticated) {
      // Redirect to login
      router.push(`/auth/login?redirect=/events/${eventId}`);
      return;
    }

    setLoading(true);
    
    let success = false;
    if (newStatus === 'remove') {
      success = await EventInteractionService.setEventStatus(eventId, 'remove');
      if (success) {
        setStatus(null);
        onStatusChange?.(null);
      }
    } else {
      success = await EventInteractionService.setEventStatus(eventId, newStatus);
      if (success) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    }
    
    // Reload stats if visible
    if (showStats && success) {
      await loadStats();
    }
    
    setLoading(false);
  };

  const handleQuickAction = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/events/${eventId}`);
      return;
    }

    // Quick action logic
    if (!status) {
      // If no status, set to default (going/attended)
      const defaultStatus = isPastEvent ? 'attended' : 'going';
      await handleStatusChange(defaultStatus);
    } else {
      // If has status, open dropdown to change
      // Dropdown will handle this
    }
  };

  // Compact variant (for event cards)
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {!status ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickAction}
            disabled={loading}
            className="h-7 px-2 text-xs"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isPastEvent ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Attended?
              </>
            ) : (
              <>
                <Star className="w-3 h-3 mr-1" />
                Interested
              </>
            )}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className={cn('h-7 px-2 text-xs', currentOption?.color)}
                disabled={loading}
              >
                {currentOption?.icon}
                <span className="ml-1">{currentOption?.label}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {options.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className="cursor-pointer"
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </DropdownMenuItem>
              ))}
              {status && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('remove')}
                    className="cursor-pointer text-red-600"
                  >
                    <X className="w-4 h-4" />
                    <span className="ml-2">Remove</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {showStats && stats && stats.total_engagement > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            <Users className="w-3 h-3 inline mr-0.5" />
            {stats.total_engagement}
          </span>
        )}
      </div>
    );
  }

  // Default/Large variant (for event detail)
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        {!status ? (
          <Button
            size={variant === 'large' ? 'lg' : 'default'}
            onClick={handleQuickAction}
            disabled={loading}
            className={cn(
              isPastEvent 
                ? 'bg-gray-500 hover:bg-gray-600' 
                : 'bg-green-500 hover:bg-green-600',
              'text-white'
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isPastEvent ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Mark as Attended
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                I&apos;m Going
              </>
            )}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={variant === 'large' ? 'lg' : 'default'}
                className={cn(currentOption?.color, 'min-w-[140px]')}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  currentOption?.icon
                )}
                <span className="ml-2">{currentOption?.label}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {options.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    'cursor-pointer',
                    option.value === status && 'bg-gray-100'
                  )}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </DropdownMenuItem>
              ))}
              {status && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('remove')}
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    <span className="ml-2">Remove Status</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!isPastEvent && (
          <Button
            size={variant === 'large' ? 'lg' : 'default'}
            variant="outline"
            onClick={() => !status ? handleStatusChange('interested') : null}
            disabled={loading || !!status}
          >
            <Star className="w-4 h-4 mr-2" />
            Interested
          </Button>
        )}
      </div>

      {showStats && stats && (
        <div className="text-sm text-gray-600">
          {stats.going_count > 0 && (
            <span className="mr-3">
              <strong>{stats.going_count}</strong> going
            </span>
          )}
          {stats.interested_count > 0 && (
            <span>
              <strong>{stats.interested_count}</strong> interested
            </span>
          )}
        </div>
      )}
    </div>
  );
}
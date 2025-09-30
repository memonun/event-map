'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Check,
  Heart,
  Clock,
  Star,
  Loader2,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface EventActionButtonsProps {
  eventId: string;
  onStatusChanged?: (status: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'going', label: 'Going', icon: Check, color: 'bg-green-500 hover:bg-green-600' },
  { value: 'interested', label: 'Interested', icon: Heart, color: 'bg-red-500 hover:bg-red-600' },
  { value: 'maybe', label: 'Maybe', icon: Clock, color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 'attended', label: 'Attended', icon: Star, color: 'bg-blue-500 hover:bg-blue-600' },
] as const;

export function EventActionButtons({
  eventId,
  onStatusChanged,
  size = 'sm',
  orientation = 'horizontal',
  className = ''
}: EventActionButtonsProps) {
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check user authentication and current event status
  useEffect(() => {
    const checkUserAndStatus = async () => {
      try {
        const supabase = createClient();

        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setUser(null);
          setCheckingStatus(false);
          return;
        }

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          setCheckingStatus(false);
          return;
        }

        setUser(authUser);

        // Get current status for this event
        const { data: interaction } = await supabase
          .from('user_event_interactions')
          .select('status')
          .eq('user_id', authUser.id)
          .eq('event_id', eventId)
          .single();

        if (interaction) {
          setCurrentStatus(interaction.status);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkUserAndStatus();
  }, [eventId]);

  const handleStatusUpdate = async (status: string) => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/profile/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStatus(status);
        onStatusChanged?.(status);
        console.log('Event status updated:', status);
      } else {
        console.error('Failed to update status:', data.error);
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStatus = async () => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/profile/events?event_id=${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStatus(null);
        onStatusChanged?.(null);
        console.log('Event removed from profile');
      } else {
        console.error('Failed to remove event:', data.error);
        alert(`Failed to remove event: ${data.error}`);
      }
    } catch (error) {
      console.error('Error removing event:', error);
      alert('Failed to remove event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Show loading state while checking current status
  if (checkingStatus) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  const buttonSizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }[size];

  const iconSizeClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  const containerClass = orientation === 'horizontal'
    ? 'flex flex-wrap gap-1'
    : 'flex flex-col gap-1';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Current Status Display (if user has set a status) */}
      {currentStatus && (
        <div className="flex items-center gap-1 mb-1">
          {(() => {
            const statusOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus);
            if (!statusOption) return null;

            const Icon = statusOption.icon;
            return (
              <div className="flex items-center gap-1">
                <div className={`px-2 py-1 rounded-full text-white text-xs flex items-center gap-1 ${statusOption.color.split(' ')[0]}`}>
                  <Icon className="w-3 h-3" />
                  <span>{statusOption.label}</span>
                </div>

                {/* Remove Status Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveStatus}
                  disabled={loading}
                  className="p-1 h-6 w-6 text-gray-500 hover:text-red-500"
                  title="Remove from profile"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Action Buttons (show if no current status or allow status change) */}
      {!currentStatus && (
        <div className={containerClass}>
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = currentStatus === option.value;

            return (
              <Button
                key={option.value}
                size="sm"
                variant={isActive ? "default" : "outline"}
                disabled={loading}
                onClick={() => handleStatusUpdate(option.value)}
                className={`${buttonSizeClass} whitespace-nowrap ${
                  isActive ? option.color : 'hover:bg-gray-100'
                }`}
                title={`Mark as ${option.label}`}
              >
                {loading ? (
                  <Loader2 className={`${iconSizeClass} animate-spin mr-1`} />
                ) : (
                  <Icon className={`${iconSizeClass} mr-1`} />
                )}
                {option.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
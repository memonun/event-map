'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { StackedEventIcons } from "@/components/profile/stacked-event-icons";

interface Friend {
  friend_id: string;
  friend_profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  connection_date: string;
  recent_events: Array<{
    event_id: string;
    status: string;
    event_name: string;
    event_date: string;
    created_at: string;
  }>;
}

interface ResizableFriendsSidebarProps {
  userId: string;
}

type SidebarWidth = 'narrow' | 'medium' | 'wide';

export function ResizableFriendsSidebar({ userId }: ResizableFriendsSidebarProps) {
  const [width, setWidth] = useState<SidebarWidth>('medium');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/profile/friends');
        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends || []);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  const getWidthClass = () => {
    switch (width) {
      case 'narrow': return 'w-20';
      case 'medium': return 'w-64';
      case 'wide': return 'w-80';
      default: return 'w-64';
    }
  };

  const toggleWidth = () => {
    const widths: SidebarWidth[] = ['narrow', 'medium', 'wide'];
    const currentIndex = widths.indexOf(width);
    const nextIndex = (currentIndex + 1) % widths.length;
    setWidth(widths[nextIndex]);
  };

  const renderFriend = (friend: Friend) => {
    const { friend_profile, recent_events } = friend;
    const displayName = friend_profile.display_name || friend_profile.username;
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

    switch (width) {
      case 'narrow':
        return (
          <div key={friend.friend_id} className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Avatar className="w-10 h-10">
              <AvatarImage src={friend_profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>
        );

      case 'medium':
        return (
          <div key={friend.friend_id} className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <Avatar className="w-12 h-12">
              <AvatarImage src={friend_profile.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">@{friend_profile.username}</p>
            </div>
          </div>
        );

      case 'wide':
        return (
          <div key={friend.friend_id} className="p-4 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend_profile.avatar_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-gray-500">@{friend_profile.username}</p>
              </div>
            </div>
            {recent_events.length > 0 && (
              <div className="ml-2">
                <StackedEventIcons events={recent_events} maxVisible={3} />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${getWidthClass()} transition-all duration-300 ease-in-out`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            {width !== 'narrow' && (
              <h2 className="font-semibold text-gray-900">Friends</h2>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWidth}
            className="p-1 h-8 w-8"
            title={`Switch to ${width === 'narrow' ? 'medium' : width === 'medium' ? 'wide' : 'narrow'} view`}
          >
            {width === 'wide' ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Friends List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto"></div>
              {width !== 'narrow' && (
                <p className="text-sm text-gray-500 mt-2">Loading friends...</p>
              )}
            </div>
          ) : friends.length === 0 ? (
            <div className="p-4 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              {width !== 'narrow' && (
                <p className="text-sm text-gray-500">No friends yet</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {friends.map(renderFriend)}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {width !== 'narrow' && friends.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {friends.length} friend{friends.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Users, Plus, Check, UserCheck, MessageCircle } from 'lucide-react';
import { type FriendAtEvent } from '@/lib/services/client/friends';

interface UserAvatarOverlayProps {
  friends: FriendAtEvent[];
  maxVisible?: number;
}

export function UserAvatarOverlay({ friends, maxVisible = 4 }: UserAvatarOverlayProps) {
  const [showAllFriends, setShowAllFriends] = useState(false);

  if (!friends || friends.length === 0) return null;

  const visibleFriends = showAllFriends ? friends : friends.slice(0, maxVisible);
  const remainingCount = friends.length - maxVisible;

  // Generate random positions for avatars (but keep them consistent per user)
  const getAvatarPosition = (index: number, _total: number) => {
    const positions = [
      { top: '20%', right: '15%' },
      { top: '35%', right: '8%' },
      { top: '50%', right: '12%' },
      { top: '65%', right: '18%' },
      { top: '25%', right: '25%' },
      { top: '45%', right: '22%' },
      { top: '60%', right: '28%' },
      { top: '30%', right: '35%' }
    ];

    return positions[index % positions.length];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'going':
        return <Check className="w-3 h-3" />;
      case 'attended':
        return <UserCheck className="w-3 h-3" />;
      case 'interested':
        return <Plus className="w-3 h-3" />;
      case 'maybe':
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-green-500';
      case 'attended':
        return 'bg-blue-500';
      case 'interested':
        return 'bg-purple-500';
      case 'maybe':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Friend Avatars */}
      <div className="absolute inset-0 pointer-events-none">
        {visibleFriends.map((friend, index) => {
          const position = getAvatarPosition(index, visibleFriends.length);

          return (
            <div
              key={friend.id}
              className="absolute pointer-events-auto"
              style={position}
            >
              <div className="relative group">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer">
                  <img
                    src={friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.display_name || friend.username)}&background=random&color=fff&size=128`}
                    alt={friend.display_name || friend.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.display_name || friend.username)}&background=6366f1&color=fff&size=128`;
                    }}
                  />
                </div>

                {/* Status Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(friend.status)} rounded-full border-2 border-white flex items-center justify-center`}>
                  <div className="text-white text-xs">
                    {getStatusIcon(friend.status)}
                  </div>
                </div>

                {/* Online Status */}
                {friend.is_online && (
                  <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}

                {/* Name Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none min-w-max">
                  <div className="font-semibold">{friend.display_name || friend.username}</div>
                  <div className="text-green-300 capitalize">{friend.status}</div>
                  {friend.is_online ? (
                    <div className="text-green-400">Online now</div>
                  ) : (
                    <div className="text-gray-300">Last seen {new Date(friend.last_seen || Date.now()).toLocaleString()}</div>
                  )}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Show More Button */}
        {!showAllFriends && remainingCount > 0 && (
          <div
            className="absolute pointer-events-auto"
            style={{ top: '75%', right: '15%' }}
          >
            <button
              onClick={() => setShowAllFriends(true)}
              className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white hover:bg-black/80 transition-colors duration-200"
            >
              <span className="text-xs font-bold">+{remainingCount}</span>
            </button>
          </div>
        )}
      </div>

      {/* Friends Count Indicator */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <button
          onClick={() => setShowAllFriends(!showAllFriends)}
          className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2 text-white hover:bg-black/60 transition-colors duration-200"
        >
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{friends.length}</span>
          <span className="text-xs text-white/80">
            {friends.length === 1 ? 'friend' : 'friends'} here
          </span>
        </button>
      </div>

      {/* All Friends Modal Overlay */}
      {showAllFriends && friends.length > maxVisible && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 max-h-[80%] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Friends Here ({friends.length})
              </h3>
              <button
                onClick={() => setShowAllFriends(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.display_name || friend.username)}&background=random&color=fff&size=128`}
                        alt={friend.display_name || friend.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.display_name || friend.username)}&background=6366f1&color=fff&size=128`;
                        }}
                      />
                    </div>
                    {friend.is_online && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{friend.display_name || friend.username}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(friend.status)}`}>
                        {getStatusIcon(friend.status)}
                        {friend.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {friend.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
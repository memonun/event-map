'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialService, FriendData } from '@/lib/services/client/social';
import { Search, Users, MessageCircle, UserMinus } from 'lucide-react';
import { AddFriendDialog } from './AddFriendDialog';

interface FriendsListPanelProps {
  onFriendSelect?: (friend: FriendData['friend']) => void;
}

export function FriendsListPanel({ onFriendSelect }: FriendsListPanelProps) {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<FriendData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load friends list
  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friendsList = await SocialService.getFriends();
      setFriends(friendsList);
      setFilteredFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  // Filter friends based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = friends.filter(friend =>
        friend.friend.display_name.toLowerCase().includes(query) ||
        friend.friend.username.toLowerCase().includes(query)
      );
      setFilteredFriends(filtered);
    }
  }, [searchQuery, friends]);

  // Handle friend selection
  const handleFriendClick = (friend: FriendData['friend']) => {
    onFriendSelect?.(friend);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-zinc-500">Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Users className="w-5 h-5" />
          Friends ({friends.length})
        </h3>
        <AddFriendDialog />
      </div>

      {/* Search */}
      {friends.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
          />
        </div>
      )}

      {/* Friends list */}
      <div className="space-y-2">
        {friends.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-zinc-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <p>No friends yet</p>
              <p className="text-sm">Start by adding some friends!</p>
            </div>
            <AddFriendDialog trigger={
              <Button variant="default" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Users className="w-4 h-4 mr-2" />
                Add Your First Friend
              </Button>
            } />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No friends found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredFriends.map((friendship) => (
            <div
              key={friendship.id}
              className="flex items-center justify-between p-4 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 cursor-pointer transition-colors"
              onClick={() => handleFriendClick(friendship.friend)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={friendship.friend.avatar_url} alt={friendship.friend.display_name} />
                  <AvatarFallback>
                    {friendship.friend.display_name?.charAt(0) || friendship.friend.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{friendship.friend.display_name}</p>
                  <p className="text-sm text-zinc-400">@{friendship.friend.username}</p>
                  <p className="text-xs text-zinc-500">
                    Friends since {new Date(friendship.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement chat functionality
                    console.log('Chat with', friendship.friend.display_name);
                  }}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement remove friend functionality
                    console.log('Remove friend', friendship.friend.display_name);
                  }}
                  className="border-red-800 text-red-400 hover:bg-red-900 hover:text-red-300"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
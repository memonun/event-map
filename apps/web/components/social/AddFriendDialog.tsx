'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SocialService, UserSearchResult } from '@/lib/services/client/social';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, UserPlus, Check, Clock, Users } from 'lucide-react';

interface AddFriendDialogProps {
  trigger?: React.ReactNode;
}

export function AddFriendDialog({ trigger }: AddFriendDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestingUsers, setRequestingUsers] = useState<Set<string>>(new Set());

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search for users
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await SocialService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    searchUsers(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchUsers]);

  // Send friend request
  const handleSendRequest = async (userId: string) => {
    setRequestingUsers(prev => new Set(prev).add(userId));

    try {
      await SocialService.sendFriendRequest(userId);

      // Update the user's status in search results
      setSearchResults(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, friendship_status: 'pending' }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to send friend request:', error);
    } finally {
      setRequestingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const getStatusButton = (user: UserSearchResult) => {
    const isRequesting = requestingUsers.has(user.id);

    switch (user.friendship_status) {
      case 'accepted':
        return (
          <Button variant="outline" size="sm" disabled className="text-green-600">
            <Check className="w-4 h-4 mr-1" />
            Friends
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled className="text-orange-600">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </Button>
        );
      case 'none':
      default:
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendRequest(user.id)}
            disabled={isRequesting}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {isRequesting ? 'Sending...' : 'Add Friend'}
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friends
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isSearching && (
              <div className="text-center py-4 text-gray-500">
                Searching...
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            )}

            {!isSearching && searchQuery.length < 2 && (
              <div className="text-center py-4 text-gray-500">
                Type at least 2 characters to search
              </div>
            )}

            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url} alt={user.display_name} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0) || user.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.display_name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                {getStatusButton(user)}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
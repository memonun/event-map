'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SocialService, FriendRequestData } from '@/lib/services/client/social';
import { Check, X, Clock, Users } from 'lucide-react';

interface FriendRequestsPanelProps {
  onRequestUpdate?: () => void;
}

export function FriendRequestsPanel({ onRequestUpdate }: FriendRequestsPanelProps) {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestData[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestData[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  // Load friend requests
  const loadFriendRequests = async () => {
    setIsLoading(true);
    try {
      const [received, sent] = await Promise.all([
        SocialService.getFriendRequests('received'),
        SocialService.getFriendRequests('sent')
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  // Accept friend request
  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));

    try {
      await SocialService.acceptFriendRequest(requestId);
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      onRequestUpdate?.();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));

    try {
      await SocialService.rejectFriendRequest(requestId);
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      onRequestUpdate?.();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-zinc-500">Loading friend requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Users className="w-5 h-5" />
          Friend Requests
        </h3>
        <div className="flex bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'received'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'sent'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {currentRequests.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            {activeTab === 'received'
              ? 'No pending friend requests'
              : 'No sent friend requests'
            }
          </div>
        ) : (
          currentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.user.avatar_url} alt={request.user.display_name} />
                  <AvatarFallback>
                    {request.user.display_name?.charAt(0) || request.user.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{request.user.display_name}</p>
                  <p className="text-sm text-zinc-400">@{request.user.username}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'received' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={processingRequests.has(request.id)}
                      className="border-red-800 text-red-400 hover:bg-red-900 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={processingRequests.has(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-orange-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
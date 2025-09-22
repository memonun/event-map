'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Send, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

interface FriendRequest {
  id: string;
  user_id: string;
  requested_by: string;
  created_at: string;
  requester?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  recipient?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface FriendsData {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  stats: {
    totalFriends: number;
    pendingIncoming: number;
    pendingOutgoing: number;
  };
}

interface FriendsManagementSectionProps {
  userId: string;
}

export function FriendsManagementSection({ userId }: FriendsManagementSectionProps) {
  const [friendsData, setFriendsData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    fetchFriendsData();
  }, [userId]);

  const fetchFriendsData = async () => {
    try {
      const response = await fetch('/api/profile/friends');
      if (response.ok) {
        const data = await response.json();
        setFriendsData(data);
      }
    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // This would need to be implemented in the API
      console.log('Accept request:', requestId);
      // After success, refresh data
      fetchFriendsData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      // This would need to be implemented in the API
      console.log('Decline request:', requestId);
      // After success, refresh data
      fetchFriendsData();
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const filteredFriends = friendsData?.friends.filter(friend =>
    friend.friend_profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend_profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
        <span className="ml-3 text-gray-500">Loading friends...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {friendsData?.stats.totalFriends || 0}
              </p>
              <p className="text-sm text-gray-600">Total Friends</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {friendsData?.stats.pendingOutgoing || 0}
              </p>
              <p className="text-sm text-gray-600">Requests Sent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {friendsData?.stats.pendingIncoming || 0}
              </p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                Friends ({friendsData?.stats.totalFriends || 0})
              </TabsTrigger>
              <TabsTrigger value="incoming">
                Incoming ({friendsData?.stats.pendingIncoming || 0})
              </TabsTrigger>
              <TabsTrigger value="outgoing">
                Outgoing ({friendsData?.stats.pendingOutgoing || 0})
              </TabsTrigger>
            </TabsList>

            {/* Friends List Tab */}
            <TabsContent value="friends" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Friends Grid */}
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No friends match your search' : 'No friends yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Start connecting with other event enthusiasts'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFriends.map((friend) => (
                    <FriendCard key={friend.friend_id} friend={friend} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Incoming Requests Tab */}
            <TabsContent value="incoming">
              {friendsData?.incomingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-500">When someone sends you a friend request, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friendsData?.incomingRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="incoming"
                      onAccept={() => handleAcceptRequest(request.id)}
                      onDecline={() => handleDeclineRequest(request.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Outgoing Requests Tab */}
            <TabsContent value="outgoing">
              {friendsData?.outgoingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No outgoing requests</h3>
                  <p className="text-gray-500">Friend requests you send will appear here until they respond.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friendsData?.outgoingRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="outgoing"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  const displayName = friend.friend_profile.display_name || friend.friend_profile.username;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={friend.friend_profile.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
            <p className="text-sm text-gray-500">@{friend.friend_profile.username}</p>
          </div>
        </div>

        {friend.recent_events.length > 0 && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {friend.recent_events.length} recent events
            </Badge>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Profile
          </Button>
          <Button variant="outline" size="sm">
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FriendRequestCard({ 
  request, 
  type, 
  onAccept, 
  onDecline 
}: { 
  request: FriendRequest; 
  type: 'incoming' | 'outgoing';
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const profile = type === 'incoming' ? request.requester : request.recipient;
  const displayName = profile?.display_name || profile?.username || 'Unknown User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900">{displayName}</h4>
          <p className="text-sm text-gray-500">@{profile?.username || 'unknown'}</p>
          <p className="text-xs text-gray-400">
            {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {type === 'incoming' ? (
          <>
            <Button size="sm" variant="outline" onClick={onDecline}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={onAccept}>
              <Check className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Badge variant="outline">Pending</Badge>
        )}
      </div>
    </div>
  );
}
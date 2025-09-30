'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  Camera,
  Loader2,
  RefreshCw,
  UserCheck,
  Bell
} from 'lucide-react';
import { SocialService, type PostData } from '@/lib/services/client/social';
import { PhotoUploadDialog } from './PhotoUploadDialog';
import { FriendsListPanel } from './FriendsListPanel';
import { FriendRequestsPanel } from './FriendRequestsPanel';
import Image from 'next/image';
import { format } from 'date-fns';

interface PeoplePanelProps {
  className?: string;
}

interface GroupedPost {
  eventId: string | null;
  eventName?: string;
  eventDate?: string;
  venueName?: string;
  posts: PostData[];
}

type PeopleTab = 'feed' | 'friends' | 'requests';

export function PeoplePanel({ className = '' }: PeoplePanelProps) {
  const [activeTab, setActiveTab] = useState<PeopleTab>('feed');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [groupedPosts, setGroupedPosts] = useState<GroupedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (pageNum = 0, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }

      const newPosts = await SocialService.getFeed(20, pageNum * 20);

      if (pageNum === 0 || refresh) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 20);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Group posts by event
  const groupPostsByEvent = useCallback((posts: PostData[]) => {
    const groups = new Map<string, GroupedPost>();

    posts.forEach(post => {
      const key = post.event_id || 'no-event';

      if (!groups.has(key)) {
        groups.set(key, {
          eventId: post.event_id || null,
          eventName: post.event_name,
          eventDate: post.event_date,
          venueName: post.venue_name,
          posts: []
        });
      }

      groups.get(key)!.posts.push(post);
    });

    // Convert to array and sort by most recent post in each group
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      const aLatest = Math.max(...a.posts.map(p => new Date(p.created_at).getTime()));
      const bLatest = Math.max(...b.posts.map(p => new Date(p.created_at).getTime()));
      return bLatest - aLatest;
    });

    setGroupedPosts(sortedGroups);
  }, []);

  useEffect(() => {
    loadPosts(0);
  }, [loadPosts]);

  useEffect(() => {
    groupPostsByEvent(posts);
  }, [posts, groupPostsByEvent]);

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await SocialService.unlikePost(postId);
      } else {
        await SocialService.likePost(postId);
      }

      // Update local state optimistically
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              user_has_liked: !isLiked,
              likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1)
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    loadPosts(0, true);
  };

  const renderPostImages = (post: PostData) => {
    const images = post.image_urls || [];

    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
          <Image
            src={images[0]}
            alt={post.caption || 'Post image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      );
    }

    // Multiple images - grid layout
    return (
      <div className={`grid gap-1 rounded-lg overflow-hidden ${
        images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
      }`}>
        {images.slice(0, 4).map((url, index) => (
          <div
            key={index}
            className={`relative aspect-square ${
              images.length === 3 && index === 0 ? 'row-span-2' : ''
            }`}
          >
            <Image
              src={url}
              alt={`Post image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {images.length > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEventHeader = (group: GroupedPost) => {
    if (!group.eventId) return null;

    return (
      <div className="mb-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <h3 className="font-semibold text-white">{group.eventName}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          {group.eventDate && (
            <span>{format(new Date(group.eventDate), 'MMM dd, yyyy')}</span>
          )}
          {group.venueName && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{group.venueName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{group.posts.length} photo{group.posts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className={`h-full flex flex-col items-center justify-center bg-black text-white ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-4" />
        <p className="text-zinc-500">Loading posts...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'feed' as const, label: 'Feed', icon: Camera },
    { id: 'friends' as const, label: 'Friends', icon: UserCheck },
    { id: 'requests' as const, label: 'Requests', icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return <FriendsListPanel />;
      case 'requests':
        return <FriendRequestsPanel onRequestUpdate={() => {
          // Refresh when requests are updated
          if (activeTab === 'feed') {
            handleRefresh();
          }
        }} />;
      case 'feed':
      default:
        return renderFeedContent();
    }
  };

  const renderFeedContent = () => {
    if (error) {
      return (
        <div className="p-4 m-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPosts(0)}
            className="mt-2 border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (groupedPosts.length === 0 && !loading && !error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
          <Camera className="w-16 h-16 mb-4 text-zinc-600" />
          <h3 className="text-lg font-medium mb-2 text-white">No posts yet</h3>
          <p className="text-center text-sm px-4">
            When your friends share photos from events, they&apos;ll appear here.
          </p>
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            Share the first photo
          </Button>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-8">
        {groupedPosts.map((group, groupIndex) => (
          <div key={group.eventId || `no-event-${groupIndex}`}>
            {renderEventHeader(group)}

            <div className="space-y-6">
              {group.posts.map((post) => (
                <Card key={post.id} className="p-4 bg-zinc-900 border-zinc-800">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <img
                          src={post.avatar_url || '/default-avatar.png'}
                          alt={post.display_name || post.username}
                          className="w-full h-full object-cover"
                        />
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">
                          {post.display_name || post.username}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {format(new Date(post.created_at), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Post Images */}
                  {renderPostImages(post)}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id, !!post.user_has_liked)}
                        className={`${post.user_has_liked ? 'text-red-500' : 'text-zinc-400'} hover:text-white hover:bg-zinc-800`}
                      >
                        <Heart className={`w-5 h-5 mr-1 ${
                          post.user_has_liked ? 'fill-current' : ''
                        }`} />
                        {post.likes_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <MessageCircle className="w-5 h-5 mr-1" />
                        {post.comments_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <Share className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="mt-3">
                      <p className="text-white">
                        <span className="font-semibold mr-2">
                          {post.display_name || post.username}
                        </span>
                        {post.caption}
                      </p>
                    </div>
                  )}

                  {/* Post Location */}
                  {post.location && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-zinc-400">
                      <MapPin className="w-3 h-3" />
                      <span>{post.location}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center py-6">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load more posts'
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-black text-white ${className}`}>
      {/* Header with Tabs */}
      <div className="flex-shrink-0 border-b border-zinc-800">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">People</h1>
              <p className="text-zinc-400">
                {activeTab === 'feed' && 'Photos from friends at events'}
                {activeTab === 'friends' && 'Manage your friends'}
                {activeTab === 'requests' && 'Friend requests'}
              </p>
            </div>
            {activeTab === 'feed' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button onClick={() => setShowUploadDialog(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Camera className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-purple-400'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && posts.length === 0 && activeTab === 'feed' ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mr-4" />
            <p className="text-zinc-500">Loading posts...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={() => {
          setShowUploadDialog(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
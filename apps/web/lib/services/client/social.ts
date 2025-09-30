/**
 * Social media service for handling posts, likes, comments, and friends
 */

export interface PostData {
  id: string;
  user_id: string;
  event_id?: string;
  caption?: string;
  image_urls: string[];
  location?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  event_name?: string;
  event_date?: string;
  venue_name?: string;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

export interface CreatePostData {
  event_id?: string;
  caption?: string;
  image_urls: string[];
  location?: string;
  is_public?: boolean;
}

export interface FriendData {
  id: string;
  created_at: string;
  friend: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface FriendRequestData {
  id: string;
  created_at: string;
  type: 'received' | 'sent';
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface UserSearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  friendship_status: 'none' | 'pending' | 'accepted';
}

export interface CommentData {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

export class SocialService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Upload photos to Supabase Storage
   */
  static async uploadPhotos(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    const response = await fetch('/api/upload/photo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Failed to upload photos');
    }

    const data = await response.json();
    return data.urls;
  }

  /**
   * Create a new post
   */
  static async createPost(postData: CreatePostData): Promise<PostData> {
    const response = await this.fetchWithAuth('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });

    return response.post;
  }

  /**
   * Get posts feed (friends + public posts)
   */
  static async getFeed(limit = 20, offset = 0): Promise<PostData[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await this.fetchWithAuth(`/api/posts?${params}`);
    return response.posts || [];
  }

  /**
   * Like a post
   */
  static async likePost(postId: string): Promise<void> {
    await this.fetchWithAuth(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string): Promise<void> {
    await this.fetchWithAuth(`/api/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }

  /**
   * Add comment to a post
   */
  static async addComment(postId: string, content: string, parentCommentId?: string): Promise<CommentData> {
    const response = await this.fetchWithAuth(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_comment_id: parentCommentId }),
    });

    return response.comment;
  }

  /**
   * Get comments for a post
   */
  static async getComments(postId: string): Promise<CommentData[]> {
    const response = await this.fetchWithAuth(`/api/posts/${postId}/comments`);
    return response.comments || [];
  }

  /**
   * Send friend request
   */
  static async sendFriendRequest(friendUserId: string): Promise<any> {
    const response = await this.fetchWithAuth('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ friend_user_id: friendUserId }),
    });

    return response.friendship;
  }

  /**
   * Get friends list
   */
  static async getFriends(): Promise<FriendData[]> {
    const response = await this.fetchWithAuth('/api/friends');
    return response.friends || [];
  }

  /**
   * Get friend requests (received or sent)
   */
  static async getFriendRequests(type: 'received' | 'sent' = 'received'): Promise<FriendRequestData[]> {
    const params = new URLSearchParams({ type });
    const response = await this.fetchWithAuth(`/api/friends/requests?${params}`);
    return response.requests || [];
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(requestId: string): Promise<void> {
    await this.fetchWithAuth('/api/friends/requests', {
      method: 'PATCH',
      body: JSON.stringify({ request_id: requestId, action: 'accept' }),
    });
  }

  /**
   * Reject friend request
   */
  static async rejectFriendRequest(requestId: string): Promise<void> {
    await this.fetchWithAuth('/api/friends/requests', {
      method: 'PATCH',
      body: JSON.stringify({ request_id: requestId, action: 'reject' }),
    });
  }

  /**
   * Search for users to add as friends
   */
  static async searchUsers(query: string, limit = 20): Promise<UserSearchResult[]> {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    const response = await this.fetchWithAuth(`/api/users/search?${params}`);
    return response.users || [];
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(userId: string, limit = 20, offset = 0): Promise<PostData[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await this.fetchWithAuth(`/api/users/${userId}/posts?${params}`);
    return response.posts || [];
  }

  /**
   * Get event attendees (friends going to event)
   */
  static async getEventAttendees(eventId: string): Promise<any[]> {
    const response = await this.fetchWithAuth(`/api/events/${eventId}/attendees`);
    return response.attendees || [];
  }

  /**
   * Mark attendance for an event
   */
  static async updateEventAttendance(
    eventId: string,
    status: 'going' | 'interested' | 'maybe' | 'attended',
    visibility: 'public' | 'friends' | 'private' = 'friends'
  ): Promise<void> {
    await this.fetchWithAuth(`/api/events/${eventId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ status, visibility }),
    });
  }
}
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim();
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    if (limit > 50) {
      return NextResponse.json({ error: 'Maximum limit is 50' }, { status: 400 });
    }

    // Search users by username or display name (case insensitive)
    const { data: users, error: searchError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .neq('id', user.id) // Exclude current user
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit)
      .order('username', { ascending: true });

    if (searchError) {
      console.error('Error searching users:', searchError);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    // Get friend status for each found user
    const userIds = users.map(u => u.id);
    let friendStatuses: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: friendships, error: friendshipError } = await supabase
        .from('user_friends')
        .select('user_id, friend_id, status')
        .or(`and(user_id.eq.${user.id},friend_id.in.(${userIds.join(',')})),and(user_id.in.(${userIds.join(',')}),friend_id.eq.${user.id})`);

      if (!friendshipError && friendships) {
        friendships.forEach(friendship => {
          const otherUserId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
          friendStatuses[otherUserId] = friendship.status;
        });
      }
    }

    // Transform results to include friendship status
    const transformedUsers = users.map(foundUser => ({
      id: foundUser.id,
      username: foundUser.username,
      display_name: foundUser.display_name,
      avatar_url: foundUser.avatar_url,
      friendship_status: friendStatuses[foundUser.id] || 'none' // none, pending, accepted
    }));

    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length,
      query
    });
  } catch (error) {
    console.error('Error in search users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
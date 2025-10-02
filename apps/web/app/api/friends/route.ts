import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all friends (both directions where status is 'accepted')
    const { data: friends, error: friendsError } = await supabase
      .from('user_friends')
      .select(`
        id,
        created_at,
        user_id,
        friend_id,
        user_profiles!user_friends_user_id_fkey(id, username, display_name, avatar_url),
        friend_profiles:user_profiles!user_friends_friend_id_fkey(id, username, display_name, avatar_url)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }

    // Transform the data to always show the friend's profile (not current user's)
    const transformedFriends = friends.map(friendship => {
      const isCurrentUserInitiator = friendship.user_id === user.id;
      const friendProfile = isCurrentUserInitiator ? friendship.friend_profiles : friendship.user_profiles;

      return {
        id: friendship.id,
        created_at: friendship.created_at,
        friend: {
          id: friendProfile.id,
          username: friendProfile.username,
          display_name: friendProfile.display_name,
          avatar_url: friendProfile.avatar_url
        }
      };
    });

    return NextResponse.json({ friends: transformedFriends });
  } catch (error) {
    console.error('Error in get friends API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friend_user_id } = body;

    if (!friend_user_id) {
      return NextResponse.json({ error: 'Friend user ID is required' }, { status: 400 });
    }

    if (friend_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if friendship already exists (in either direction)
    const { data: existingFriendship } = await supabase
      .from('user_friends')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friend_user_id}),and(user_id.eq.${friend_user_id},friend_id.eq.${user.id})`)
      .single();

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Users are already friends' }, { status: 400 });
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
      }
    }

    // Verify target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', friend_user_id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create friend request
    const { data: friendship, error: friendshipError } = await supabase
      .from('user_friends')
      .insert({
        user_id: user.id,
        friend_id: friend_user_id,
        status: 'pending'
      })
      .select(`
        id,
        created_at,
        friend_profiles:user_profiles!user_friends_friend_id_fkey(id, username, display_name, avatar_url)
      `)
      .single();

    if (friendshipError) {
      console.error('Error creating friend request:', friendshipError);
      return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Friend request sent successfully',
      friendship: {
        id: friendship.id,
        created_at: friendship.created_at,
        friend: friendship.friend_profiles
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in send friend request API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
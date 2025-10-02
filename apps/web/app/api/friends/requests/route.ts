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
    const type = url.searchParams.get('type') || 'received'; // 'received' or 'sent'

    let query = supabase
      .from('user_friends')
      .select(`
        id,
        created_at,
        user_id,
        friend_id,
        status,
        user_profiles!user_friends_user_id_fkey(id, username, display_name, avatar_url),
        friend_profiles:user_profiles!user_friends_friend_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (type === 'received') {
      // Friend requests received by current user
      query = query.eq('friend_id', user.id);
    } else {
      // Friend requests sent by current user
      query = query.eq('user_id', user.id);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error('Error fetching friend requests:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 });
    }

    // Transform the data to show the relevant user profile
    const transformedRequests = (requests as any[]).map(request => {
      const isReceived = type === 'received';
      const relevantProfile = isReceived ? request.user_profiles : request.friend_profiles;

      return {
        id: request.id,
        created_at: request.created_at,
        type,
        user: {
          id: relevantProfile.id,
          username: relevantProfile.username,
          display_name: relevantProfile.display_name,
          avatar_url: relevantProfile.avatar_url
        }
      };
    });

    return NextResponse.json({ requests: transformedRequests });
  } catch (error) {
    console.error('Error in get friend requests API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { request_id, action } = body; // action: 'accept' or 'reject'

    if (!request_id || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "accept" or "reject"' }, { status: 400 });
    }

    // Verify the friend request exists and current user is the recipient
    const { data: friendRequest, error: requestError } = await supabase
      .from('user_friends')
      .select('id, user_id, friend_id, status')
      .eq('id', request_id)
      .eq('friend_id', user.id) // Current user must be the recipient
      .eq('status', 'pending')
      .single();

    if (requestError || !friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Update status to accepted
      const { error: updateError } = await supabase
        .from('user_friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', request_id);

      if (updateError) {
        console.error('Error accepting friend request:', updateError);
        return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Friend request accepted successfully' });
    } else {
      // Delete the request (reject)
      const { error: deleteError } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', request_id);

      if (deleteError) {
        console.error('Error rejecting friend request:', deleteError);
        return NextResponse.json({ error: 'Failed to reject friend request' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Friend request rejected successfully' });
    }
  } catch (error) {
    console.error('Error in friend request action API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
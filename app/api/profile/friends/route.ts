import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/profile/friends - Get user's friends list
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's friends using the function
    const { data: friends, error } = await supabase.rpc('get_user_friends', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error fetching friends:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get pending friend requests (incoming)
    const { data: incomingRequests, error: incomingError } = await supabase
      .from('user_connections')
      .select(`
        id,
        user_id,
        requested_by,
        created_at,
        requester:user_profiles!user_connections_requested_by_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('connected_user_id', user.id)
      .eq('status', 'pending');

    // Get outgoing friend requests
    const { data: outgoingRequests, error: outgoingError } = await supabase
      .from('user_connections')
      .select(`
        id,
        connected_user_id,
        created_at,
        recipient:user_profiles!user_connections_connected_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (incomingError) console.error('Error fetching incoming requests:', incomingError);
    if (outgoingError) console.error('Error fetching outgoing requests:', outgoingError);

    return NextResponse.json({
      friends: friends || [],
      incomingRequests: incomingRequests || [],
      outgoingRequests: outgoingRequests || [],
      stats: {
        totalFriends: friends?.length || 0,
        pendingIncoming: incomingRequests?.length || 0,
        pendingOutgoing: outgoingRequests?.length || 0
      }
    });
  } catch (error) {
    console.error('Server error in friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/profile/friends - Send friend request
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { friendId } = await request.json();

    if (!friendId || friendId === user.id) {
      return NextResponse.json({ error: 'Invalid friend ID' }, { status: 400 });
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${friendId}),and(user_id.eq.${friendId},connected_user_id.eq.${user.id})`)
      .single();

    if (existingConnection) {
      return NextResponse.json({ 
        error: 'Connection already exists',
        status: existingConnection.status 
      }, { status: 400 });
    }

    // Create friend request
    const { data, error } = await supabase
      .from('user_connections')
      .insert({
        user_id: user.id,
        connected_user_id: friendId,
        requested_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      connection: data
    });
  } catch (error) {
    console.error('Server error in friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
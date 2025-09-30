import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { event_id, status } = await request.json();

    // Validate input
    if (!event_id || !status) {
      return NextResponse.json(
        { error: 'event_id and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['going', 'interested', 'maybe', 'attended', 'missed', 'wish_went'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Check if interaction already exists
    const { data: existingInteraction } = await supabase
      .from('user_event_interactions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single();

    let result;

    if (existingInteraction) {
      // Update existing interaction
      const { data, error } = await supabase
        .from('user_event_interactions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('event_id', event_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event interaction:', error);
        return NextResponse.json(
          { error: 'Failed to update event interaction' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new interaction
      const { data, error } = await supabase
        .from('user_event_interactions')
        .insert({
          user_id: user.id,
          event_id,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event interaction:', error);
        return NextResponse.json(
          { error: 'Failed to create event interaction' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      interaction: result,
      message: existingInteraction ? 'Event status updated' : 'Event added to profile'
    });

  } catch (error) {
    console.error('Error in profile events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const event_id = searchParams.get('event_id');

    if (!event_id) {
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      );
    }

    // Delete the interaction
    const { error } = await supabase
      .from('user_event_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', event_id);

    if (error) {
      console.error('Error deleting event interaction:', error);
      return NextResponse.json(
        { error: 'Failed to remove event from profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event removed from profile'
    });

  } catch (error) {
    console.error('Error in profile events DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
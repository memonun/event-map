import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events/[eventId]/rsvp - Get user's RSVP status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ status: null, authenticated: false });
    }

    const { data: userEvent } = await supabase
      .from('user_events')
      .select('status, reminder_set, reminder_time, price_alert, price_threshold, notes')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();

    return NextResponse.json({
      authenticated: true,
      status: userEvent?.status || null,
      interaction: userEvent
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/rsvp - Set RSVP status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { status, reminder_set, reminder_time, price_alert, price_threshold, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' }, 
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['going', 'interested', 'maybe', 'not_going', 'attended', 'missed', 'wish_went'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' }, 
        { status: 400 }
      );
    }

    // Upsert the user event
    const { data, error } = await supabase
      .from('user_events')
      .upsert({
        user_id: user.id,
        event_id: eventId,
        status,
        reminder_set: reminder_set || false,
        reminder_time,
        price_alert: price_alert || false,
        price_threshold,
        notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,event_id'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/rsvp - Remove RSVP
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { error } = await supabase
      .from('user_events')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'RSVP removed'
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
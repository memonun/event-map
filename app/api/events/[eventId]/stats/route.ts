import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events/[eventId]/stats - Get event social statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    // Get event aggregates
    const { data: aggregates } = await supabase
      .from('event_aggregates')
      .select('*')
      .eq('event_id', eventId)
      .single();

    // Default values if no aggregates exist yet
    const stats = aggregates || {
      event_id: eventId,
      going_count: 0,
      interested_count: 0,
      maybe_count: 0,
      attended_count: 0,
      avg_rating: null,
      rating_count: 0,
      total_engagement: 0
    };

    // Calculate total engagement
    stats.total_engagement = (stats.going_count || 0) + 
                             (stats.interested_count || 0) + 
                             (stats.maybe_count || 0);

    // Check if current user has interacted
    const { data: { user } } = await supabase.auth.getUser();
    let userStatus = null;
    
    if (user) {
      const { data: userEvent } = await supabase
        .from('user_events')
        .select('status')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single();
      
      userStatus = userEvent?.status || null;
    }

    return NextResponse.json({
      stats,
      userStatus,
      authenticated: !!user
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
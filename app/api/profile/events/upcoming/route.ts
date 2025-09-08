import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/profile/events/upcoming - Get user's upcoming events
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's upcoming events using the function
    const { data: upcomingEvents, error } = await supabase.rpc('get_user_upcoming_events', {
      p_user_id: user.id,
      p_limit: 50
    });

    if (error) {
      console.error('Error fetching upcoming events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group events by status for better organization
    const groupedEvents = {
      going: upcomingEvents?.filter((e: any) => e.user_status === 'going') || [],
      interested: upcomingEvents?.filter((e: any) => e.user_status === 'interested') || [],
      maybe: upcomingEvents?.filter((e: any) => e.user_status === 'maybe') || []
    };

    return NextResponse.json({
      events: upcomingEvents || [],
      groupedEvents,
      total: upcomingEvents?.length || 0
    });
  } catch (error) {
    console.error('Server error in upcoming events:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
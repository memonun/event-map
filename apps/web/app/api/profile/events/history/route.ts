import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/profile/events/history - Get user's event history
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's event activity history
    const { data: eventHistory, error } = await supabase.rpc('get_user_event_activity', {
      p_user_id: user.id,
      p_limit: 100
    });

    if (error) {
      console.error('Error fetching event history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group events by status and time periods
    const groupedByStatus = {
      attended: eventHistory?.filter((e: any) => e.user_status === 'attended') || [],
      missed: eventHistory?.filter((e: any) => e.user_status === 'missed') || [],
      wish_went: eventHistory?.filter((e: any) => e.user_status === 'wish_went') || []
    };

    // Group by time periods for timeline view
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), 0, 1);
    const lastYear = new Date(now.getFullYear() - 1, 0, 1);

    const groupedByTime = {
      thisYear: eventHistory?.filter((e: any) => new Date(e.event_date) >= thisYear) || [],
      lastYear: eventHistory?.filter((e: any) => {
        const eventDate = new Date(e.event_date);
        return eventDate >= lastYear && eventDate < thisYear;
      }) || [],
      older: eventHistory?.filter((e: any) => new Date(e.event_date) < lastYear) || []
    };

    return NextResponse.json({
      events: eventHistory || [],
      groupedByStatus,
      groupedByTime,
      total: eventHistory?.length || 0,
      stats: {
        attended: groupedByStatus.attended.length,
        missed: groupedByStatus.missed.length,
        wished: groupedByStatus.wish_went.length
      }
    });
  } catch (error) {
    console.error('Server error in event history:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
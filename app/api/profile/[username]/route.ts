import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/profile/[username] - Get public user profile by username
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, bio, location, created_at')
      .eq('username', username)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Return public profile information only
    return NextResponse.json(profile);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/profile/username-check?username=example - Check username availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' }, 
        { status: 400 }
      );
    }

    // Basic username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        available: false,
        error: 'Username must be 3-20 characters, alphanumeric and underscore only'
      });
    }

    const supabase = await createClient();

    const { data: existing, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single();

    // If error and no data, username is available
    const available = !existing && error?.code === 'PGRST116';

    return NextResponse.json({
      available,
      username
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
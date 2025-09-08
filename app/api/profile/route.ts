import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/profile - Get current user profile
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { username, display_name, avatar_url, bio, location, preferences } = body;

    // Validate username if provided
    if (username) {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Username already taken' }, 
          { status: 400 }
        );
      }
    }

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (display_name !== undefined) updates.display_name = display_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (preferences !== undefined) updates.preferences = preferences;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(profile);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/profile - Create user profile (fallback if trigger fails)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists' }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, display_name, avatar_url, bio, location } = body;

    // Check if username is available
    if (username) {
      const { data: usernameExists } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username already taken' }, 
          { status: 400 }
        );
      }
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        username: username || user.email?.split('@')[0] || 'user',
        display_name,
        avatar_url,
        bio,
        location,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
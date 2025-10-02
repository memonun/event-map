import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/admin/set-admin - One-time setup to set admin role
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { adminEmail } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' }, 
        { status: 400 }
      );
    }

    // Find user by email in auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to fetch users' }, 
        { status: 500 }
      );
    }

    const targetUser = (users.users as any[]).find((u: any) => u.email === adminEmail);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User with that email not found' }, 
        { status: 404 }
      );
    }

    // Update user profile to set admin role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', targetUser.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully set ${adminEmail} as admin`,
      profile
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
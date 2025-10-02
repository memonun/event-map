import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    // Check if post exists and is accessible to user
    const { data: post, error: postError } = await supabase
      .from('user_posts')
      .select('id, user_id, is_public')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: 'Post already liked' }, { status: 400 });
    }

    // Create like
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({
        user_id: user.id,
        post_id: postId
      });

    if (likeError) {
      console.error('Error creating like:', likeError);
      return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error in like post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    // Remove like
    const { error: unlikeError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (unlikeError) {
      console.error('Error removing like:', unlikeError);
      return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error in unlike post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
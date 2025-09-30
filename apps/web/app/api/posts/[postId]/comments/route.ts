import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    postId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;

    // Check if post exists and is accessible to user
    const { data: post, error: postError } = await supabase
      .from('user_posts')
      .select('id, user_id, is_public')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get comments with user profile data
    const { data: comments, error: commentsError } = await supabase
      .from('post_comments')
      .select(`
        *,
        user_profiles!inner(username, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Transform the data to flatten user profile
    const transformedComments = comments.map(comment => ({
      ...comment,
      username: comment.user_profiles.username,
      display_name: comment.user_profiles.display_name,
      avatar_url: comment.user_profiles.avatar_url,
      user_profiles: undefined
    }));

    return NextResponse.json({ comments: transformedComments });
  } catch (error) {
    console.error('Error in get comments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const body = await request.json();
    const { content, parent_comment_id } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Comment is too long (max 2000 characters)' }, { status: 400 });
    }

    // Check if post exists and is accessible to user
    const { data: post, error: postError } = await supabase
      .from('user_posts')
      .select('id, user_id, is_public')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If replying to a comment, verify parent comment exists
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('post_comments')
        .select('id, post_id')
        .eq('id', parent_comment_id)
        .eq('post_id', postId)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('post_comments')
      .insert({
        user_id: user.id,
        post_id: postId,
        content: content.trim(),
        parent_comment_id
      })
      .select(`
        *,
        user_profiles!inner(username, display_name, avatar_url)
      `)
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Transform the data to flatten user profile
    const transformedComment = {
      ...comment,
      username: comment.user_profiles.username,
      display_name: comment.user_profiles.display_name,
      avatar_url: comment.user_profiles.avatar_url,
      user_profiles: undefined
    };

    return NextResponse.json({ comment: transformedComment }, { status: 201 });
  } catch (error) {
    console.error('Error in create comment API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
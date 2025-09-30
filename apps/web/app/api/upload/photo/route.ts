import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate files
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json({
          error: `File ${file.name} is too large. Maximum size is 10MB.`
        }, { status: 400 });
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
          error: `File ${file.name} has invalid type. Allowed types: JPEG, PNG, WebP`
        }, { status: 400 });
      }
    }

    const uploadedUrls: string[] = [];
    const timestamp = Date.now();

    // Upload each file to Supabase Storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}_${i}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('user-posts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // Clean up already uploaded files
        for (const url of uploadedUrls) {
          const path = url.split('/').pop();
          if (path) {
            await supabase.storage.from('user-posts').remove([`${user.id}/${path}`]);
          }
        }
        return NextResponse.json({
          error: `Failed to upload ${file.name}`
        }, { status: 500 });
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('user-posts')
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return NextResponse.json({
      urls: uploadedUrls,
      message: `Successfully uploaded ${files.length} file(s)`
    });

  } catch (error) {
    console.error('Error in photo upload API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export async function POST(req: Request) {
  try {
    const { bucket, paths } = await req.json();

    if (!bucket || !paths || !Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'Invalid payload. "bucket" (string) and "paths" (array) are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseService.storage.from(bucket).remove(paths);

    if (error) {
      console.error('Storage Delete Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Delete handler error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

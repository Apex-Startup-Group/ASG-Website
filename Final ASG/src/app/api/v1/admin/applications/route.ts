import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { internApplications } from '@/lib/db/schema/intern_applications';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to view candidates' } },
        { status: 401 }
      );
    }

    // Fetch all intern applications, newest first
    const applications = await db
      .select()
      .from(internApplications)
      .orderBy(desc(internApplications.createdAt));

    return NextResponse.json({
      data: applications,
    });
  } catch (err: any) {
    console.error('Failed to fetch applications for admin:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch applications' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage candidates' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing ID parameter' } },
        { status: 400 }
      );
    }

    await db.delete(internApplications).where(eq(internApplications.id, id));

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (err: any) {
    console.error('Failed to delete application:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete application' } },
      { status: 500 }
    );
  }
}

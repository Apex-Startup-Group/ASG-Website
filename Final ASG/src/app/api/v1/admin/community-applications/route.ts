import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communityMemberApplications } from '@/lib/db/schema/community_member_applications';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to view community candidates' } },
        { status: 401 }
      );
    }

    const applications = await db
      .select()
      .from(communityMemberApplications)
      .orderBy(desc(communityMemberApplications.createdAt));

    return NextResponse.json({
      data: applications,
    });
  } catch (err: any) {
    console.error('Failed to fetch community applications for admin:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch community applications' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage community candidates' } },
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

    await db.delete(communityMemberApplications).where(eq(communityMemberApplications.id, id));

    return NextResponse.json({
      success: true,
      message: 'Community application deleted successfully'
    });
  } catch (err: any) {
    console.error('Failed to delete community application:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete community application' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communityMembers } from '@/lib/db/schema/community_members';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage community members' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Expected an array of items with id and displayOrder' } },
        { status: 400 }
      );
    }

    // Run updates sequentially
    for (const item of items) {
      if (item.id && item.displayOrder !== undefined) {
        await db
          .update(communityMembers)
          .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
          .where(eq(communityMembers.id, item.id));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (err: any) {
    console.error('Failed to reorder community members:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to reorder community members' } },
      { status: 500 }
    );
  }
}

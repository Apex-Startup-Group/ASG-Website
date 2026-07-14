import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communityMembers } from '@/lib/db/schema/community_members';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const activeMembers = await db
      .select()
      .from(communityMembers)
      .where(eq(communityMembers.showOnWebsite, true))
      .orderBy(asc(communityMembers.displayOrder));

    return NextResponse.json({
      data: activeMembers,
    });
  } catch (err: any) {
    console.error('Failed to fetch public community members:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch community members' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactQueries } from '@/lib/db/schema/contact_queries';
import { createClient } from '@/lib/supabase/server';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to access this resource' } },
        { status: 401 }
      );
    }

    // Fetch up to 5 latest pending contact queries
    const pendingQueries = await db
      .select()
      .from(contactQueries)
      .where(eq(contactQueries.status, 'pending'))
      .orderBy(desc(contactQueries.createdAt))
      .limit(5);

    // Fetch total pending count
    const allPending = await db
      .select()
      .from(contactQueries)
      .where(eq(contactQueries.status, 'pending'));

    const formattedNotifications = pendingQueries.map((q) => ({
      id: q.id,
      title: `New query from ${q.name}`,
      description: q.subject,
      time: q.createdAt,
      type: 'query',
      link: '/dashboard/queries'
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        count: allPending.length
      }
    });
  } catch (err: any) {
    console.error('Failed to fetch notifications:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Notifications fetch failed' } },
      { status: 500 }
    );
  }
}

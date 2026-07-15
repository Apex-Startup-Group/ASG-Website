import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { events } from '@/lib/db/schema/events';
import { contactQueries } from '@/lib/db/schema/contact_queries';
import { createClient } from '@/lib/supabase/server';
import { ilike, or } from 'drizzle-orm';

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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: { queries: [], blogs: [], events: [] }
      });
    }

    const matchPattern = `%${query}%`;

    // Query databases in parallel
    const [matchingQueries, matchingBlogs, matchingEvents] = await Promise.all([
      db
        .select()
        .from(contactQueries)
        .where(
          or(
            ilike(contactQueries.name, matchPattern),
            ilike(contactQueries.email, matchPattern),
            ilike(contactQueries.subject, matchPattern),
            ilike(contactQueries.message, matchPattern)
          )
        )
        .limit(5),
      db
        .select()
        .from(blogs)
        .where(
          or(
            ilike(blogs.title, matchPattern),
            ilike(blogs.category, matchPattern)
          )
        )
        .limit(5),
      db
        .select()
        .from(events)
        .where(
          or(
            ilike(events.title, matchPattern),
            ilike(events.venue, matchPattern)
          )
        )
        .limit(5),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        queries: matchingQueries,
        blogs: matchingBlogs,
        events: matchingEvents
      }
    });
  } catch (err: any) {
    console.error('Failed to perform global search:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Search failed' } },
      { status: 500 }
    );
  }
}

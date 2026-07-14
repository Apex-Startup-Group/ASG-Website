import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema/events';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.scheduledDate), desc(events.createdAt));

    return NextResponse.json({ data: allEvents });
  } catch (err: any) {
    console.error('Failed to fetch admin events:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, date, venue, status, thumbnail, description, tags, registrationUrl, recapUrl } = body;

    if (!title || !date || !venue) {
      return NextResponse.json({ error: 'Title, date, and venue are required' }, { status: 400 });
    }

    const [newEvent] = await db.insert(events).values({
      title,
      type: type || 'Meetup',
      scheduledDate: new Date(date),
      venue,
      status: status || 'draft',
      thumbnailUrl: thumbnail || '',
      description: description || '',
      tags: tags || [],
    }).returning();

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create event:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, type, date, venue, status, thumbnail, description, tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (type !== undefined) updateFields.type = type;
    if (date !== undefined) updateFields.scheduledDate = new Date(date);
    if (venue !== undefined) updateFields.venue = venue;
    if (status !== undefined) updateFields.status = status;
    if (thumbnail !== undefined) updateFields.thumbnailUrl = thumbnail;
    if (description !== undefined) updateFields.description = description;
    if (tags !== undefined) updateFields.tags = tags;
    updateFields.updatedAt = new Date();

    const [updatedEvent] = await db
      .update(events)
      .set(updateFields)
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (err: any) {
    console.error('Failed to update event:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete event:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

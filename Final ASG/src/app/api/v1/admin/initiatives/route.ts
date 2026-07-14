import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initiatives } from '@/lib/db/schema/initiatives';
import { desc, asc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allInitiatives = await db
      .select()
      .from(initiatives)
      .orderBy(asc(initiatives.displayOrder), desc(initiatives.createdAt));

    return NextResponse.json({ data: allInitiatives });
  } catch (err: any) {
    console.error('Failed to fetch admin initiatives:', err);
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
    const { icon, title, shortDescription } = body;

    if (!title || !shortDescription) {
      return NextResponse.json({ error: 'Title and short description are required' }, { status: 400 });
    }

    const [newInitiative] = await db.insert(initiatives).values({
      emoji: icon || '💡',
      title,
      description: shortDescription,
      displayOrder: 0
    }).returning();

    return NextResponse.json({ success: true, data: newInitiative }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create initiative:', err);
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
    const { id, icon, title, shortDescription } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing initiative ID' }, { status: 400 });
    }

    const updateFields: any = {};
    if (icon !== undefined) updateFields.emoji = icon;
    if (title !== undefined) updateFields.title = title;
    if (shortDescription !== undefined) updateFields.description = shortDescription;
    updateFields.updatedAt = new Date();

    const [updatedInitiative] = await db
      .update(initiatives)
      .set(updateFields)
      .where(eq(initiatives.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedInitiative });
  } catch (err: any) {
    console.error('Failed to update initiative:', err);
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

    await db.delete(initiatives).where(eq(initiatives.id, id));

    return NextResponse.json({ success: true, message: 'Initiative deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete initiative:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

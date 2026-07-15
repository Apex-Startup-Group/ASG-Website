import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactQueries } from '@/lib/db/schema/contact_queries';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to view queries' } },
        { status: 401 }
      );
    }

    const queries = await db
      .select()
      .from(contactQueries)
      .orderBy(desc(contactQueries.createdAt));

    return NextResponse.json({
      data: queries,
    });
  } catch (err: any) {
    console.error('Failed to fetch contact queries for admin:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch contact queries' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to modify queries' } },
        { status: 401 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'id and status are required' } },
        { status: 400 }
      );
    }

    let dbStatus: 'pending' | 'responded' | 'closed' = 'pending';
    if (status.toLowerCase() === 'resolved' || status.toLowerCase() === 'closed') {
      dbStatus = 'closed';
    } else if (status.toLowerCase() === 'responded') {
      dbStatus = 'responded';
    }

    const [updatedQuery] = await db
      .update(contactQueries)
      .set({
        status: dbStatus
      })
      .where(eq(contactQueries.id, id))
      .returning();

    if (!updatedQuery) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Query not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedQuery
    });
  } catch (err: any) {
    console.error('Failed to update contact query status:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update contact query' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to delete queries' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'id is required' } },
        { status: 400 }
      );
    }

    // Safety check: Verify query is resolved before deleting
    const [existing] = await db
      .select()
      .from(contactQueries)
      .where(eq(contactQueries.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Query not found' } },
        { status: 404 }
      );
    }

    if (existing.status === 'pending') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot delete a pending query. Please resolve it first.' } },
        { status: 400 }
      );
    }

    await db
      .delete(contactQueries)
      .where(eq(contactQueries.id, id));

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (err: any) {
    console.error('Failed to delete contact query:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete contact query' } },
      { status: 500 }
    );
  }
}

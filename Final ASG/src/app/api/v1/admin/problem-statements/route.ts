import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { problemStatements } from '@/lib/db/schema/problem_statements';
import { desc, asc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

// GET — no auth guard, auth is handled by admin layout middleware
export async function GET(req: Request) {
  try {
    const allProblems = await db
      .select()
      .from(problemStatements)
      .orderBy(asc(problemStatements.displayOrder), desc(problemStatements.createdAt));

    return NextResponse.json({
      data: allProblems,
    });
  } catch (err: any) {
    console.error('Failed to fetch admin problem statements:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch problem statements' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage problem statements' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, status, icon } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Title and description are required' } },
        { status: 400 }
      );
    }

    const [newProblem] = await db.insert(problemStatements).values({
      title,
      description,
      icon: icon || '💡',
      status: status || 'open',
    }).returning();

    return NextResponse.json({
      success: true,
      data: newProblem
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create problem statement:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create problem statement' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage problem statements' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, title, description, status, icon } = body;

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing problem statement ID' } },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (icon !== undefined) updateFields.icon = icon;
    updateFields.updatedAt = new Date();

    const [updatedProblem] = await db
      .update(problemStatements)
      .set(updateFields)
      .where(eq(problemStatements.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedProblem
    });
  } catch (err: any) {
    console.error('Failed to update problem statement:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update problem statement' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage problem statements' } },
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

    await db.delete(problemStatements).where(eq(problemStatements.id, id));

    return NextResponse.json({
      success: true,
      message: 'Problem statement deleted successfully'
    });
  } catch (err: any) {
    console.error('Failed to delete problem statement:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete problem statement' } },
      { status: 500 }
    );
  }
}

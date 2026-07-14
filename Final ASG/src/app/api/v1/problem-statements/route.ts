import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { problemStatements } from '@/lib/db/schema/problem_statements';
import { ne } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch problem statements that are not closed
    const activeProblems = await db
      .select()
      .from(problemStatements)
      .where(ne(problemStatements.status, 'closed'));

    return NextResponse.json({
      data: activeProblems,
    });
  } catch (err: any) {
    console.error('Failed to fetch public problem statements:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch problem statements' } },
      { status: 500 }
    );
  }
}

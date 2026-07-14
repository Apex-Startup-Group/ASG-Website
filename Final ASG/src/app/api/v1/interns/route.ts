import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interns } from '@/lib/db/schema/interns';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allInterns = await db
      .select()
      .from(interns)
      .orderBy(desc(interns.createdAt));

    return NextResponse.json({
      data: allInterns,
    });
  } catch (err: any) {
    console.error('Failed to fetch public interns:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch interns' } },
      { status: 500 }
    );
  }
}

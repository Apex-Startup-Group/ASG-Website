import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { industryExperts } from '@/lib/db/schema/industry_experts';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const activeExperts = await db
      .select()
      .from(industryExperts)
      .where(eq(industryExperts.showOnWebsite, true))
      .orderBy(asc(industryExperts.displayOrder));

    return NextResponse.json({
      data: activeExperts,
    });
  } catch (err: any) {
    console.error('Failed to fetch public industry experts:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch industry experts' } },
      { status: 500 }
    );
  }
}

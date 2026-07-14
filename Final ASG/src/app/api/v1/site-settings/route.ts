import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema/site_settings';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'key is required' } },
        { status: 400 }
      );
    }

    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: settings || null
    });
  } catch (err: any) {
    console.error('Failed to get site settings:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to get site settings' } },
      { status: 500 }
    );
  }
}

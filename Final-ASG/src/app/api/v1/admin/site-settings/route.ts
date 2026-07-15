import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema/site_settings';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';

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

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to access this resource' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'key and value are required' } },
        { status: 400 }
      );
    }

    // Upsert key-value pair in site_settings
    await db
      .insert(siteSettings)
      .values({
        key,
        value,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value,
          updatedAt: new Date()
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully'
    });
  } catch (err: any) {
    console.error('Failed to save site settings:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to save site settings' } },
      { status: 500 }
    );
  }
}

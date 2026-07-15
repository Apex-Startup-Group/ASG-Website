import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { industryPartners } from '@/lib/db/schema/industry_partners';
import { desc, asc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allPartners = await db
      .select()
      .from(industryPartners)
      .orderBy(asc(industryPartners.displayOrder), desc(industryPartners.createdAt));

    return NextResponse.json({ data: allPartners });
  } catch (err: any) {
    console.error('Failed to fetch admin partners:', err);
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
    const { name, logo, websiteUrl, linkedinUrl, showOnWebsite } = body;

    if (!name || !websiteUrl) {
      return NextResponse.json({ error: 'Name and website URL are required' }, { status: 400 });
    }

    const [newPartner] = await db.insert(industryPartners).values({
      name,
      logo: logo || '',
      websiteUrl,
      linkedinUrl: linkedinUrl || null,
      showOnWebsite: showOnWebsite !== undefined ? showOnWebsite : true,
      displayOrder: 0
    }).returning();

    return NextResponse.json({ success: true, data: newPartner }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create partner:', err);
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
    const { id, name, logo, websiteUrl, linkedinUrl, showOnWebsite } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 });
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (logo !== undefined) updateFields.logo = logo;
    if (websiteUrl !== undefined) updateFields.websiteUrl = websiteUrl;
    if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl;
    if (showOnWebsite !== undefined) updateFields.showOnWebsite = showOnWebsite;
    updateFields.updatedAt = new Date();

    const [updatedPartner] = await db
      .update(industryPartners)
      .set(updateFields)
      .where(eq(industryPartners.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedPartner });
  } catch (err: any) {
    console.error('Failed to update partner:', err);
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

    await db.delete(industryPartners).where(eq(industryPartners.id, id));

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete partner:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

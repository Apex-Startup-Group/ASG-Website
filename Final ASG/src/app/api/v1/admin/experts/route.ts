import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { industryExperts } from '@/lib/db/schema/industry_experts';
import { desc, asc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allExperts = await db
      .select()
      .from(industryExperts)
      .orderBy(asc(industryExperts.displayOrder), desc(industryExperts.createdAt));

    return NextResponse.json({ data: allExperts });
  } catch (err: any) {
    console.error('Failed to fetch admin experts:', err);
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
    const { name, photo, designation, company, domain, linkedinUrl, websiteUrl, bio, showOnWebsite } = body;

    if (!name || !designation || !company || !domain) {
      return NextResponse.json({ error: 'Name, designation, company, and domain are required' }, { status: 400 });
    }

    const [newExpert] = await db.insert(industryExperts).values({
      name,
      photo: photo || '',
      designation,
      company,
      domain,
      linkedinUrl: linkedinUrl || null,
      websiteUrl: websiteUrl || null,
      bio: bio || '',
      showOnWebsite: showOnWebsite !== undefined ? showOnWebsite : true,
      displayOrder: 0
    }).returning();

    return NextResponse.json({ success: true, data: newExpert }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create expert:', err);
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
    const { id, name, photo, designation, company, domain, linkedinUrl, websiteUrl, bio, showOnWebsite } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing expert ID' }, { status: 400 });
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (photo !== undefined) updateFields.photo = photo;
    if (designation !== undefined) updateFields.designation = designation;
    if (company !== undefined) updateFields.company = company;
    if (domain !== undefined) updateFields.domain = domain;
    if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) updateFields.websiteUrl = websiteUrl;
    if (bio !== undefined) updateFields.bio = bio;
    if (showOnWebsite !== undefined) updateFields.showOnWebsite = showOnWebsite;
    updateFields.updatedAt = new Date();

    const [updatedExpert] = await db
      .update(industryExperts)
      .set(updateFields)
      .where(eq(industryExperts.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedExpert });
  } catch (err: any) {
    console.error('Failed to update expert:', err);
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

    await db.delete(industryExperts).where(eq(industryExperts.id, id));

    return NextResponse.json({ success: true, message: 'Expert deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete expert:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

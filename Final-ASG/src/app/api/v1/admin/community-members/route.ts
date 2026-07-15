import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communityMembers } from '@/lib/db/schema/community_members';
import { desc, asc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { deleteStorageFile } from '@/lib/supabase/service';

const typeClientToDb = (type: string) => {
  switch (type) {
    case 'Founder': return 'founder';
    case 'Mentor': return 'mentor';
    case 'Investor': return 'investor';
    case 'Service Provider': return 'service_provider';
    default: return 'member';
  }
};

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to view community members' } },
        { status: 401 }
      );
    }

    const allMembers = await db
      .select()
      .from(communityMembers)
      .orderBy(asc(communityMembers.displayOrder), desc(communityMembers.createdAt));

    return NextResponse.json({
      data: allMembers,
    });
  } catch (err: any) {
    console.error('Failed to fetch admin community members:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch community members' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage community members' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      photo,
      designation,
      company,
      type,
      linkedinUrl,
      websiteUrl,
      bio,
      showOnWebsite,
      email,
      phone
    } = body;

    if (!name || !designation || !company) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name, designation, and company are required' } },
        { status: 400 }
      );
    }

    const [newMember] = await db.insert(communityMembers).values({
      name,
      photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      designation,
      company,
      memberType: typeClientToDb(type),
      linkedinUrl: linkedinUrl || null,
      websiteUrl: websiteUrl || null,
      bio: bio || '',
      showOnWebsite: showOnWebsite !== undefined ? showOnWebsite : true,
      displayOrder: 0
    }).returning();

    return NextResponse.json({
      success: true,
      data: newMember
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create community member:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create community member' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage community members' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      id,
      name,
      photo,
      designation,
      company,
      type,
      linkedinUrl,
      websiteUrl,
      bio,
      showOnWebsite,
      email,
      phone
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing member ID' } },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (photo !== undefined) updateFields.photo = photo;
    if (designation !== undefined) updateFields.designation = designation;
    if (company !== undefined) updateFields.company = company;
    if (type !== undefined) updateFields.memberType = typeClientToDb(type);
    if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) updateFields.websiteUrl = websiteUrl;
    if (bio !== undefined) updateFields.bio = bio;
    if (showOnWebsite !== undefined) updateFields.showOnWebsite = showOnWebsite;
    updateFields.updatedAt = new Date();

    const [updatedMember] = await db
      .update(communityMembers)
      .set(updateFields)
      .where(eq(communityMembers.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedMember
    });
  } catch (err: any) {
    console.error('Failed to update community member:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update community member' } },
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
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage community members' } },
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

    // Fetch the community member's details to get their photo URL
    const existingMember = await db
      .select({ photo: communityMembers.photo })
      .from(communityMembers)
      .where(eq(communityMembers.id, id))
      .limit(1);

    if (existingMember.length > 0 && existingMember[0].photo) {
      await deleteStorageFile(existingMember[0].photo, 'avatars');
    }

    await db.delete(communityMembers).where(eq(communityMembers.id, id));

    return NextResponse.json({
      success: true,
      message: 'Community member deleted successfully'
    });
  } catch (err: any) {
    console.error('Failed to delete community member:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete community member' } },
      { status: 500 }
    );
  }
}

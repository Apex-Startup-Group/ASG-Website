import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communityMemberApplications } from '@/lib/db/schema/community_member_applications';
import { communityMembers } from '@/lib/db/schema/community_members';
import { eq, or } from 'drizzle-orm';

const mapRoleToApplicantType = (role: string): 'founder' | 'mentor' | 'investor' | 'service_provider' | 'industry_expert' | 'partner' => {
  if (role === 'founders') return 'founder';
  if (role === 'mentors') return 'mentor';
  if (role === 'investors') return 'investor';
  if (role === 'service-providers') return 'service_provider';
  return 'founder'; // default fallback for 'other'
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      role,
      socialLinks,
      company,
      companyWebsite,
      description,
      photoUrl,
      otherRoleDetails,
      designation
    } = body;

    // Validation checks
    if (!name || !email || !phone || !role || !company || !description || !photoUrl) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Check for existing duplicates in community_member_applications
    const existing = await db
      .select()
      .from(communityMemberApplications)
      .where(
        or(
          eq(communityMemberApplications.email, email),
          eq(communityMemberApplications.phone, phone)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      const duplicateField = record.email.toLowerCase() === email.toLowerCase() ? 'Email Address' : 'Phone Number';
      return NextResponse.json(
        { error: { code: 'DUPLICATE_ERROR', message: `A community application with this ${duplicateField} already exists.` } },
        { status: 400 }
      );
    }



    // Map fields for insertion to match non-nullable database columns
    const applicantType = mapRoleToApplicantType(role);
    const linkedinUrl = (socialLinks || []).find((l: string) => l.toLowerCase().includes('linkedin.com')) || null;
    const websiteUrl = companyWebsite || null;
    const finalDesignation = designation || otherRoleDetails || role || 'Member';
    const expertise = description;
    const motivation = description;

    const [newApplication] = await db.insert(communityMemberApplications).values({
      fullName: name,
      email,
      phone,
      company,
      designation: finalDesignation,
      applicantType,
      websiteUrl,
      linkedinUrl,
      expertise,
      motivation,
      photoUrl,
      status: 'pending'
    }).returning();

    return NextResponse.json(
      { success: true, data: newApplication },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to save community application:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to submit application' } },
      { status: 500 }
    );
  }
}

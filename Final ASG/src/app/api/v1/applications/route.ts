import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { internApplications } from '@/lib/db/schema/intern_applications';
import { interns } from '@/lib/db/schema/interns';

import { eq, or } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Server-side extraction and normalization
    const {
      name,
      email,
      phone,
      college,
      degree,
      year,
      aiToolsUsed,
      linkedin,
      github,
      project,
      notes,
      photoUrl,
      internStatus
    } = body;

    // Simple server-side validation
    if (!name || !email || !phone || !college || !degree || !year || !linkedin || !photoUrl) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // 1. Check for existing duplicates in intern_applications
    const conditions = [
      eq(internApplications.email, email),
      eq(internApplications.phone, phone),
      eq(internApplications.linkedinUrl, linkedin),
    ];

    if (github && github.trim() !== '') {
      conditions.push(eq(internApplications.githubUrl, github));
    }

    const existingApp = await db
      .select()
      .from(internApplications)
      .where(or(...conditions))
      .limit(1);

    if (existingApp.length > 0) {
      const record = existingApp[0];
      let duplicateField = 'application details';
      if (record.email.toLowerCase() === email.toLowerCase()) duplicateField = 'Email Address';
      else if (record.phone === phone) duplicateField = 'Phone Number';
      else if (record.linkedinUrl?.toLowerCase() === linkedin.toLowerCase()) duplicateField = 'LinkedIn Profile';
      else if (record.githubUrl && github && record.githubUrl.toLowerCase() === github.toLowerCase()) duplicateField = 'GitHub Link';

      return NextResponse.json(
        { error: { code: 'DUPLICATE_ERROR', message: `An internship application with this ${duplicateField} already exists.` } },
        { status: 400 }
      );
    }

    // 2. Check for duplicates in active/completed interns
    const internConditions = [
      eq(interns.email, email),
      eq(interns.phone, phone),
      eq(interns.linkedinUrl, linkedin),
    ];

    if (github && github.trim() !== '') {
      internConditions.push(eq(interns.githubUrl, github));
    }

    const existingIntern = await db
      .select()
      .from(interns)
      .where(or(...internConditions))
      .limit(1);

    if (existingIntern.length > 0) {
      const record = existingIntern[0];
      let duplicateField = 'intern details';
      if (record.email && record.email.toLowerCase() === email.toLowerCase()) duplicateField = 'Email Address';
      else if (record.phone && record.phone === phone) duplicateField = 'Phone Number';
      else if (record.linkedinUrl && record.linkedinUrl.toLowerCase() === linkedin.toLowerCase()) duplicateField = 'LinkedIn Profile';
      else if (record.githubUrl && github && record.githubUrl.toLowerCase() === github.toLowerCase()) duplicateField = 'GitHub Link';

      return NextResponse.json(
        { error: { code: 'DUPLICATE_ERROR', message: `An active or completed intern with this ${duplicateField} is already registered.` } },
        { status: 400 }
      );
    }

    // Insert into Supabase database via Drizzle ORM
    const [newApplication] = await db.insert(internApplications).values({
      fullName: name,
      email,
      phone,
      college,
      branch: degree,
      year,
      skills: aiToolsUsed || '',
      linkedinUrl: linkedin,
      githubUrl: github || null,
      portfolioUrl: null, // Optional for AAL
      resumeUrl: null, // Optional for AAL
      photoUrl: photoUrl || null,
      preferredDomain: project || 'General',
      motivation: notes || '',
      status: 'pending',
      isExistingIntern: internStatus === 'existing',
    }).returning();

    return NextResponse.json(
      { success: true, data: newApplication },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to create application:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to submit application' } },
      { status: 500 }
    );
  }
}

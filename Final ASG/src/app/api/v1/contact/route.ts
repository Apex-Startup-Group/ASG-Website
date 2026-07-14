import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactQueries } from '@/lib/db/schema/contact_queries';

import { eq, or } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, role } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name, email, and message are required' } },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid email address' } },
        { status: 400 }
      );
    }

    // Phone validation
    if (phone && phone.trim() !== '') {
      const sanitizedPhone = phone.replace(/[\s-()]/g, "");
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(sanitizedPhone)) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9' } },
          { status: 400 }
        );
      }
    }

    // Check for existing duplicates in contact_queries
    const conditions = [
      eq(contactQueries.email, email)
    ];

    if (phone && phone.trim() !== '') {
      conditions.push(eq(contactQueries.phone, phone));
    }

    const existing = await db
      .select()
      .from(contactQueries)
      .where(or(...conditions))
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      let duplicateField = 'Email Address';
      if (record.phone && phone && record.phone === phone) {
        duplicateField = 'Phone Number';
      }

      return NextResponse.json(
        { error: { code: 'DUPLICATE_ERROR', message: `A contact query with this ${duplicateField} already exists.` } },
        { status: 400 }
      );
    }

    // Map phone and role context into the subject field required by the database schema
    const subject = `${role || 'General'} Inquiry (${phone || 'No phone'})`;

    const [newQuery] = await db.insert(contactQueries).values({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: 'pending'
    }).returning();

    return NextResponse.json(
      { success: true, data: newQuery },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to save contact query:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to submit contact query' } },
      { status: 500 }
    );
  }
}

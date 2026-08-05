'use server';

import { revalidatePath } from 'next/cache';
import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/db/schema/testimonials';

export interface TestimonialInput {
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating?: number;
  status?: 'Active' | 'Inactive';
  displayOrder?: number;
}

export interface TestimonialRecord {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  status: 'Active' | 'Inactive';
  showOnWebsite: boolean;
  displayOrder: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function toTestimonialRecord(row: any): TestimonialRecord {
  const showOnWebsite = row.status ? row.status === 'Active' : Boolean(row.showOnWebsite);

  return {
    id: String(row.id),
    name: row.name || '',
    role: row.role || '',
    company: row.company || '',
    avatar: row.avatar || '',
    content: row.content || '',
    rating: typeof row.rating === 'number' ? row.rating : 5,
    status: showOnWebsite ? 'Active' : 'Inactive',
    showOnWebsite,
    displayOrder: row.displayOrder ?? 0,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

export async function getTestimonialsAction(options?: { publicOnly?: boolean }): Promise<TestimonialRecord[]> {
  const publicOnly = options?.publicOnly ?? false;

  const rows = await db
    .select()
    .from(testimonials)
    .where(publicOnly ? eq(testimonials.status, 'Active') : undefined)
    .orderBy(asc(testimonials.displayOrder), desc(testimonials.createdAt));

  return rows.map(toTestimonialRecord);
}

export async function createTestimonialAction(input: TestimonialInput): Promise<TestimonialRecord> {
  const values = {
    name: (input.name || '').trim(),
    role: (input.role || '').trim(),
    company: (input.company || '').trim(),
    avatar: (input.avatar || '').trim(),
    content: (input.content || '').trim(),
    rating: input.rating ?? 5,
    status: input.status || 'Active',
    displayOrder: input.displayOrder ?? 0,
    showOnWebsite: input.status !== 'Inactive',
  };

  if (!values.name || !values.role || !values.content) {
    throw new Error('Name, role, and content are required.');
  }

  const [created] = await db.insert(testimonials).values(values).returning();

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');

  return toTestimonialRecord(created);
}

export async function updateTestimonialAction(id: string, input: Partial<TestimonialInput>): Promise<TestimonialRecord> {
  if (!id) {
    throw new Error('Testimonial id is required.');
  }

  const values: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (typeof input.name === 'string') values.name = input.name.trim();
  if (typeof input.role === 'string') values.role = input.role.trim();
  if (typeof input.company === 'string') values.company = input.company.trim();
  if (typeof input.avatar === 'string') values.avatar = input.avatar.trim();
  if (typeof input.content === 'string') values.content = input.content.trim();
  if (typeof input.rating === 'number') values.rating = input.rating;
  if (typeof input.status === 'string') {
    values.status = input.status;
    values.showOnWebsite = input.status === 'Active';
  }
  if (typeof input.displayOrder === 'number') values.displayOrder = input.displayOrder;

  const [updated] = await db.update(testimonials).set(values).where(eq(testimonials.id, id)).returning();

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');

  return toTestimonialRecord(updated);
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  if (!id) {
    throw new Error('Testimonial id is required.');
  }

  await db.delete(testimonials).where(eq(testimonials.id, id));

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');
}

export async function toggleTestimonialStatusAction(id: string, status?: 'Active' | 'Inactive'): Promise<TestimonialRecord> {
  const nextStatus = status ?? 'Active';
  return updateTestimonialAction(id, { status: nextStatus });
}

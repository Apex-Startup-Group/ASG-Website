'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { industryExperts } from '@/db/schema/ecosystem';

export interface ExpertInput {
  name: string;
  role?: string;
  designation?: string;
  company?: string;
  description?: string;
  bio?: string;
  photo?: string;
  socialLinks?: string[];
  currentProblemStatement?: string;
  status?: 'Active' | 'Inactive';
  displayOrder?: number;
}

export interface ExpertRecord {
  id: string;
  name: string;
  role: string;
  designation: string;
  company: string;
  description: string;
  socialLinks: string[];
  currentProblemStatement: string;
  photo: string;
  bio: string;
  status: 'Active' | 'Inactive';
  showOnWebsite: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function toExpertRecord(row: any): ExpertRecord {
  const showOnWebsite = Boolean(row.showOnWebsite);
  const socialLinks = [row.linkedinUrl, row.websiteUrl].filter(Boolean) as string[];

  return {
    id: row.id,
    name: row.name,
    role: row.designation || '',
    designation: row.designation || '',
    company: row.company || '',
    description: row.bio || '',
    socialLinks,
    currentProblemStatement: row.domain || '',
    photo: row.photo || '',
    bio: row.bio || '',
    status: showOnWebsite ? 'Active' : 'Inactive',
    showOnWebsite,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

export async function getExpertsAction(options?: { publicOnly?: boolean }): Promise<ExpertRecord[]> {
  const publicOnly = options?.publicOnly ?? false;

  const rows = await db
    .select({
      id: industryExperts.id,
      name: industryExperts.name,
      photo: industryExperts.photo,
      designation: industryExperts.designation,
      company: industryExperts.company,
      domain: industryExperts.domain,
      linkedinUrl: industryExperts.linkedinUrl,
      websiteUrl: industryExperts.websiteUrl,
      bio: industryExperts.bio,
      showOnWebsite: industryExperts.showOnWebsite,
      createdAt: industryExperts.createdAt,
      updatedAt: industryExperts.updatedAt,
    })
    .from(industryExperts)
    .where(publicOnly ? eq(industryExperts.showOnWebsite, true) : undefined)
    .orderBy(asc(industryExperts.displayOrder), asc(industryExperts.name));

  return rows.map(toExpertRecord);
}

export async function createExpertAction(input: ExpertInput): Promise<ExpertRecord> {
  const socialLinks = input.socialLinks?.map((link) => link.trim()).filter(Boolean) || [];
  const values = {
    name: (input.name || '').trim(),
    designation: (input.role || input.designation || '').trim(),
    company: (input.company || '').trim(),
    photo: (input.photo || '').trim(),
    bio: (input.bio || input.description || '').trim(),
    linkedinUrl: socialLinks[0] || null,
    websiteUrl: socialLinks[1] || null,
    displayOrder: input.displayOrder ?? 0,
    showOnWebsite: input.status !== 'Inactive',
    domain: input.currentProblemStatement || 'General',
  };

  if (!values.name || !values.designation || !values.company) {
    throw new Error('Expert name, role, and company are required.');
  }

  const [created] = await db.insert(industryExperts).values(values).returning({
    id: industryExperts.id,
    name: industryExperts.name,
    photo: industryExperts.photo,
    designation: industryExperts.designation,
    company: industryExperts.company,
    domain: industryExperts.domain,
    linkedinUrl: industryExperts.linkedinUrl,
    websiteUrl: industryExperts.websiteUrl,
    bio: industryExperts.bio,
    showOnWebsite: industryExperts.showOnWebsite,
    createdAt: industryExperts.createdAt,
    updatedAt: industryExperts.updatedAt,
  });

  revalidatePath('/dashboard/experts');
  revalidatePath('/asg');
  revalidatePath('/about');

  return toExpertRecord(created);
}

export async function updateExpertAction(id: string, input: Partial<ExpertInput>): Promise<ExpertRecord> {
  const values: Record<string, unknown> = {};

  if (typeof input.name === 'string') values.name = input.name.trim();
  if (typeof input.role === 'string') values.designation = input.role.trim();
  if (typeof input.designation === 'string') values.designation = input.designation.trim();
  if (typeof input.company === 'string') values.company = input.company.trim();
  if (typeof input.photo === 'string') values.photo = input.photo.trim();
  if (typeof input.bio === 'string') values.bio = input.bio.trim();
  if (typeof input.description === 'string') values.bio = input.description.trim();
  if (typeof input.currentProblemStatement === 'string') values.domain = input.currentProblemStatement.trim() || 'General';
  if (typeof input.status === 'string') values.showOnWebsite = input.status !== 'Inactive';
  if (typeof input.displayOrder === 'number') values.displayOrder = input.displayOrder;
  if (Array.isArray(input.socialLinks)) {
    const socialLinks = input.socialLinks.map((link) => link.trim()).filter(Boolean);
    values.linkedinUrl = socialLinks[0] || null;
    values.websiteUrl = socialLinks[1] || null;
  }

  if (!id) {
    throw new Error('Expert id is required.');
  }

  const [updated] = await db.update(industryExperts).set(values).where(eq(industryExperts.id, id)).returning({
    id: industryExperts.id,
    name: industryExperts.name,
    photo: industryExperts.photo,
    designation: industryExperts.designation,
    company: industryExperts.company,
    domain: industryExperts.domain,
    linkedinUrl: industryExperts.linkedinUrl,
    websiteUrl: industryExperts.websiteUrl,
    bio: industryExperts.bio,
    showOnWebsite: industryExperts.showOnWebsite,
    createdAt: industryExperts.createdAt,
    updatedAt: industryExperts.updatedAt,
  });

  revalidatePath('/dashboard/experts');
  revalidatePath('/asg');
  revalidatePath('/about');

  return toExpertRecord(updated);
}

export async function deleteExpertAction(id: string): Promise<void> {
  if (!id) {
    throw new Error('Expert id is required.');
  }

  await db.delete(industryExperts).where(eq(industryExperts.id, id));

  revalidatePath('/dashboard/experts');
  revalidatePath('/asg');
  revalidatePath('/about');
}

export async function toggleExpertStatusAction(id: string, status?: 'Active' | 'Inactive'): Promise<ExpertRecord> {
  const nextStatus = status ?? 'Active';
  return updateExpertAction(id, { status: nextStatus });
}

'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { industryPartners } from '@/db/schema/ecosystem';

export interface PartnerInput {
  name: string;
  logo?: string;
  website?: string;
  websiteUrl?: string;
  category?: string;
  status?: 'Active' | 'Inactive';
  displayOrder?: number;
}

export interface PartnerRecord {
  id: string;
  name: string;
  logo: string;
  website: string;
  websiteUrl: string;
  linkedinUrl: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive';
  showOnWebsite: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function toPartnerRecord(row: any): PartnerRecord {
  const showOnWebsite = Boolean(row.showOnWebsite);

  return {
    id: row.id,
    name: row.name,
    logo: row.logo || '',
    website: row.websiteUrl || '',
    websiteUrl: row.websiteUrl || '',
    linkedinUrl: row.linkedinUrl || '',
    category: 'Partner',
    description: '',
    status: showOnWebsite ? 'Active' : 'Inactive',
    showOnWebsite,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

export async function getPartnersAction(options?: { publicOnly?: boolean }): Promise<PartnerRecord[]> {
  const publicOnly = options?.publicOnly ?? false;

  const rows = await db
    .select({
      id: industryPartners.id,
      name: industryPartners.name,
      logo: industryPartners.logo,
      websiteUrl: industryPartners.websiteUrl,
      linkedinUrl: industryPartners.linkedinUrl,
      showOnWebsite: industryPartners.showOnWebsite,
      createdAt: industryPartners.createdAt,
      updatedAt: industryPartners.updatedAt,
    })
    .from(industryPartners)
    .where(publicOnly ? eq(industryPartners.showOnWebsite, true) : undefined)
    .orderBy(asc(industryPartners.displayOrder), asc(industryPartners.name));

  return rows.map(toPartnerRecord);
}

export async function createPartnerAction(input: PartnerInput): Promise<PartnerRecord> {
  const values = {
    name: (input.name || '').trim(),
    logo: (input.logo || '').trim(),
    websiteUrl: (input.websiteUrl || input.website || '').trim(),
    displayOrder: input.displayOrder ?? 0,
    showOnWebsite: input.status !== 'Inactive',
  };

  if (!values.name || !values.websiteUrl) {
    throw new Error('Partner name and website are required.');
  }

  const [created] = await db.insert(industryPartners).values(values).returning({
    id: industryPartners.id,
    name: industryPartners.name,
    logo: industryPartners.logo,
    websiteUrl: industryPartners.websiteUrl,
    linkedinUrl: industryPartners.linkedinUrl,
    showOnWebsite: industryPartners.showOnWebsite,
    createdAt: industryPartners.createdAt,
    updatedAt: industryPartners.updatedAt,
  });

  revalidatePath('/dashboard/partners');
  revalidatePath('/asg');
  revalidatePath('/about');

  return toPartnerRecord(created);
}

export async function updatePartnerAction(id: string, input: Partial<PartnerInput>): Promise<PartnerRecord> {
  const values: Record<string, unknown> = {};

  if (typeof input.name === 'string') values.name = input.name.trim();
  if (typeof input.logo === 'string') values.logo = input.logo.trim();
  if (typeof input.websiteUrl === 'string') values.websiteUrl = input.websiteUrl.trim();
  if (typeof input.website === 'string') values.websiteUrl = input.website.trim();
  if (typeof input.status === 'string') values.showOnWebsite = input.status !== 'Inactive';
  if (typeof input.displayOrder === 'number') values.displayOrder = input.displayOrder;

  if (!id) {
    throw new Error('Partner id is required.');
  }

  const [updated] = await db.update(industryPartners).set(values).where(eq(industryPartners.id, id)).returning({
    id: industryPartners.id,
    name: industryPartners.name,
    logo: industryPartners.logo,
    websiteUrl: industryPartners.websiteUrl,
    linkedinUrl: industryPartners.linkedinUrl,
    showOnWebsite: industryPartners.showOnWebsite,
    createdAt: industryPartners.createdAt,
    updatedAt: industryPartners.updatedAt,
  });

  revalidatePath('/dashboard/partners');
  revalidatePath('/asg');
  revalidatePath('/about');

  return toPartnerRecord(updated);
}

export async function deletePartnerAction(id: string): Promise<void> {
  if (!id) {
    throw new Error('Partner id is required.');
  }

  await db.delete(industryPartners).where(eq(industryPartners.id, id));

  revalidatePath('/dashboard/partners');
  revalidatePath('/asg');
  revalidatePath('/about');
}

export async function togglePartnerStatusAction(id: string, status?: 'Active' | 'Inactive'): Promise<PartnerRecord> {
  const nextStatus = status ?? 'Active';
  return updatePartnerAction(id, { status: nextStatus });
}

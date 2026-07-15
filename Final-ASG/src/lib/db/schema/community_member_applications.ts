import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { applicationStatusEnum } from './intern_applications';

export const applicantTypeEnum = pgEnum('applicant_type', ['founder', 'mentor', 'investor', 'service_provider', 'industry_expert', 'partner']);

export const communityMemberApplications = pgTable('community_member_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  company: text('company').notNull(),
  designation: text('designation').notNull(),
  applicantType: applicantTypeEnum('applicant_type').notNull(),
  websiteUrl: text('website_url'),
  linkedinUrl: text('linkedin_url'),
  expertise: text('expertise').notNull(),
  motivation: text('motivation').notNull(),
  photoUrl: text('photo_url'),
  status: applicationStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

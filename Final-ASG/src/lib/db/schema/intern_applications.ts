import { pgTable, uuid, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const applicationStatusEnum = pgEnum('application_status', ['pending', 'reviewed', 'accepted', 'rejected']);

export const internApplications = pgTable('intern_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  college: text('college').notNull(),
  branch: text('branch').notNull(),
  year: text('year').notNull(),
  skills: text('skills').notNull(),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  resumeUrl: text('resume_url'),
  photoUrl: text('photo_url'),
  preferredDomain: text('preferred_domain').notNull(),
  motivation: text('motivation').notNull(),
  status: applicationStatusEnum('status').default('pending').notNull(),
  isExistingIntern: boolean('is_existing_intern').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

import { pgTable, uuid, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';

export const internStatusEnum = pgEnum('intern_status', ['active', 'completed']);

export const interns = pgTable('interns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  photo: text('photo').notNull(),
  college: text('college').notNull(),
  domain: text('domain').notNull(),
  cohortNumber: integer('cohort_number').notNull(),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  status: internStatusEnum('status').default('active').notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

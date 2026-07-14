import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const industryExperts = pgTable('industry_experts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  photo: text('photo').notNull(),
  designation: text('designation').notNull(),
  company: text('company').notNull(),
  domain: text('domain').notNull(),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),
  bio: text('bio').notNull(),
  showOnWebsite: boolean('show_on_website').default(true).notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

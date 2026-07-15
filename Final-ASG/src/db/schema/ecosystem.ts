import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const industryPartners = pgTable('industry_partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  logo: text('logo'),
  websiteUrl: text('website_url').notNull(),
  linkedinUrl: text('linkedin_url'),
  displayOrder: integer('display_order').default(0).notNull(),
  showOnWebsite: boolean('show_on_website').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const industryExperts = pgTable('industry_experts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  photo: text('photo'),
  designation: text('designation').notNull(),
  company: text('company').notNull(),
  domain: text('domain').notNull(),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),
  bio: text('bio'),
  showOnWebsite: boolean('show_on_website').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

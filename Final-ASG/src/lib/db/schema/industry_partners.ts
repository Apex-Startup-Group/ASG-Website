import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const industryPartners = pgTable('industry_partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  logo: text('logo').notNull(), // Storage URL for logo
  websiteUrl: text('website_url').notNull(),
  linkedinUrl: text('linkedin_url'),
  displayOrder: integer('display_order').notNull(),
  showOnWebsite: boolean('show_on_website').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

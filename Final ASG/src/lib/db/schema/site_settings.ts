import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey().notNull(), // e.g., 'general', 'hero', 'statistics', 'footer'
  value: jsonb('value').notNull(), // structured JSON object for that section
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

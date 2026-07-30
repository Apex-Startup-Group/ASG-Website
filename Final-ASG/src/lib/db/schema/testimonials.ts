import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(), // e.g. "Founder @ TechCorp", "AI Launchpad Intern"
  company: text('company'),
  avatar: text('avatar'), // Image URL or Avatar path
  content: text('content').notNull(),
  rating: integer('rating').default(5).notNull(),
  status: text('status').default('Active').notNull(), // Active | Inactive
  displayOrder: integer('display_order').default(0).notNull(),
  showOnWebsite: boolean('show_on_website').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

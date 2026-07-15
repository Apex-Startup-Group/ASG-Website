import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const queryStatusEnum = pgEnum('query_status', ['pending', 'responded', 'closed']);

export const contactQueries = pgTable('contact_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: queryStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

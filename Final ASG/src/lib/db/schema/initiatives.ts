import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const initiatives = pgTable('initiatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  emoji: text('emoji').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

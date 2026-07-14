import { pgTable, uuid, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { interns } from './interns';

export const problemStatusEnum = pgEnum('problem_status', ['open', 'assigned', 'closed']);

export const problemStatements = pgTable('problem_statements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  icon: text('icon'),
  description: text('description').notNull(),
  status: problemStatusEnum('status').default('open').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  assignedInternId: uuid('assigned_intern_id').references(() => interns.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

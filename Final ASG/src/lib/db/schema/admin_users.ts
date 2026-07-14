import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('admin_role', ['super_admin', 'admin']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().notNull(), // Linked to auth.users.id
  name: text('name').notNull(),
  role: roleEnum('role').default('super_admin').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

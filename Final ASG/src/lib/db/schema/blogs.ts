import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { adminUsers } from './admin_users';

export const blogStatusEnum = pgEnum('blog_status', ['draft', 'published']);

export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  adminId: uuid('admin_id').references(() => adminUsers.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(),
  excerpt: text('excerpt').notNull(),
  coverImage: text('cover_image').notNull(),
  body: text('body').notNull(),
  author: text('author'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),
  tags: text('tags').array(),
  status: blogStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

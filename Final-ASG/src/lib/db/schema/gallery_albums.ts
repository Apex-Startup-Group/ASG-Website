import { pgTable, uuid, text, timestamp, pgEnum, date } from 'drizzle-orm/pg-core';

export const albumStatusEnum = pgEnum('album_status', ['draft', 'published']);

export const galleryAlbums = pgTable('gallery_albums', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  coverPhoto: text('cover_photo').notNull(),
  description: text('description').notNull(),
  status: albumStatusEnum('status').default('draft').notNull(),
  eventDate: date('event_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

import { pgTable, uuid, text, timestamp, pgEnum, integer, boolean } from 'drizzle-orm/pg-core';

export const memberTypeEnum = pgEnum('member_type', ['founder', 'mentor', 'investor', 'member', 'service_provider']);

export const communityMembers = pgTable('community_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  photo: text('photo').notNull(),
  designation: text('designation').notNull(),
  company: text('company').notNull(),
  memberType: memberTypeEnum('member_type').notNull(),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),
  bio: text('bio').notNull(),
  showOnWebsite: boolean('show_on_website').default(true).notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

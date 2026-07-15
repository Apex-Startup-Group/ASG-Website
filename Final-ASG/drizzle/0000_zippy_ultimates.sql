CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'upcoming', 'past');--> statement-breakpoint
CREATE TYPE "public"."album_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."intern_status" AS ENUM('active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."member_type" AS ENUM('founder', 'mentor', 'investor', 'member', 'service_provider');--> statement-breakpoint
CREATE TYPE "public"."problem_status" AS ENUM('open', 'assigned', 'closed');--> statement-breakpoint
CREATE TYPE "public"."query_status" AS ENUM('pending', 'responded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'reviewed', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."applicant_type" AS ENUM('founder', 'mentor', 'investor', 'service_provider', 'industry_expert', 'partner');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" "admin_role" DEFAULT 'super_admin' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"venue" text NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"tags" text[],
	"thumbnail_url" text NOT NULL,
	"description" text NOT NULL,
	"gallery_album_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"cover_photo" text NOT NULL,
	"description" text NOT NULL,
	"status" "album_status" DEFAULT 'draft' NOT NULL,
	"event_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"admin_id" uuid NOT NULL,
	"category" text NOT NULL,
	"excerpt" text NOT NULL,
	"cover_image" text NOT NULL,
	"body" text NOT NULL,
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "interns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photo" text NOT NULL,
	"college" text NOT NULL,
	"domain" text NOT NULL,
	"cohort_number" integer NOT NULL,
	"linkedin_url" text,
	"github_url" text,
	"portfolio_url" text,
	"status" "intern_status" DEFAULT 'active' NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photo" text NOT NULL,
	"designation" text NOT NULL,
	"company" text NOT NULL,
	"member_type" "member_type" NOT NULL,
	"linkedin_url" text,
	"website_url" text,
	"bio" text NOT NULL,
	"show_on_website" boolean DEFAULT true NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"domain" text NOT NULL,
	"description" text NOT NULL,
	"status" "problem_status" DEFAULT 'open' NOT NULL,
	"assigned_intern_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emoji" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo" text NOT NULL,
	"website_url" text NOT NULL,
	"linkedin_url" text,
	"display_order" integer NOT NULL,
	"show_on_website" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_experts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photo" text NOT NULL,
	"designation" text NOT NULL,
	"company" text NOT NULL,
	"domain" text NOT NULL,
	"linkedin_url" text,
	"website_url" text,
	"bio" text NOT NULL,
	"show_on_website" boolean DEFAULT true NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "query_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intern_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"college" text NOT NULL,
	"branch" text NOT NULL,
	"year" text NOT NULL,
	"skills" text NOT NULL,
	"linkedin_url" text,
	"github_url" text,
	"portfolio_url" text,
	"resume_url" text,
	"preferred_domain" text NOT NULL,
	"motivation" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_member_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text NOT NULL,
	"designation" text NOT NULL,
	"applicant_type" "applicant_type" NOT NULL,
	"website_url" text,
	"linkedin_url" text,
	"expertise" text NOT NULL,
	"motivation" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_gallery_album_id_gallery_albums_id_fk" FOREIGN KEY ("gallery_album_id") REFERENCES "public"."gallery_albums"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_album_id_gallery_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_statements" ADD CONSTRAINT "problem_statements_assigned_intern_id_interns_id_fk" FOREIGN KEY ("assigned_intern_id") REFERENCES "public"."interns"("id") ON DELETE set null ON UPDATE no action;
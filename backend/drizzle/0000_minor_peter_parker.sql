CREATE TYPE "public"."driver_status" AS ENUM('available', 'on_trip', 'off_duty', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('fleet_manager', 'driver', 'safety_officer', 'financial_officer', 'trip_dispatcher');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('draft', 'dispatched', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'on_trip', 'in_shop', 'retired');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('truck', 'van', 'pickup', 'trailer', 'other');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refresh_token" text NOT NULL,
	"ip" varchar(45) NOT NULL,
	"user_agent" text NOT NULL,
	"user_id" uuid NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'driver' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
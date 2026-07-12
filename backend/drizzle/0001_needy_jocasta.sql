CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "vehicle_type" DEFAULT 'van' NOT NULL,
	"max_load_capacity_kg" numeric(10, 2) NOT NULL,
	"odometer_km" numeric(12, 2) DEFAULT 0 NOT NULL,
	"acquisition_cost" numeric(12, 2) NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number")
);

import {
  integer,
  boolean,
  pgTable,
  varchar,
  text,
  uuid,
  timestamp,
  pgEnum,
  unique,
  numeric
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "fleet_manager",
  "driver",
  "safety_officer",
  "financial_officer",
  "trip_dispatcher",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "on_trip",
  "in_shop",
  "retired",
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "truck",
  "van",
  "pickup",
  "trailer",
  "other",
]);

export const driverStatusEnum = pgEnum("driver_status", [
  "available",
  "on_trip",
  "off_duty",
  "suspended",
]);

export const tripStatusEnum = pgEnum("trip_status", [
  "draft",
  "dispatched",
  "completed",
  "cancelled",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "active",
  "completed",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum().default("driver").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  refreshToken: text("refresh_token").notNull(),
  ip: varchar({ length: 45 }).notNull(),
  userAgent: text("user_agent").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const vehiclesTable = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationNumber: varchar("registration_number", {
    length: 50,
  }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: vehicleTypeEnum("type").default("van").notNull(),
  maxLoadCapacityKg: numeric("max_load_capacity_kg", {
    precision: 10,
    scale: 2,
  }).notNull(),
  odometerKm: numeric("odometer_km", { precision: 12, scale: 2 })
    .notNull()
    .default(0),
  acquisitionCost: numeric("acquisition_cost", {
    precision: 12,
    scale: 2,
  }).notNull(),
  status: vehicleStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

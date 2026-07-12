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
  numeric,
  date
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


export const driversTable = pgTable(
  "drivers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }).notNull(), 
    name: varchar("name", { length: 255 }).notNull(),
    licenseNumber: varchar("license_number", { length: 50 }).unique().notNull(),
    licenseCategory: varchar("license_category", { length: 50 }).notNull(),
    licenseExpiryDate: date("license_expiry_date").notNull(),
    contactNumber: varchar("contact_number", { length: 20 }).notNull(),
    status: driverStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

export const tripsTable = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: varchar("source", { length: 255 }).notNull(),
    destination: varchar("destination", { length: 255 }).notNull(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehiclesTable.id, { onDelete: "restrict" }),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => driversTable.id, { onDelete: "restrict" }),
    cargoWeightKg: numeric("cargo_weight_kg", {
      precision: 10,
      scale: 2,
    }).notNull(),
    plannedDistanceKm: numeric("planned_distance_km", {
      precision: 10,
      scale: 2,
    }).notNull(),
    actualDistanceKm: numeric("actual_distance_km", {
      precision: 10,
      scale: 2,
    }),
    startOdometerKm: numeric("start_odometer_km", { precision: 12, scale: 2 }),
    endOdometerKm: numeric("end_odometer_km", { precision: 12, scale: 2 }),
    fuelConsumedLiters: numeric("fuel_consumed_liters", {
      precision: 10,
      scale: 2,
    }),
    status: tripStatusEnum("status").default("draft").notNull(),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

export const maintenanceLogsTable = pgTable(
  "maintenance_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehiclesTable.id, { onDelete: "cascade" }),
    serviceTyp: text("service_type").notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull().default("0"),
    status: maintenanceStatusEnum("status").notNull().default("active"),
    serviceDate:date("service_date").notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

export const fuelLogsTable = pgTable(
  "fuel_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehiclesTable.id, { onDelete: "cascade" }),
    tripId: uuid("trip_id").references(() => tripsTable.id, {
      onDelete: "set null",
    }),
    liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);


export const expensesTable = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehiclesTable.id, { onDelete: "cascade" }),
    type: text().notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

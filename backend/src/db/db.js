import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import envConfig from "../config/env.config.js";

const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
  ssl:
    envConfig.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const db = drizzle({ client: pool });

const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");        // Test the connection
    client.release();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

export { db, connectDB };

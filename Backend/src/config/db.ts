import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "francis",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "fran12345",
  port: Number(process.env.DB_PORT) || 5432,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    console.log(`✅ Conectado a PostgreSQL - Hora actual: ${res.rows[0].now}`);
    client.release();
  } catch (err: any) {
    console.error("❌ Error al conectar a PostgreSQL:", err.message);
    process.exit(1);
  }
};

export { pool, connectDB };

import "dotenv/config";
import { Pool } from "pg";

const password = process.env.DB_PASSWORD;
if (!password) {
  throw new Error(
    "Falta DB_PASSWORD. Creá backend/.env usando la contraseña de database/.env."
  );
}

const port = Number(process.env.DB_PORT ?? "5433");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT debe ser un puerto válido.");
}

export const pool = new Pool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port,
  database: process.env.DB_NAME ?? "incidenthub",
  user: process.env.DB_USER ?? "incidenthub",
  password,
  max: 10,
  connectionTimeoutMillis: 5000,
});

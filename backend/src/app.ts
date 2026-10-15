import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { pool } from "./config/database";
import { incidentesRouter } from "./routes/incidentes.routes";

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ estado: "ok", baseDatos: "conectada" });
  } catch (error) {
    console.error("Error en health check:", error);
    res.status(503).json({ estado: "error", baseDatos: "no disponible" });
  }
});

app.use("/api/incidentes", incidentesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

const manejarError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "El cuerpo de la solicitud no contiene JSON válido." });
    return;
  }
  console.error("Error inesperado:", error);
  res.status(500).json({ error: "Error interno del servidor." });
};
app.use(manejarError);

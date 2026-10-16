import { app } from "./app";
import { pool } from "./config/database";

async function iniciar(): Promise<void> {
  const puerto = Number(process.env.PORT ?? "3000");
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("PORT debe ser un puerto válido.");
  }

  try {
    await pool.query("SELECT 1");
    const servidor = app.listen(puerto, "127.0.0.1", () => {
      console.log(`IT Incident Hub API: http://127.0.0.1:${puerto}`);
      console.log("PostgreSQL: conexión establecida correctamente.");
    });

    const detener = (): void => {
      servidor.close(() => {
        void pool.end().then(() => process.exit(0));
      });
    };
    process.on("SIGINT", detener);
    process.on("SIGTERM", detener);
  } catch (error) {
    console.error("No fue posible iniciar la API:", error);
    await pool.end();
    process.exitCode = 1;
  }
}

void iniciar();

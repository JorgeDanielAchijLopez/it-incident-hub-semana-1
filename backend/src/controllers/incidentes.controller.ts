
import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../config/database";
import { crearIncidenteSchema } from "../schemas/incidente.schema";

const CAMPOS = `
  id, titulo, descripcion, categoria, prioridad,
  usuario_reporta, tecnico_asignado, estado,
  creado_en, actualizado_en
`;

// Validar los filtros recibidos por la API
const filtrosIncidentesSchema = z.strictObject({
  estado: z.enum([
    "NUEVO",
    "ASIGNADO",
    "EN_PROCESO",
    "RESUELTO",
    "CERRADO",
  ]).optional(),

  prioridad: z.enum([
    "BAJA",
    "MEDIA",
    "ALTA",
    "CRITICA",
  ]).optional(),

  categoria: z.string().trim().min(1).max(80).optional(),

  tecnico: z.string().trim().min(1).max(120).optional(),
});

// Registrar un incidente nuevo
export async function registrarIncidente(
  req: Request,
  res: Response
): Promise<void> {
  const resultado = crearIncidenteSchema.safeParse(req.body);

  if (!resultado.success) {
    res.status(400).json({
      error: "Los datos del incidente no son válidos.",
      detalles: resultado.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensaje: issue.message,
      })),
    });
    return;
  }

  const {
    titulo,
    descripcion,
    categoria,
    prioridad,
    usuario_reporta,
  } = resultado.data;

  try {
    const consulta = await pool.query(
      `INSERT INTO incidentes
       (titulo, descripcion, categoria, prioridad, usuario_reporta)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${CAMPOS}`,
      [titulo, descripcion, categoria, prioridad, usuario_reporta]
    );

    res.status(201).json({
      mensaje: "Incidente registrado correctamente.",
      incidente: consulta.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar incidente:", error);

    res.status(500).json({
      error: "No fue posible registrar el incidente.",
    });
  }
}

// Listar incidentes con filtros individuales o combinados
export async function listarIncidentes(
  req: Request,
  res: Response
): Promise<void> {
  const resultado = filtrosIncidentesSchema.safeParse(req.query);

  if (!resultado.success) {
    res.status(400).json({
      error: "Los filtros proporcionados no son válidos.",
      detalles: resultado.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensaje: issue.message,
      })),
    });
    return;
  }

  const {
    estado,
    prioridad,
    categoria,
    tecnico,
  } = resultado.data;

  const condiciones: string[] = [];
  const valores: string[] = [];

  // Filtrar por estado
  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }

  // Filtrar por prioridad
  if (prioridad) {
    valores.push(prioridad);
    condiciones.push(`prioridad = $${valores.length}`);
  }

  // Filtrar por categoría
  if (categoria) {
    valores.push(categoria);
    condiciones.push(`categoria = $${valores.length}`);
  }

  // Filtrar por técnico o incidentes sin asignar
  if (tecnico === "SIN_ASIGNAR") {
    condiciones.push(
      "NULLIF(BTRIM(tecnico_asignado), '') IS NULL"
    );
  } else if (tecnico) {
    valores.push(tecnico);
    condiciones.push(
      `tecnico_asignado = $${valores.length}`
    );
  }

  const where = condiciones.length > 0
    ? `WHERE ${condiciones.join(" AND ")}`
    : "";

  try {
    const consulta = await pool.query(
      `SELECT ${CAMPOS}
       FROM incidentes
       ${where}
       ORDER BY creado_en DESC, id DESC`,
      valores
    );

    res.status(200).json({
      incidentes: consulta.rows,
    });
  } catch (error) {
    console.error("Error al listar incidentes:", error);

    res.status(500).json({
      error: "No fue posible consultar los incidentes.",
    });
  }
}

// Consultar un incidente por su ID
export async function obtenerIncidente(
  req: Request,
  res: Response
): Promise<void> {
  const idTexto = req.params.id;

  if (
    typeof idTexto !== "string" ||
    !/^[1-9]\d*$/.test(idTexto)
  ) {
    res.status(400).json({
      error: "El ID debe ser un entero positivo.",
    });
    return;
  }

  const id = Number(idTexto);

  if (!Number.isSafeInteger(id)) {
    res.status(400).json({
      error: "El ID proporcionado no es válido.",
    });
    return;
  }

  try {
    const consulta = await pool.query(
      `SELECT ${CAMPOS}
       FROM incidentes
       WHERE id = $1`,
      [id]
    );

    if (consulta.rows.length === 0) {
      res.status(404).json({
        error: "Incidente no encontrado.",
      });
      return;
    }

    res.status(200).json({
      incidente: consulta.rows[0],
    });
  } catch (error) {
    console.error("Error al consultar incidente:", error);

    res.status(500).json({
      error: "No fue posible consultar el incidente.",
    });
  }
}

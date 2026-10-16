
import type { Request, Response } from "express";
import { pool } from "../config/database";
import { crearIncidenteSchema } from "../schemas/incidente.schema";

const CAMPOS = `
  id, titulo, descripcion, categoria, prioridad,
  usuario_reporta, tecnico_asignado, estado,
  creado_en, actualizado_en
`;

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

// Consultar todos los incidentes
export async function listarIncidentes(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const consulta = await pool.query(
      `SELECT ${CAMPOS}
       FROM incidentes
       ORDER BY creado_en DESC, id DESC`
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

  // Validar el tipo antes de utilizar expresiones regulares
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

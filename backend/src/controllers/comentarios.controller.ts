
import type { Request, Response } from "express";
import { pool } from "../config/database";
import { crearComentarioSchema } from "../schemas/comentario.schema";

function validarId(valor: string | string[] | undefined): number | null {
  if (typeof valor !== "string" || !/^[1-9]\d*$/.test(valor)) {
    return null;
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id > 2147483647) {
    return null;
  }

  return id;
}

// Registrar un comentario asociado a un incidente
export async function registrarComentario(
  req: Request,
  res: Response
): Promise<void> {
  const incidenteId = validarId(req.params.id);

  if (incidenteId === null) {
    res.status(400).json({
      error: "El ID del incidente no es válido.",
    });
    return;
  }

  const resultado = crearComentarioSchema.safeParse(req.body);

  if (!resultado.success) {
    res.status(400).json({
      error: "Los datos del comentario no son válidos.",
      detalles: resultado.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensaje: issue.message,
      })),
    });
    return;
  }

  try {
    const { autor, contenido } = resultado.data;

    const consulta = await pool.query(
      `INSERT INTO comentarios (incidente_id, autor, contenido)
       SELECT id, $2, $3
       FROM incidentes
       WHERE id = $1
       RETURNING id, incidente_id, autor, contenido, creado_en`,
      [incidenteId, autor, contenido]
    );

    if (consulta.rows.length === 0) {
      res.status(404).json({
        error: "Incidente no encontrado.",
      });
      return;
    }

    res.status(201).json({
      mensaje: "Comentario registrado correctamente.",
      comentario: consulta.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar comentario:", error);

    res.status(500).json({
      error: "No fue posible registrar el comentario.",
    });
  }
}

// Consultar el historial de comentarios de un incidente
export async function listarComentarios(
  req: Request,
  res: Response
): Promise<void> {
  const incidenteId = validarId(req.params.id);

  if (incidenteId === null) {
    res.status(400).json({
      error: "El ID del incidente no es válido.",
    });
    return;
  }

  try {
    const incidente = await pool.query(
      "SELECT id FROM incidentes WHERE id = $1",
      [incidenteId]
    );

    if (incidente.rows.length === 0) {
      res.status(404).json({
        error: "Incidente no encontrado.",
      });
      return;
    }

    const consulta = await pool.query(
      `SELECT id, incidente_id, autor, contenido, creado_en
       FROM comentarios
       WHERE incidente_id = $1
       ORDER BY creado_en ASC, id ASC`,
      [incidenteId]
    );

    res.status(200).json({
      incidente_id: incidenteId,
      comentarios: consulta.rows,
    });
  } catch (error) {
    console.error("Error al consultar comentarios:", error);

    res.status(500).json({
      error: "No fue posible consultar los comentarios.",
    });
  }
}

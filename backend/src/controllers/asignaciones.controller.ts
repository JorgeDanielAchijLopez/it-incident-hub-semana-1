
import type { Request, Response } from "express";
import { pool } from "../config/database";
import { asignarTecnicoSchema } from "../schemas/asignacion.schema";

// Consultar los técnicos activos
export async function listarTecnicos(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const consulta = await pool.query(
      `SELECT id, nombre, especialidad, activo
       FROM tecnicos
       WHERE activo = TRUE
       ORDER BY nombre ASC`
    );

    res.status(200).json({
      tecnicos: consulta.rows,
    });
  } catch (error) {
    console.error("Error al listar técnicos:", error);

    res.status(500).json({
      error: "No fue posible consultar los técnicos.",
    });
  }
}

// Asignar o reasignar un técnico a un incidente
export async function asignarTecnico(
  req: Request,
  res: Response
): Promise<void> {
  const idTexto = req.params.id;

  // Validar el identificador del incidente
  if (
    typeof idTexto !== "string" ||
    !/^[1-9]\d*$/.test(idTexto)
  ) {
    res.status(400).json({
      error: "El ID del incidente no es válido.",
    });
    return;
  }

  const incidenteId = Number(idTexto);

  if (
    !Number.isSafeInteger(incidenteId) ||
    incidenteId > 2147483647
  ) {
    res.status(400).json({
      error: "El ID del incidente no es válido.",
    });
    return;
  }

  // Validar los datos recibidos
  const validacion = asignarTecnicoSchema.safeParse(
    req.body
  );

  if (!validacion.success) {
    res.status(400).json({
      error: "Los datos de asignación no son válidos.",
      detalles: validacion.error.issues,
    });
    return;
  }

  const { tecnico_id } = validacion.data;

  try {
    // Actualizar técnico y estado en una sola operación.
    // Si está NUEVO, cambiar automáticamente a ASIGNADO.
    // En otros estados, conservar el estado actual.
    const consulta = await pool.query(
      `UPDATE incidentes AS i
       SET tecnico_asignado = t.nombre,
           estado = CASE
             WHEN i.estado = 'NUEVO' THEN 'ASIGNADO'
             ELSE i.estado
           END,
           actualizado_en = NOW()
       FROM tecnicos AS t
       WHERE i.id = $1
         AND t.id = $2
         AND t.activo = TRUE
       RETURNING i.*`,
      [incidenteId, tecnico_id]
    );

    if (consulta.rows.length === 0) {
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

      res.status(400).json({
        error: "El técnico no existe o no está activo.",
      });
      return;
    }

    res.status(200).json({
      mensaje: "Técnico asignado correctamente.",
      incidente: consulta.rows[0],
    });
  } catch (error) {
    console.error("Error al asignar técnico:", error);

    res.status(500).json({
      error: "No fue posible asignar el técnico.",
    });
  }
}

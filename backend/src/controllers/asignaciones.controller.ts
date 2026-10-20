
import type { Request, Response } from "express";
import { pool } from "../config/database";
import { asignarTecnicoSchema } from "../schemas/asignacion.schema";

// Consultar los tecnicos activos
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
    console.error("Error al listar tecnicos:", error);

    res.status(500).json({
      error: "No fue posible consultar los tecnicos.",
    });
  }
}

// Asignar o reasignar un tecnico a un incidente
export async function asignarTecnico(
  req: Request,
  res: Response
): Promise<void> {
  const idTexto = req.params.id;

  if (
    typeof idTexto !== "string" ||
    !/^[1-9]\d*$/.test(idTexto)
  ) {
    res.status(400).json({
      error: "El ID del incidente no es valido.",
    });
    return;
  }

  const incidenteId = Number(idTexto);

  if (
    !Number.isSafeInteger(incidenteId) ||
    incidenteId > 2147483647
  ) {
    res.status(400).json({
      error: "El ID del incidente no es valido.",
    });
    return;
  }

  const validacion = asignarTecnicoSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({
      error: "Los datos de asignacion no son validos.",
      detalles: validacion.error.issues,
    });
    return;
  }

  const { tecnico_id } = validacion.data;

  try {
    const consulta = await pool.query(
      `UPDATE incidentes AS i
       SET tecnico_asignado = t.nombre,
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
        error: "El tecnico no existe o no esta activo.",
      });
      return;
    }

    res.status(200).json({
      mensaje: "Tecnico asignado correctamente.",
      incidente: consulta.rows[0],
    });
  } catch (error) {
    console.error("Error al asignar tecnico:", error);

    res.status(500).json({
      error: "No fue posible asignar el tecnico.",
    });
  }
}

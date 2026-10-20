
import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import { pool } from "../config/database";

import {
  actualizarEstadoSchema,
  type EstadoIncidente,
} from "../schemas/estado.schema";

// Reglas para cambiar el estado de un incidente
const transiciones: Record<
  EstadoIncidente,
  EstadoIncidente[]
> = {
  NUEVO: ["ASIGNADO"],
  ASIGNADO: ["EN_PROCESO"],
  EN_PROCESO: ["RESUELTO"],
  RESUELTO: ["CERRADO"],
  CERRADO: [],
};

interface IncidenteActual {
  estado: EstadoIncidente;
  tecnico_asignado: string | null;
}

export async function cambiarEstado(
  req: Request,
  res: Response
): Promise<void> {
  const idTexto = req.params.id;

  // Validar el ID del incidente
  if (
    typeof idTexto !== "string" ||
    !/^[1-9]\d*$/.test(idTexto)
  ) {
    res.status(400).json({
      error: "El ID del incidente no es valido.",
    });
    return;
  }

  const id = Number(idTexto);

  if (!Number.isSafeInteger(id) || id > 2147483647) {
    res.status(400).json({
      error: "El ID del incidente no es valido.",
    });
    return;
  }

  // Validar el nuevo estado
  const validacion = actualizarEstadoSchema.safeParse(
    req.body
  );

  if (!validacion.success) {
    res.status(400).json({
      error: "El estado enviado no es valido.",
      detalles: validacion.error.issues,
    });
    return;
  }

  const nuevoEstado = validacion.data.estado;

  let cliente: PoolClient | undefined;

  try {
    cliente = await pool.connect();

    await cliente.query("BEGIN");

    // Bloquear el registro mientras se actualiza
    const consulta = await cliente.query<IncidenteActual>(
      `SELECT estado, tecnico_asignado
       FROM incidentes
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    const incidente = consulta.rows[0];

    if (!incidente) {
      await cliente.query("ROLLBACK");

      res.status(404).json({
        error: "Incidente no encontrado.",
      });
      return;
    }

    const estadoAnterior = incidente.estado;

    // Revisar que la transicion este permitida
    if (
      !transiciones[estadoAnterior]?.includes(nuevoEstado)
    ) {
      await cliente.query("ROLLBACK");

      res.status(409).json({
        error: "Transicion de estado no permitida.",
        estado_actual: estadoAnterior,
        estado_solicitado: nuevoEstado,
        estados_permitidos: transiciones[estadoAnterior] ?? [],
      });
      return;
    }

    // Un incidente debe tener tecnico antes de asignarse
    if (
      nuevoEstado === "ASIGNADO" &&
      !incidente.tecnico_asignado
    ) {
      await cliente.query("ROLLBACK");

      res.status(409).json({
        error: "Primero debe asignar un tecnico al incidente.",
      });
      return;
    }

    // Actualizar el estado en PostgreSQL
    const cambio = await cliente.query(
      `UPDATE incidentes
       SET estado = $1,
           actualizado_en = NOW()
       WHERE id = $2
       RETURNING *`,
      [nuevoEstado, id]
    );

    await cliente.query("COMMIT");

    res.status(200).json({
      mensaje: "Estado actualizado correctamente.",
      estado_anterior: estadoAnterior,
      incidente: cambio.rows[0],
    });

  } catch (error) {
    if (cliente) {
      try {
        await cliente.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error al revertir:", rollbackError);
      }
    }

    console.error("Error al cambiar estado:", error);

    res.status(500).json({
      error: "No fue posible actualizar el estado.",
    });

  } finally {
    cliente?.release();
  }
}

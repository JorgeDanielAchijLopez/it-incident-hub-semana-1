
import type { Request, Response } from "express";
import { pool } from "../config/database";

// Obtener indicadores directamente desde PostgreSQL
export async function obtenerEstadisticas(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const consulta = await pool.query(`
      WITH resumen AS (
        SELECT
          COUNT(*)::INTEGER AS total,

          COUNT(*) FILTER (
            WHERE estado IN (
              'NUEVO',
              'ASIGNADO',
              'EN_PROCESO'
            )
          )::INTEGER AS abiertos,

          COUNT(*) FILTER (
            WHERE estado = 'RESUELTO'
          )::INTEGER AS resueltos,

          COUNT(*) FILTER (
            WHERE estado = 'CERRADO'
          )::INTEGER AS cerrados,

          COUNT(*) FILTER (
            WHERE estado IN ('RESUELTO', 'CERRADO')
          )::INTEGER AS finalizados,

          COUNT(*) FILTER (
            WHERE prioridad = 'CRITICA'
            AND estado IN (
              'NUEVO',
              'ASIGNADO',
              'EN_PROCESO'
            )
          )::INTEGER AS criticos_activos

        FROM incidentes
      )

      SELECT json_build_object(
        'total', resumen.total,
        'abiertos', resumen.abiertos,
        'resueltos', resumen.resueltos,
        'cerrados', resumen.cerrados,
        'finalizados', resumen.finalizados,
        'criticos_activos', resumen.criticos_activos,

        'por_categoria', COALESCE((
          SELECT json_agg(
            json_build_object(
              'categoria', grupo.categoria,
              'total', grupo.total,
              'abiertos', grupo.abiertos
            )
            ORDER BY grupo.total DESC, grupo.categoria
          )
          FROM (
            SELECT
              categoria,
              COUNT(*)::INTEGER AS total,
              COUNT(*) FILTER (
                WHERE estado IN (
                  'NUEVO', 'ASIGNADO', 'EN_PROCESO'
                )
              )::INTEGER AS abiertos
            FROM incidentes
            GROUP BY categoria
          ) AS grupo
        ), '[]'::json),

        'por_tecnico', COALESCE((
          SELECT json_agg(
            json_build_object(
              'tecnico', grupo.tecnico,
              'total', grupo.total,
              'abiertos', grupo.abiertos
            )
            ORDER BY grupo.abiertos DESC, grupo.tecnico
          )
          FROM (
            SELECT
              COALESCE(
                NULLIF(TRIM(tecnico_asignado), ''),
                'Sin asignar'
              ) AS tecnico,

              COUNT(*)::INTEGER AS total,

              COUNT(*) FILTER (
                WHERE estado IN (
                  'NUEVO', 'ASIGNADO', 'EN_PROCESO'
                )
              )::INTEGER AS abiertos

            FROM incidentes

            GROUP BY
              COALESCE(
                NULLIF(TRIM(tecnico_asignado), ''),
                'Sin asignar'
              )
          ) AS grupo
        ), '[]'::json)

      ) AS estadisticas

      FROM resumen
    `);

    res.status(200).json({
      estadisticas: consulta.rows[0].estadisticas,
    });
  } catch (error) {
    console.error(
      "Error al consultar estadísticas:",
      error
    );

    res.status(500).json({
      error: "No fue posible consultar las estadísticas.",
    });
  }
}

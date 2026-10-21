
export interface DistribucionCategoria {
  categoria: string;
  total: number;
  abiertos: number;
}

export interface DistribucionTecnico {
  tecnico: string;
  total: number;
  abiertos: number;
}

export interface Estadisticas {
  total: number;
  abiertos: number;
  resueltos: number;
  cerrados: number;
  finalizados: number;
  criticos_activos: number;
  por_categoria: DistribucionCategoria[];
  por_tecnico: DistribucionTecnico[];
}

// Consultar estadísticas calculadas en PostgreSQL
export async function obtenerEstadisticas(
  signal?: AbortSignal
): Promise<Estadisticas> {
  let respuesta: Response;

  try {
    respuesta = await fetch(
      "/api/incidentes/estadisticas",
      { signal }
    );
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new Error(
      "No se pudo conectar con la API de estadísticas.",
      { cause: error }
    );
  }

  const datos: unknown = await respuesta
    .json()
    .catch(() => null);

  if (!respuesta.ok) {
    const errorAPI = datos as { error?: string } | null;

    throw new Error(
      errorAPI?.error ||
      `Error HTTP ${respuesta.status} al consultar estadísticas.`
    );
  }

  if (
    !datos ||
    typeof datos !== "object" ||
    !("estadisticas" in datos)
  ) {
    throw new Error(
      "La API no devolvió estadísticas válidas."
    );
  }

  const estadisticas = datos.estadisticas;

  if (
    !estadisticas ||
    typeof estadisticas !== "object" ||
    !("total" in estadisticas) ||
    typeof estadisticas.total !== "number" ||
    !("abiertos" in estadisticas) ||
    typeof estadisticas.abiertos !== "number" ||
    !("resueltos" in estadisticas) ||
    typeof estadisticas.resueltos !== "number" ||
    !("cerrados" in estadisticas) ||
    typeof estadisticas.cerrados !== "number" ||
    !("finalizados" in estadisticas) ||
    typeof estadisticas.finalizados !== "number" ||
    !("criticos_activos" in estadisticas) ||
    typeof estadisticas.criticos_activos !== "number" ||
    !("por_categoria" in estadisticas) ||
    !Array.isArray(estadisticas.por_categoria) ||
    !("por_tecnico" in estadisticas) ||
    !Array.isArray(estadisticas.por_tecnico)
  ) {
    throw new Error(
      "Los indicadores recibidos están incompletos."
    );
  }

  return estadisticas as Estadisticas;
}

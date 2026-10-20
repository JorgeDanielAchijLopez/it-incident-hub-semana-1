
import type { Estado, Incidente } from "../types/incidente";

// Datos de un tecnico registrado en PostgreSQL
export interface Tecnico {
  id: number;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

// Estructura de los errores que devuelve la API
interface ErrorAPI {
  error?: string;
  detalles?: {
    campo?: string;
    mensaje?: string;
    message?: string;
    path?: (string | number)[];
  }[];
}

// Procesar las respuestas de la API
async function consultarAPI<T>(
  ruta: string,
  opciones?: RequestInit
): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(ruta, opciones);
  } catch (error) {
    if (opciones?.signal?.aborted) {
      throw error;
    }

    throw new Error(
  "No se pudo conectar con la API. Verificá que el servidor esté funcionando.",
  { cause: error }
    );
  }

  const datos: unknown = await respuesta
    .json()
    .catch(() => null);

  if (!respuesta.ok) {
    const error = datos as ErrorAPI | null;

    const detalles = Array.isArray(error?.detalles)
      ? error.detalles
          .map((detalle) => {
            const campo =
              detalle.campo ||
              detalle.path?.join(".") ||
              "";

            const mensaje =
              detalle.mensaje || detalle.message || "";

            return campo
              ? `${campo}: ${mensaje}`
              : mensaje;
          })
          .filter(Boolean)
          .join(" · ")
      : "";

    throw new Error(
      [error?.error || `Error HTTP ${respuesta.status}`, detalles]
        .filter(Boolean)
        .join(" — ")
    );
  }

  if (datos === null || typeof datos !== "object") {
    throw new Error(
      "La API devolvió una respuesta no válida."
    );
  }

  return datos as T;
}

// Consultar los tecnicos activos
export async function listarTecnicos(
  signal?: AbortSignal
): Promise<Tecnico[]> {
  const datos = await consultarAPI<{
    tecnicos: Tecnico[];
  }>("/api/tecnicos", { signal });

  if (!Array.isArray(datos.tecnicos)) {
    throw new Error(
      "La API no devolvió una lista válida de técnicos."
    );
  }

  return datos.tecnicos;
}

// Asignar o reasignar un tecnico
export async function asignarTecnico(
  incidenteId: number,
  tecnicoId: number
): Promise<Incidente> {
  const datos = await consultarAPI<{
    mensaje: string;
    incidente: Incidente;
  }>(`/api/incidentes/${incidenteId}/asignacion`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tecnico_id: tecnicoId,
    }),
  });

  if (!datos.incidente || typeof datos.incidente.id !== "number") {
    throw new Error(
      "No se recibió el incidente actualizado."
    );
  }

  return datos.incidente;
}

// Cambiar el estado de un incidente
export async function cambiarEstado(
  incidenteId: number,
  nuevoEstado: Estado
): Promise<Incidente> {
  const datos = await consultarAPI<{
    mensaje: string;
    estado_anterior: Estado;
    incidente: Incidente;
  }>(`/api/incidentes/${incidenteId}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      estado: nuevoEstado,
    }),
  });

  if (!datos.incidente || typeof datos.incidente.id !== "number") {
    throw new Error(
      "No se recibió el incidente actualizado."
    );
  }

  return datos.incidente;
}

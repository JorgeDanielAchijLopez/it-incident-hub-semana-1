
export interface Comentario {
  id: number;
  incidente_id: number;
  autor: string;
  contenido: string;
  creado_en: string;
}

export interface NuevoComentario {
  autor: string;
  contenido: string;
}

interface RespuestaError {
  error?: string;
  detalles?: {
    campo: string;
    mensaje: string;
  }[];
}

interface RespuestaComentarios {
  incidente_id: number;
  comentarios: Comentario[];
}

interface RespuestaCrearComentario {
  mensaje: string;
  comentario: Comentario;
}

async function procesarRespuesta<T>(
  respuesta: Response
): Promise<T> {
  const datos: unknown = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = datos as RespuestaError | null;

    const detalles = error?.detalles
      ?.map((detalle) => `${detalle.campo}: ${detalle.mensaje}`)
      .join(" · ");

    throw new Error(
      detalles ||
      error?.error ||
      `Error HTTP ${respuesta.status}`
    );
  }

  if (datos === null || typeof datos !== "object") {
    throw new Error("La API devolvió una respuesta no válida.");
  }

  return datos as T;
}

// Obtener el historial de comentarios de un incidente.
export async function listarComentarios(
  incidenteId: number,
  signal?: AbortSignal
): Promise<Comentario[]> {
  const respuesta = await fetch(
    `/api/incidentes/${incidenteId}/comentarios`,
    { signal }
  );

  const datos =
    await procesarRespuesta<RespuestaComentarios>(respuesta);

  if (!Array.isArray(datos.comentarios)) {
    throw new Error("El historial de comentarios no es válido.");
  }

  return datos.comentarios;
}

// Registrar un comentario nuevo en PostgreSQL.
export async function crearComentario(
  incidenteId: number,
  nuevo: NuevoComentario
): Promise<Comentario> {
  const respuesta = await fetch(
    `/api/incidentes/${incidenteId}/comentarios`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevo),
    }
  );

  const datos =
    await procesarRespuesta<RespuestaCrearComentario>(respuesta);

  if (!datos.comentario || typeof datos.comentario.id !== "number") {
    throw new Error("La API no devolvió el comentario creado.");
  }

  return datos.comentario;
}

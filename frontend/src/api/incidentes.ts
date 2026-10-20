
import type {
  Estado,
  Incidente,
  NuevoIncidente,
  Prioridad,
} from '../types/incidente'

interface RespuestaError {
  error?: string
  detalles?: { campo: string; mensaje: string }[]
}

export interface FiltrosIncidentes {
  estado?: Estado
  prioridad?: Prioridad
  categoria?: string
  tecnico?: string
}

async function leerJson<T>(respuesta: Response): Promise<T> {
  const cuerpo: unknown = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const detalle = cuerpo as RespuestaError | null
    const campos = detalle?.detalles
      ?.map((item) => `${item.campo}: ${item.mensaje}`)
      .join(' · ')

    throw new Error(
      campos || detalle?.error || `Error HTTP ${respuesta.status}`
    )
  }

  return cuerpo as T
}

// Consultar incidentes con filtros combinables
export async function listarIncidentes(
  signal?: AbortSignal,
  filtros: FiltrosIncidentes = {}
): Promise<Incidente[]> {
  const parametros = new URLSearchParams()

  if (filtros.estado) {
    parametros.set('estado', filtros.estado)
  }

  if (filtros.prioridad) {
    parametros.set('prioridad', filtros.prioridad)
  }

  if (filtros.categoria) {
    parametros.set('categoria', filtros.categoria)
  }

  if (filtros.tecnico) {
    parametros.set('tecnico', filtros.tecnico)
  }

  const consulta = parametros.toString()
  const ruta = consulta
    ? `/api/incidentes?${consulta}`
    : '/api/incidentes'

  const respuesta = await fetch(ruta, { signal })

  const datos = await leerJson<{
    incidentes: Incidente[]
  }>(respuesta)

  if (!Array.isArray(datos.incidentes)) {
    throw new Error('La API no devolvió una lista válida.')
  }

  return datos.incidentes
}

export async function obtenerIncidente(
  id: number,
  signal?: AbortSignal
): Promise<Incidente> {
  const respuesta = await fetch(
    `/api/incidentes/${id}`,
    { signal }
  )

  const datos = await leerJson<{
    incidente: Incidente
  }>(respuesta)

  return datos.incidente
}

export async function crearIncidente(
  nuevo: NuevoIncidente
): Promise<Incidente> {
  const respuesta = await fetch('/api/incidentes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevo),
  })

  const datos = await leerJson<{
    mensaje: string
    incidente: Incidente
  }>(respuesta)

  return datos.incidente
}

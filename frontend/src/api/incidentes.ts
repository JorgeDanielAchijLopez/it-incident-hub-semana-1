import type { Incidente, NuevoIncidente } from '../types/incidente'

interface RespuestaError {
  error?: string
  detalles?: { campo: string; mensaje: string }[]
}

async function leerJson<T>(respuesta: Response): Promise<T> {
  const cuerpo: unknown = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const detalle = cuerpo as RespuestaError | null
    const campos = detalle?.detalles?.map((item) => `${item.campo}: ${item.mensaje}`).join(' · ')
    throw new Error(campos || detalle?.error || `Error HTTP ${respuesta.status}`)
  }

  return cuerpo as T
}

export async function listarIncidentes(signal?: AbortSignal): Promise<Incidente[]> {
  const respuesta = await fetch('/api/incidentes', { signal })
  const datos = await leerJson<{ incidentes: Incidente[] }>(respuesta)
  return datos.incidentes
}

export async function obtenerIncidente(id: number, signal?: AbortSignal): Promise<Incidente> {
  const respuesta = await fetch(`/api/incidentes/${id}`, { signal })
  const datos = await leerJson<{ incidente: Incidente }>(respuesta)
  return datos.incidente
}

export async function crearIncidente(nuevo: NuevoIncidente): Promise<Incidente> {
  const respuesta = await fetch('/api/incidentes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevo),
  })
  const datos = await leerJson<{ mensaje: string; incidente: Incidente }>(respuesta)
  return datos.incidente
}

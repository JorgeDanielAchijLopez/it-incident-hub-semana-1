export const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as const
export type Prioridad = (typeof PRIORIDADES)[number]

export const ESTADOS = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'] as const
export type Estado = (typeof ESTADOS)[number]

export interface Incidente {
  id: number
  titulo: string
  descripcion: string
  categoria: string
  prioridad: Prioridad
  usuario_reporta: string
  tecnico_asignado: string | null
  estado: Estado
  creado_en: string
  actualizado_en: string
}

export interface NuevoIncidente {
  titulo: string
  descripcion: string
  categoria: string
  prioridad: Prioridad
  usuario_reporta: string
}

export function nombreEstado(estado: Estado): string {
  const nombres: Record<Estado, string> = {
    NUEVO: 'Nuevo',
    ASIGNADO: 'Asignado',
    EN_PROCESO: 'En proceso',
    RESUELTO: 'Resuelto',
    CERRADO: 'Cerrado',
  }
  return nombres[estado]
}

export function nombrePrioridad(prioridad: Prioridad): string {
  const nombres: Record<Prioridad, string> = {
    BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica',
  }
  return nombres[prioridad]
}

export function formatoFecha(fecha: string): string {
  const valor = new Date(fecha)
  return Number.isNaN(valor.getTime())
    ? 'Sin fecha'
    : valor.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })
}

import type { Incidente } from '../types/incidente'

type Props = { incidentes: Incidente[] }

export function MetricCards({ incidentes }: Props) {
  const abiertos = incidentes.filter((i) => !['RESUELTO', 'CERRADO'].includes(i.estado)).length
  const criticos = incidentes.filter((i) => i.prioridad === 'CRITICA' && !['RESUELTO', 'CERRADO'].includes(i.estado)).length
  const resueltos = incidentes.filter((i) => ['RESUELTO', 'CERRADO'].includes(i.estado)).length

  const metricas = [
    { etiqueta: 'Total de incidentes', valor: incidentes.length, clase: 'metric-blue', simbolo: '◫', descripcion: 'Registrados en el sistema' },
    { etiqueta: 'Pendientes de atención', valor: abiertos, clase: 'metric-orange', simbolo: '◷', descripcion: 'Nuevos o en proceso' },
    { etiqueta: 'Críticos activos', valor: criticos, clase: 'metric-red', simbolo: '!', descripcion: 'Requieren atención prioritaria' },
    { etiqueta: 'Resueltos / cerrados', valor: resueltos, clase: 'metric-green', simbolo: '✓', descripcion: 'Atención finalizada' },
  ]

  return (
    <section className="metrics" aria-label="Resumen de incidentes">
      {metricas.map((m) => (
        <article className="metric-card" key={m.etiqueta}>
          <div className="metric-top"><span className="metric-label">{m.etiqueta}</span><span className={`metric-icon ${m.clase}`}>{m.simbolo}</span></div>
          <strong className="metric-value">{m.valor}</strong>
          <span className="metric-description">{m.descripcion}</span>
        </article>
      ))}
    </section>
  )
}

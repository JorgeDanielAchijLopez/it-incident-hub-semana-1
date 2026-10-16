import { formatoFecha, nombreEstado, nombrePrioridad, type Incidente } from '../types/incidente'

type Props = { incidentes: Incidente[]; cargando: boolean; onAbrir: (id: number) => void }

export function IncidentTable({ incidentes, cargando, onAbrir }: Props) {
  return (
    <div className="table-scroll">
      <table className="incident-table">
        <thead><tr><th>ID</th><th>Incidente</th><th>Categoría</th><th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Detalle</th></tr></thead>
        <tbody>
          {incidentes.map((i) => <tr key={i.id}>
            <td><span className="id-tag">#{i.id}</span></td>
            <td><div className="ticket-title">{i.titulo}</div><div className="ticket-meta">Reportado por {i.usuario_reporta}</div></td>
            <td>{i.categoria}</td>
            <td><span className={`priority priority-${i.prioridad.toLowerCase()}`}><span className="priority-dot" />{nombrePrioridad(i.prioridad)}</span></td>
            <td><span className={`status status-${i.estado.toLowerCase()}`}>{nombreEstado(i.estado)}</span></td>
            <td className="date-cell">{formatoFecha(i.creado_en)}</td>
            <td><button className="btn-detail" onClick={() => onAbrir(i.id)} aria-label={`Ver incidente ${i.id}`}>Ver detalle ↗</button></td>
          </tr>)}
          {!cargando && incidentes.length === 0 && <tr><td colSpan={7} className="empty-table"><div className="empty-icon">⌕</div><strong>No se encontraron incidentes</strong><span>Probá cambiar los filtros o registrá un incidente.</span></td></tr>}
          {cargando && <tr><td colSpan={7} className="loading-cell">Cargando incidentes desde PostgreSQL...</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

import { useEffect } from 'react'
import { formatoFecha, nombreEstado, nombrePrioridad, type Incidente } from '../types/incidente'

type Props = { incidente: Incidente | null; cargando: boolean; error: string; onCerrar: () => void }

export function IncidentDetail({ incidente, cargando, error, onCerrar }: Props) {
  useEffect(() => {
    function tecla(e: KeyboardEvent) { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [onCerrar])

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar() }}>
      <div className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div className="detail-head"><div><span className="eyebrow">DETALLE DEL REPORTE</span><h2 id="detail-title">{incidente ? `Incidente #${incidente.id}` : 'Consultando incidente'}</h2></div><button type="button" className="close-button" aria-label="Cerrar detalle" onClick={onCerrar}>×</button></div>
        {cargando && <p className="detail-placeholder">Consultando la información en PostgreSQL...</p>}
        {error && !cargando && <p className="form-error" role="alert">{error}</p>}
        {incidente && !cargando && <div className="detail-body">
          <h3>{incidente.titulo}</h3><div className="detail-badges"><span className={`priority priority-${incidente.prioridad.toLowerCase()}`}><span className="priority-dot" />{nombrePrioridad(incidente.prioridad)}</span><span className={`status status-${incidente.estado.toLowerCase()}`}>{nombreEstado(incidente.estado)}</span></div>
          <h4>Descripción</h4><p className="detail-description">{incidente.descripcion}</p>
          <h4>Información general</h4><dl className="detail-list"><div><dt>Categoría</dt><dd>{incidente.categoria}</dd></div><div><dt>Reportado por</dt><dd>{incidente.usuario_reporta}</dd></div><div><dt>Técnico asignado</dt><dd>{incidente.tecnico_asignado || 'Sin asignar'}</dd></div><div><dt>Fecha de registro</dt><dd>{formatoFecha(incidente.creado_en)}</dd></div><div><dt>Última actualización</dt><dd>{formatoFecha(incidente.actualizado_en)}</dd></div></dl>
          <p className="detail-note">Los cambios de estado y la asignación de técnicos se implementarán en la siguiente etapa.</p>
        </div>}
      </div>
    </div>
  )
}

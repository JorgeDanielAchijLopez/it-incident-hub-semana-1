import { useState, type FormEvent } from 'react'
import { crearIncidente } from '../api/incidentes'
import { PRIORIDADES, type NuevoIncidente, type Incidente } from '../types/incidente'

type Props = { alCrear: (incidente: Incidente) => void; alCancelar: () => void }

const inicial: NuevoIncidente = {
  titulo: '', descripcion: '', categoria: '', prioridad: 'MEDIA', usuario_reporta: '',
}

export function IncidentForm({ alCrear, alCancelar }: Props) {
  const [datos, setDatos] = useState<NuevoIncidente>(inicial)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function cambiar<K extends keyof NuevoIncidente>(campo: K, valor: NuevoIncidente[K]) {
    setDatos((previo) => ({ ...previo, [campo]: valor }))
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError('')
    const limpio: NuevoIncidente = {
      ...datos,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      categoria: datos.categoria.trim(),
      usuario_reporta: datos.usuario_reporta.trim(),
    }
    if (limpio.titulo.length < 5 || limpio.descripcion.length < 10 || limpio.categoria.length < 2 || limpio.usuario_reporta.length < 2) {
      setError('Revisá los campos: título mínimo 5 caracteres, descripción mínimo 10, categoría y usuario mínimo 2.')
      return
    }
    try {
      setGuardando(true)
      const creado = await crearIncidente(limpio)
      alCrear(creado)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar el incidente.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="form-layout">
      <div className="form-card">
        <div className="card-heading"><div><span className="eyebrow">NUEVO REPORTE</span><h2>Registrar incidente</h2><p>Completá la información para enviar el reporte a soporte técnico.</p></div></div>
        <form className="incident-form" onSubmit={(e) => { void enviar(e) }}>
          <div className="form-field"><label htmlFor="titulo">Título del incidente <span>*</span></label><input id="titulo" required maxLength={150} minLength={5} value={datos.titulo} onChange={(e) => cambiar('titulo', e.target.value)} placeholder="Ej. Sin conexión a la red de oficina" /></div>
          <div className="form-field"><label htmlFor="descripcion">Descripción del problema <span>*</span></label><textarea id="descripcion" required minLength={10} rows={5} value={datos.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} placeholder="Describí qué ocurrió, cuándo comenzó y qué equipo está afectado." /></div>
          <div className="field-grid">
            <div className="form-field"><label htmlFor="categoria">Categoría <span>*</span></label><select id="categoria" required value={datos.categoria} onChange={(e) => cambiar('categoria', e.target.value)}><option value="">Seleccionar categoría</option><option value="Hardware">Hardware</option><option value="Software">Software</option><option value="Redes">Redes</option><option value="Accesos">Accesos</option><option value="Seguridad">Seguridad</option><option value="Otros">Otros</option></select></div>
            <div className="form-field"><label htmlFor="prioridad">Prioridad <span>*</span></label><select id="prioridad" required value={datos.prioridad} onChange={(e) => cambiar('prioridad', e.target.value as NuevoIncidente['prioridad'])}>{PRIORIDADES.map((p) => <option value={p} key={p}>{p === 'CRITICA' ? 'CRÍTICA' : p}</option>)}</select></div>
          </div>
          <div className="form-field"><label htmlFor="usuario">Usuario que reporta <span>*</span></label><input id="usuario" required maxLength={120} minLength={2} value={datos.usuario_reporta} onChange={(e) => cambiar('usuario_reporta', e.target.value)} placeholder="Nombre de quien reporta el incidente" /></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={alCancelar} disabled={guardando}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar incidente'} <span aria-hidden="true">↗</span></button></div>
        </form>
      </div>
      <aside className="form-help"><div className="help-symbol">✦</div><h3>Antes de enviar</h3><p>Describí el problema con claridad para facilitar su seguimiento.</p><ul><li>Indicá el equipo o servicio afectado.</li><li>Seleccioná la prioridad apropiada.</li><li>El sistema asignará el estado <strong>NUEVO</strong>.</li><li>Podrás consultar el reporte en el listado.</li></ul><div className="tip-box"><strong>Registro seguro</strong><span>Tu solicitud se validará y guardará directamente en PostgreSQL mediante la API REST.</span></div></aside>
    </section>
  )
}

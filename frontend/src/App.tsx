import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listarIncidentes, obtenerIncidente } from './api/incidentes'
import { MetricCards } from './components/MetricCards'
import { IncidentForm } from './components/IncidentForm'
import { IncidentTable } from './components/IncidentTable'
import { IncidentDetail } from './components/IncidentDetail'
import type { Estado, Incidente, Prioridad } from './types/incidente'
import './App.css'

type Vista = 'dashboard' | 'nuevo'

export default function App() {
  const [vista, setVista] = useState<Vista>('dashboard')
  const [incidentes, setIncidentes] = useState<Incidente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'TODOS'>('TODOS')
  const [filtroPrioridad, setFiltroPrioridad] = useState<Prioridad | 'TODAS'>('TODAS')
  const [aviso, setAviso] = useState('')
  const [seleccionId, setSeleccionId] = useState<number | null>(null)
  const [seleccionado, setSeleccionado] = useState<Incidente | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState('')
  const peticionDetalle = useRef<AbortController | null>(null)

  const cargar = useCallback(async (signal?: AbortSignal) => {
    try {
      setCargando(true)
      setError('')
      const lista = await listarIncidentes(signal)
      if (!signal?.aborted) setIncidentes(lista)
    } catch (e) {
      if (!signal?.aborted) setError(e instanceof Error ? e.message : 'No se pudo consultar la API.')
    } finally {
      if (!signal?.aborted) setCargando(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void listarIncidentes(controller.signal)
      .then((lista) => { if (!controller.signal.aborted) setIncidentes(lista) })
      .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se pudo consultar la API.') })
      .finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [])

  async function abrirDetalle(id: number) {
    peticionDetalle.current?.abort()
    const controller = new AbortController()
    peticionDetalle.current = controller
    setSeleccionId(id)
    setCargandoDetalle(true)
    setSeleccionado(null)
    setErrorDetalle('')
    try {
      const detalle = await obtenerIncidente(id, controller.signal)
      if (!controller.signal.aborted) setSeleccionado(detalle)
    } catch (e) {
      if (!controller.signal.aborted) setErrorDetalle(e instanceof Error ? e.message : 'No se pudo consultar el detalle.')
    } finally {
      if (!controller.signal.aborted) setCargandoDetalle(false)
    }
  }

  function cerrarDetalle() {
    peticionDetalle.current?.abort()
    setSeleccionId(null)
  }

  const filtrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es-GT')
    return incidentes.filter((incidente) => {
      const coincideTexto = !consulta || [incidente.titulo, incidente.categoria, incidente.usuario_reporta, String(incidente.id)]
        .some((t) => t.toLocaleLowerCase('es-GT').includes(consulta))
      return coincideTexto && (filtroEstado === 'TODOS' || incidente.estado === filtroEstado) && (filtroPrioridad === 'TODAS' || incidente.prioridad === filtroPrioridad)
    })
  }, [incidentes, busqueda, filtroEstado, filtroPrioridad])

  function registrado(nuevo: Incidente) {
    setIncidentes((previo) => [nuevo, ...previo.filter((i) => i.id !== nuevo.id)])
    setVista('dashboard')
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroPrioridad('TODAS')
    setAviso(`Incidente #${nuevo.id} registrado correctamente en PostgreSQL.`)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">IT<span>.</span></span><div><strong>Incident Hub</strong><span>Gestión de soporte</span></div></div>
      <div className="sidebar-section-label">PLATAFORMA</div>
      <nav aria-label="Menú principal">
        <button className={`nav-link ${vista === 'dashboard' ? 'is-active' : ''}`} onClick={() => setVista('dashboard')}><span aria-hidden="true" className="nav-symbol">▦</span> Panel general</button>
        <button className={`nav-link ${vista === 'nuevo' ? 'is-active' : ''}`} onClick={() => setVista('nuevo')}><span aria-hidden="true" className="nav-symbol">⊕</span> Nuevo incidente</button>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-status"><span className="online-dot" /> Entorno local</div><p>Proyecto integrador DevOps</p><small>React · Express · PostgreSQL</small></div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><div><span className="crumb">Workspace</span><span className="crumb-separator">/</span><span className="crumb-current">{vista === 'dashboard' ? 'Panel de incidentes' : 'Registrar incidente'}</span></div><div className="topbar-right"><span className={`api-status ${error ? 'offline' : ''}`}><span className="online-dot" />{error ? 'Sin conexión API' : 'API local'}</span><div className="avatar">IT</div></div></header>

      <main className="main-content">
        <div className="page-head"><div><span className="eyebrow">CENTRO DE OPERACIONES TI</span><h1>{vista === 'dashboard' ? 'Panel de incidentes' : 'Nuevo incidente'}</h1><p>{vista === 'dashboard' ? 'Supervisá los reportes tecnológicos de tu organización desde un solo lugar.' : 'Creá un reporte y registralo directamente en la base de datos.'}</p></div>{vista === 'dashboard' && <button className="btn btn-primary create-top" onClick={() => { setAviso(''); setVista('nuevo') }}><span aria-hidden="true">＋</span> Nuevo incidente</button>}</div>

        {aviso && vista === 'dashboard' && <div className="success-banner" role="status"><span>✓</span>{aviso}<button onClick={() => setAviso('')} aria-label="Cerrar aviso">×</button></div>}
        {error && <div className="error-banner" role="alert"><div><strong>No se pudo conectar con la API.</strong><span>Comprobá que PostgreSQL y el backend estén funcionando en el puerto 3000. Detalle: {error}</span></div><button className="btn btn-secondary" onClick={() => { void cargar() }}>Reintentar</button></div>}

        {vista === 'dashboard' ? <>
          <MetricCards incidentes={incidentes} />
          <section className="panel list-panel"><div className="panel-heading"><div><h2>Incidentes registrados</h2><p>Información consultada desde PostgreSQL.</p></div><button className="btn btn-secondary refresh-button" disabled={cargando} onClick={() => { void cargar() }}>↻ Actualizar</button></div>
            <div className="filters"><div className="search-wrap"><span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar incidentes" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por título, ID, categoría o usuario..." /></div>
            <select aria-label="Filtrar por estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as Estado | 'TODOS')}><option value="TODOS">Todos los estados</option><option value="NUEVO">Nuevo</option><option value="ASIGNADO">Asignado</option><option value="EN_PROCESO">En proceso</option><option value="RESUELTO">Resuelto</option><option value="CERRADO">Cerrado</option></select>
            <select aria-label="Filtrar por prioridad" value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value as Prioridad | 'TODAS')}><option value="TODAS">Todas las prioridades</option><option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></div>
            <IncidentTable incidentes={filtrados} cargando={cargando} onAbrir={(id) => { void abrirDetalle(id) }} />
            <div className="table-footer">Mostrando <strong>{filtrados.length}</strong> de <strong>{incidentes.length}</strong> incidentes <span>Datos obtenidos de la API REST</span></div>
          </section>
        </> : <IncidentForm alCrear={registrado} alCancelar={() => setVista('dashboard')} />}
        <footer className="footer">IT Incident Hub <span>·</span> Plataforma de gestión de incidentes <span>·</span> Proyecto DevOps</footer>
      </main>
    </div>
    {seleccionId !== null && <IncidentDetail incidente={seleccionado} cargando={cargandoDetalle} error={errorDetalle} onCerrar={cerrarDetalle} />}
  </div>
}

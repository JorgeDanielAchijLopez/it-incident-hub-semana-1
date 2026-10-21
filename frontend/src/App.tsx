
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  listarIncidentes,
  obtenerIncidente,
} from './api/incidentes'

import {
  obtenerEstadisticas,
  type Estadisticas,
} from './api/estadisticas'

import { MetricCards } from './components/MetricCards'
import { Distribuciones } from './components/Distribuciones'
import { IncidentForm } from './components/IncidentForm'
import { IncidentTable } from './components/IncidentTable'
import { IncidentDetail } from './components/IncidentDetail'

import type {
  Estado,
  Incidente,
  Prioridad,
} from './types/incidente'

import './App.css'

type Vista = 'dashboard' | 'nuevo'

export default function App() {
  const [vista, setVista] = useState<Vista>('dashboard')

  const [incidentes, setIncidentes] = useState<Incidente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [estadisticas, setEstadisticas] =
    useState<Estadisticas | null>(null)

  const [cargandoEstadisticas, setCargandoEstadisticas] =
    useState(true)

  const [errorEstadisticas, setErrorEstadisticas] =
    useState('')

  const [busqueda, setBusqueda] = useState('')

  const [filtroEstado, setFiltroEstado] =
    useState<Estado | 'TODOS'>('TODOS')

  const [filtroPrioridad, setFiltroPrioridad] =
    useState<Prioridad | 'TODAS'>('TODAS')

  const [filtroCategoria, setFiltroCategoria] =
    useState('TODAS')

  const [filtroTecnico, setFiltroTecnico] =
    useState('TODOS')

  const [aviso, setAviso] = useState('')

  const [seleccionId, setSeleccionId] =
    useState<number | null>(null)

  const [seleccionado, setSeleccionado] =
    useState<Incidente | null>(null)

  const [cargandoDetalle, setCargandoDetalle] =
    useState(false)

  const [errorDetalle, setErrorDetalle] = useState('')

  const peticionDetalle =
    useRef<AbortController | null>(null)

  // Consulta manual de incidentes desde PostgreSQL
  const cargar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true)
    setError('')

    try {
      const lista = await listarIncidentes(signal, {
        estado:
          filtroEstado === 'TODOS'
            ? undefined
            : filtroEstado,

        prioridad:
          filtroPrioridad === 'TODAS'
            ? undefined
            : filtroPrioridad,

        categoria:
          filtroCategoria === 'TODAS'
            ? undefined
            : filtroCategoria,

        tecnico:
          filtroTecnico === 'TODOS'
            ? undefined
            : filtroTecnico,
      })

      if (!signal?.aborted) {
        setIncidentes(lista)
      }
    } catch (e) {
      if (!signal?.aborted) {
        setError(
          e instanceof Error
            ? e.message
            : 'No se pudieron consultar los incidentes.'
        )
      }
    } finally {
      if (!signal?.aborted) {
        setCargando(false)
      }
    }
  }, [
    filtroEstado,
    filtroPrioridad,
    filtroCategoria,
    filtroTecnico,
  ])

  // Actualización manual de las estadísticas
  const cargarEstadisticas = useCallback(
    async (signal?: AbortSignal) => {
      setCargandoEstadisticas(true)
      setErrorEstadisticas('')

      try {
        const datos = await obtenerEstadisticas(signal)

        if (!signal?.aborted) {
          setEstadisticas(datos)
        }
      } catch (e) {
        if (!signal?.aborted) {
          setEstadisticas(null)
          setErrorEstadisticas(
            e instanceof Error
              ? e.message
              : 'No se pudieron consultar los indicadores.'
          )
        }
      } finally {
        if (!signal?.aborted) {
          setCargandoEstadisticas(false)
        }
      }
    },
    []
  )

  // Consultar incidentes al iniciar y al cambiar filtros
  // La respuesta asincrónica actualiza el estado.
  useEffect(() => {
    const controller = new AbortController()

    void listarIncidentes(controller.signal, {
      estado:
        filtroEstado === 'TODOS'
          ? undefined
          : filtroEstado,

      prioridad:
        filtroPrioridad === 'TODAS'
          ? undefined
          : filtroPrioridad,

      categoria:
        filtroCategoria === 'TODAS'
          ? undefined
          : filtroCategoria,

      tecnico:
        filtroTecnico === 'TODOS'
          ? undefined
          : filtroTecnico,
    })
      .then((lista) => {
        if (!controller.signal.aborted) {
          setIncidentes(lista)
          setError('')
        }
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            e instanceof Error
              ? e.message
              : 'No se pudieron consultar los incidentes.'
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controller.abort()
  }, [
    filtroEstado,
    filtroPrioridad,
    filtroCategoria,
    filtroTecnico,
  ])

  // Cargar estadísticas desde PostgreSQL al iniciar
  useEffect(() => {
    const controller = new AbortController()

    void obtenerEstadisticas(controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) {
          setEstadisticas(datos)
          setErrorEstadisticas('')
        }
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          setEstadisticas(null)
          setErrorEstadisticas(
            e instanceof Error
              ? e.message
              : 'No se pudieron consultar las estadísticas.'
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargandoEstadisticas(false)
        }
      })

    return () => controller.abort()
  }, [])

  // Actualizar todos los datos del panel
  function actualizarPanel() {
    void cargar()
    void cargarEstadisticas()
  }

  async function abrirDetalle(id: number) {
    peticionDetalle.current?.abort()

    const controller = new AbortController()
    peticionDetalle.current = controller

    setSeleccionId(id)
    setCargandoDetalle(true)
    setSeleccionado(null)
    setErrorDetalle('')

    try {
      const detalle = await obtenerIncidente(
        id,
        controller.signal
      )

      if (!controller.signal.aborted) {
        setSeleccionado(detalle)
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setErrorDetalle(
          e instanceof Error
            ? e.message
            : 'No se pudo consultar el detalle.'
        )
      }
    } finally {
      if (!controller.signal.aborted) {
        setCargandoDetalle(false)
      }
    }
  }

  function cerrarDetalle() {
    peticionDetalle.current?.abort()
    setSeleccionId(null)
  }

  // Mantener la funcionalidad y auditoría de AB#13
  function incidenteActualizado(actualizado: Incidente) {
    setSeleccionado(actualizado)

    setIncidentes((anteriores) =>
      anteriores.map((incidente) =>
        incidente.id === actualizado.id
          ? actualizado
          : incidente
      )
    )

    setAviso(
      `Incidente #${actualizado.id} actualizado correctamente.`
    )

    void cargar()
    void cargarEstadisticas()
  }

  // Búsqueda de texto sobre los resultados de la API
  const filtrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es-GT')

    return incidentes.filter((incidente) => {
      if (!consulta) return true

      return [
        incidente.titulo,
        incidente.categoria,
        incidente.usuario_reporta,
        incidente.tecnico_asignado || '',
        String(incidente.id),
      ].some((texto) =>
        texto.toLocaleLowerCase('es-GT').includes(consulta)
      )
    })
  }, [incidentes, busqueda])

  const categorias = estadisticas?.por_categoria ?? []
  const tecnicos = estadisticas?.por_tecnico ?? []

  // Restablecer los filtros
  function limpiarFiltros() {
    const habiaFiltros =
      filtroEstado !== 'TODOS' ||
      filtroPrioridad !== 'TODAS' ||
      filtroCategoria !== 'TODAS' ||
      filtroTecnico !== 'TODOS'

    if (habiaFiltros) {
      setCargando(true)
    }

    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroPrioridad('TODAS')
    setFiltroCategoria('TODAS')
    setFiltroTecnico('TODOS')
    setError('')
  }

  // Refrescar indicadores después de crear un incidente
  function registrado(nuevo: Incidente) {
    setIncidentes((previo) => [
      nuevo,
      ...previo.filter((i) => i.id !== nuevo.id),
    ])

    setVista('dashboard')
    limpiarFiltros()

    setAviso(
      `Incidente #${nuevo.id} registrado correctamente en PostgreSQL.`
    )

    void cargarEstadisticas()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            IT<span>.</span>
          </span>
          <div>
            <strong>Incident Hub</strong>
            <span>Gestión de soporte</span>
          </div>
        </div>

        <div className="sidebar-section-label">
          PLATAFORMA
        </div>

        <nav aria-label="Menú principal">
          <button
            className={`nav-link ${
              vista === 'dashboard' ? 'is-active' : ''
            }`}
            onClick={() => setVista('dashboard')}
          >
            <span
              aria-hidden="true"
              className="nav-symbol"
            >
              ▦
            </span>
            Panel general
          </button>

          <button
            className={`nav-link ${
              vista === 'nuevo' ? 'is-active' : ''
            }`}
            onClick={() => setVista('nuevo')}
          >
            <span
              aria-hidden="true"
              className="nav-symbol"
            >
              ⊕
            </span>
            Nuevo incidente
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="online-dot" />
            Entorno local
          </div>

          <p>Proyecto integrador DevOps</p>
          <small>React · Express · PostgreSQL</small>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="crumb">Workspace</span>
            <span className="crumb-separator">/</span>
            <span className="crumb-current">
              {vista === 'dashboard'
                ? 'Panel de incidentes'
                : 'Registrar incidente'}
            </span>
          </div>

          <div className="topbar-right">
            <span
              className={`api-status ${error ? 'offline' : ''}`}
            >
              <span className="online-dot" />

              {error ? 'Sin conexión API' : 'API local'}
            </span>

            <div className="avatar">IT</div>
          </div>
        </header>

        <main className="main-content">
          <div className="page-head">
            <div>
              <span className="eyebrow">
                CENTRO DE OPERACIONES TI
              </span>

              <h1>
                {vista === 'dashboard'
                  ? 'Panel de incidentes'
                  : 'Nuevo incidente'}
              </h1>

              <p>
                {vista === 'dashboard'
                  ? 'Supervisá los reportes tecnológicos de tu organización desde un solo lugar.'
                  : 'Creá un reporte y registralo directamente en la base de datos.'}
              </p>
            </div>

            {vista === 'dashboard' && (
              <button
                className="btn btn-primary create-top"
                onClick={() => {
                  setAviso('')
                  setVista('nuevo')
                }}
              >
                <span aria-hidden="true">＋</span>
                Nuevo incidente
              </button>
            )}
          </div>

          {aviso && vista === 'dashboard' && (
            <div className="success-banner" role="status">
              <span>✓</span>
              {aviso}

              <button
                onClick={() => setAviso('')}
                aria-label="Cerrar aviso"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <div>
                <strong>No se pudo conectar con la API.</strong>
                <span>{error}</span>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => void cargar()}
              >
                Reintentar
              </button>
            </div>
          )}

          {vista === 'dashboard' ? (
            <>
              {errorEstadisticas && (
                <div className="error-banner" role="alert">
                  <div>
                    <strong>
                      No se pudieron consultar las estadísticas.
                    </strong>
                    <span>{errorEstadisticas}</span>
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={() => void cargarEstadisticas()}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {cargandoEstadisticas && !estadisticas && (
                <p role="status">
                  Consultando indicadores de PostgreSQL...
                </p>
              )}

              {estadisticas && (
                <>
                  <MetricCards
                    incidentes={incidentes}
                    estadisticas={estadisticas}
                  />

                  <Distribuciones
                    estadisticas={estadisticas}
                  />
                </>
              )}

              <section className="panel list-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Incidentes registrados</h2>
                    <p>
                      Filtros consultados directamente en PostgreSQL.
                    </p>
                  </div>

                  <button
                    className="btn btn-secondary refresh-button"
                    disabled={cargando || cargandoEstadisticas}
                    onClick={actualizarPanel}
                  >
                    ↻ Actualizar
                  </button>
                </div>

                <div className="filters">
                  <div className="search-wrap">
                    <span aria-hidden="true">⌕</span>

                    <input
                      type="search"
                      aria-label="Buscar incidentes"
                      value={busqueda}
                      onChange={(e) =>
                        setBusqueda(e.target.value)
                      }
                      placeholder="Buscar por título, ID, categoría, técnico o usuario..."
                    />
                  </div>

                  <select
                    aria-label="Filtrar por estado"
                    value={filtroEstado}
                    onChange={(e) => {
                      setCargando(true)
                      setError('')
                      setFiltroEstado(
                        e.target.value as Estado | 'TODOS'
                      )
                    }}
                  >
                    <option value="TODOS">
                      Todos los estados
                    </option>
                    <option value="NUEVO">Nuevo</option>
                    <option value="ASIGNADO">Asignado</option>
                    <option value="EN_PROCESO">
                      En proceso
                    </option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>

                  <select
                    aria-label="Filtrar por prioridad"
                    value={filtroPrioridad}
                    onChange={(e) => {
                      setCargando(true)
                      setError('')
                      setFiltroPrioridad(
                        e.target.value as Prioridad | 'TODAS'
                      )
                    }}
                  >
                    <option value="TODAS">
                      Todas las prioridades
                    </option>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>

                  <select
                    aria-label="Filtrar por categoría"
                    value={filtroCategoria}
                    onChange={(e) => {
                      setCargando(true)
                      setError('')
                      setFiltroCategoria(e.target.value)
                    }}
                  >
                    <option value="TODAS">
                      Todas las categorías
                    </option>

                    {categorias.map((item) => (
                      <option
                        key={item.categoria}
                        value={item.categoria}
                      >
                        {item.categoria}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filtrar por técnico"
                    value={filtroTecnico}
                    onChange={(e) => {
                      setCargando(true)
                      setError('')
                      setFiltroTecnico(e.target.value)
                    }}
                  >
                    <option value="TODOS">
                      Todos los técnicos
                    </option>

                    {tecnicos.map((item) => (
                      <option
                        key={item.tecnico}
                        value={
                          item.tecnico === 'Sin asignar'
                            ? 'SIN_ASIGNAR'
                            : item.tecnico
                        }
                      >
                        {item.tecnico}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                </div>

                <IncidentTable
                  incidentes={cargando ? [] : filtrados}
                  cargando={cargando}
                  onAbrir={(id) => {
                    void abrirDetalle(id)
                  }}
                />

                <div className="table-footer">
                  Mostrando{' '}
                  <strong>
                    {cargando ? '...' : filtrados.length}
                  </strong>{' '}
                  incidentes

                  <span>
                    Total en el sistema:{' '}
                    {estadisticas?.total ?? '...'}
                  </span>
                </div>
              </section>
            </>
          ) : (
            <IncidentForm
              alCrear={registrado}
              alCancelar={() => setVista('dashboard')}
            />
          )}

          <footer className="footer">
            IT Incident Hub <span>·</span>
            Plataforma de gestión de incidentes <span>·</span>
            Proyecto DevOps
          </footer>
        </main>
      </div>

      {seleccionId !== null && (
        <IncidentDetail
          incidente={seleccionado}
          cargando={cargandoDetalle}
          error={errorDetalle}
          onCerrar={cerrarDetalle}
          onActualizado={incidenteActualizado}
        />
      )}
    </div>
  )
}
